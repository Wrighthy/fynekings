import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { items, customerName, customerEmail, customerPhone, shippingAddress, city, country, promoCode, discountAmount } = body;

    if (!items || !items.length || !customerName || !customerEmail || !shippingAddress || !city) {
      return NextResponse.json({ error: "Missing required checkout fields." }, { status: 400 });
    }

    // Determine optional authenticated user
    let userId: string | null = null;
    try {
      const cookieStore = await cookies();
      const token = cookieStore.get("fynekings_token")?.value;
      if (token) {
        const payloadRaw = Buffer.from(token, "base64url").toString("utf-8");
        const payload = JSON.parse(payloadRaw);
        if (payload.userId && payload.exp > Date.now()) {
          userId = payload.userId;
        }
      }
    } catch {
      // unauthenticated guest
    }

    const calculatedSubtotal = items.reduce((acc: number, item: { amount: number; fee: number }) => acc + item.amount + item.fee, 0);
    const appliedDiscount = discountAmount ? Math.min(discountAmount, calculatedSubtotal) : 0;
    const finalTotal = Math.max(0, calculatedSubtotal - appliedDiscount);

    const paystackRef = `FYN-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    // Create order record
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
        promoCode: promoCode || null,
        paystackRef,
        userId,
        customConfig: items.some((i: { custom: unknown }) => i.custom) ? items : null,
      },
    });

    // If promo code was applied, increment usedCount
    if (promoCode) {
      try {
        await db.promoCode.update({
          where: { code: promoCode },
          data: { usedCount: { increment: 1 } },
        });
      } catch {
        // non-blocking if code deleted
      }
    }

    // Initialize a real Paystack transaction so the customer is charged
    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    const origin = req.headers.get("origin") || new URL(req.url).origin;

    let authorizationUrl: string | null = null;
    if (secretKey) {
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
          reference: paystackRef,
          callback_url: `${origin}/checkout/success?orderId=${order.id}`,
          metadata: { orderId: order.id },
        }),
      });

      const initData = await initRes.json().catch(() => null);
      if (!initRes.ok || !initData?.data?.authorization_url) {
        return NextResponse.json(
          { error: "Failed to initialize payment. Please try again." },
          { status: 502 }
        );
      }
      authorizationUrl = initData.data.authorization_url;
    }

    return NextResponse.json({
      orderId: order.id,
      paystackRef: order.paystackRef,
      totalAmount: order.totalAmount,
      authorizationUrl,
      // Mock mode is only ever used when running locally without Paystack keys
      mock: !secretKey && process.env.NODE_ENV !== "production",
    });
  } catch (error) {
    console.error("Checkout creation error:", error);
    return NextResponse.json({ error: "Failed to create order." }, { status: 500 });
  }
}
