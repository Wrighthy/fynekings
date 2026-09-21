import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { verifyUserToken } from "@/lib/sessionAuth";
import { customPrice, paystackFee } from "@/lib/pricing";
import { limitOr429 } from "@/lib/rateLimit";
import { FYNEKINGS_BANK_DETAILS } from "@/lib/bankConfig";

type IncomingItem = {
  name?: unknown;
  series?: unknown;
  custom?: { strapName?: unknown; caseName?: unknown; dialName?: unknown } | null;
};

type PricedItem = {
  name: string;
  series: string;
  amount: number;
  fee: number;
  custom: { strapName: string; caseName: string; dialName: string } | null;
};

export async function POST(req: Request) {
  try {
    // 10 checkout attempts per 10 minutes per IP — blocks order spam and
    // Paystack transaction flooding.
    const limited = limitOr429(req, "checkout", 10, 10 * 60 * 1000);
    if (limited) return limited;

    const body = await req.json();
    const { items, customerName, customerEmail, customerPhone, shippingAddress, city, country, promoCode, paymentMethod } = body;

    if (!items || !items.length || !customerName || !customerEmail || !shippingAddress || !city) {
      return NextResponse.json({ error: "Missing required checkout fields." }, { status: 400 });
    }

    // Determine optional authenticated user
    let userId: string | null = null;
    try {
      const cookieStore = await cookies();
      const token = cookieStore.get("fynekings_token")?.value;
      const session = verifyUserToken(token);
      if (session) {
        userId = session.userId;
      }
    } catch {
      // unauthenticated guest
    }

    // ——— Server-side price recomputation ———
    // Client-sent amounts, fees and discounts are never trusted: catalog
    // prices come from the database and custom builds from the pricing
    // tables, so a tampered cart cannot change what the customer is charged.
    const incomingItems: IncomingItem[] = Array.isArray(items) ? items : [];
    const pricedItems: PricedItem[] = [];

    for (const item of incomingItems) {
      const name = typeof item.name === "string" ? item.name.trim() : "";
      const series = typeof item.series === "string" ? item.series.trim() : "";
      if (!name) {
        return NextResponse.json({ error: "Invalid cart item." }, { status: 400 });
      }

      if (item.custom) {
        const c = item.custom;
        const price = customPrice(String(c.strapName || ""), String(c.caseName || ""), String(c.dialName || ""));
        if (price === null) {
          return NextResponse.json(
            { error: "Invalid custom watch configuration. Please rebuild your custom watch." },
            { status: 400 }
          );
        }
        pricedItems.push({
          name,
          series,
          amount: price,
          fee: paystackFee(price),
          custom: {
            strapName: String(c.strapName || ""),
            caseName: String(c.caseName || ""),
            dialName: String(c.dialName || ""),
          },
        });
      } else {
        // Catalog watch — price comes from the Product table. The limited
        // edition drop ("Reserve Yours Now" on the countdown) is sold under
        // its own table, so fall back to it when no catalog match exists.
        const product = await db.product.findFirst({ where: { name, series } });
        let amount: number | null = product ? product.price : null;
        if (amount === null) {
          const edition = await db.limitedEdition.findFirst({
            where: { name, active: true },
            orderBy: { createdAt: "desc" },
          });
          if (edition) {
            const remaining = edition.totalStock - edition.soldCount;
            if (remaining <= 0 || edition.dropEndsAt < new Date()) {
              return NextResponse.json(
                { error: `The ${edition.name} limited edition is sold out or has ended.` },
                { status: 400 }
              );
            }
            amount = edition.price;
          }
        }
        if (amount === null) {
          return NextResponse.json(
            { error: `"${name}" could not be verified. Please refresh the page and try again.` },
            { status: 400 }
          );
        }
        pricedItems.push({ name, series, amount, fee: paystackFee(amount), custom: null });
      }
    }

    const isBankTransfer = paymentMethod === "bank_transfer";
    const itemsSum = pricedItems.reduce((acc, i) => acc + i.amount, 0);
    const totalFees = isBankTransfer ? 0 : pricedItems.reduce((acc, i) => acc + i.fee, 0);
    const calculatedSubtotal = itemsSum + totalFees;

    // ——— Server-side discount recomputation ———
    // The discount is re-derived from the promo code against the same
    // subtotal basis /api/promo/apply uses (items only, before fees).
    let appliedDiscount = 0;
    let appliedPromoCode: string | null = null;
    if (promoCode) {
      const cleanCode = String(promoCode).trim().toUpperCase();
      const promo = await db.promoCode.findUnique({ where: { code: cleanCode } });

      const promoValid =
        promo &&
        promo.active &&
        (!promo.expiresAt || promo.expiresAt > new Date()) &&
        (!promo.maxUses || promo.usedCount < promo.maxUses) &&
        itemsSum >= promo.minSpend;

      if (!promoValid) {
        return NextResponse.json(
          { error: "The promo code is no longer valid. Please remove it and try again." },
          { status: 400 }
        );
      }

      appliedDiscount =
        promo.discountType === "PERCENTAGE"
          ? Math.round((itemsSum * promo.discountValue) / 100)
          : Math.min(promo.discountValue, itemsSum);
      appliedPromoCode = cleanCode;
    }

    const finalTotal = Math.max(0, calculatedSubtotal - appliedDiscount);

    const paymentRef = isBankTransfer
      ? `FYN-BT-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`
      : `FYN-PAY-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    // Create order record with default PENDING status
    const order = await db.order.create({
      data: {
        customerName,
        customerEmail: customerEmail.toLowerCase(),
        customerPhone: customerPhone || null,
        shippingAddress,
        city,
        country: country || "Nigeria",
        status: "PENDING",
        totalAmount: finalTotal,
        discountAmount: appliedDiscount,
        promoCode: appliedPromoCode,
        paystackRef: paymentRef,
        paymentMethod: isBankTransfer ? "BANK_TRANSFER" : "PAYSTACK",
        userId,
        // Prisma requires JsonNull (not plain null) to store NULL in a Json column
        customConfig: pricedItems.some((i) => i.custom) ? pricedItems : Prisma.JsonNull,
      },
    });

    // Create linked Payment record
    const payment = await db.payment.create({
      data: {
        orderId: order.id,
        reference: paymentRef,
        amount: finalTotal,
        currency: "NGN",
        method: isBankTransfer ? "BANK_TRANSFER" : "PAYSTACK",
        status: "PENDING",
      },
    });

    // If promo code was applied, increment usedCount
    if (appliedPromoCode) {
      try {
        await db.promoCode.update({
          where: { code: appliedPromoCode },
          data: { usedCount: { increment: 1 } },
        });
      } catch {
        // non-blocking if code deleted
      }
    }

    // Direct Bank Transfer flow: order remains PENDING until concierge manually confirms receipt
    if (isBankTransfer) {
      return NextResponse.json({
        orderId: order.id,
        paymentReference: paymentRef,
        paymentMethod: "BANK_TRANSFER",
        totalAmount: order.totalAmount,
        bankDetails: FYNEKINGS_BANK_DETAILS,
      });
    }

    // Paystack payment flow: initialize real Paystack transaction
    const secretKey = process.env.PAYSTACK_SECRET_KEY || process.env.TEST_SECRET_KEY;
    if (!secretKey) {
      await db.payment.update({
        where: { id: payment.id },
        data: { status: "FAILED", gatewayResponse: "Paystack secret key not configured" },
      });
      return NextResponse.json(
        { error: "Payment gateway is not configured on the server." },
        { status: 500 }
      );
    }

    const origin = req.headers.get("origin") || new URL(req.url).origin;

    const initRes = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: customerEmail,
        amount: finalTotal * 100, // Paystack expects kobo
        currency: "NGN",
        reference: paymentRef,
        callback_url: `${origin}/checkout/success?orderId=${order.id}`,
        metadata: {
          orderId: order.id,
          paymentId: payment.id,
        },
        // Channels explicitly restricted: no USSD, no Flutterwave
        channels: ["card", "bank_transfer", "bank"],
      }),
    });

    const initData = await initRes.json().catch(() => null);
    if (!initRes.ok || !initData?.data?.authorization_url) {
      const errMsg = initData?.message || "Failed to initialize Paystack payment. Please try again.";
      await db.payment.update({
        where: { id: payment.id },
        data: { status: "FAILED", gatewayResponse: errMsg },
      });
      return NextResponse.json({ error: errMsg }, { status: 502 });
    }

    return NextResponse.json({
      orderId: order.id,
      paymentReference: paymentRef,
      paymentMethod: "PAYSTACK",
      totalAmount: order.totalAmount,
      authorizationUrl: initData.data.authorization_url,
    });
  } catch (error) {
    console.error("Checkout creation error:", error);
    return NextResponse.json({ error: "Failed to create order." }, { status: 500 });
  }
}
