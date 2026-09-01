import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { limitOr429 } from "@/lib/rateLimit";

function orderSummary(order: { id: string; status: string; totalAmount: number; customerName: string; customerEmail: string }) {
  return {
    id: order.id,
    status: order.status,
    totalAmount: order.totalAmount,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
  };
}

export async function POST(req: Request) {
  try {
    // 20 verifications per 10 minutes per IP — enough for retries from the
    // success page, slow enough to block reference probing.
    const limited = limitOr429(req, "verify", 20, 10 * 60 * 1000);
    if (limited) return limited;

    const body = await req.json();
    const { reference, orderId } = body;

    if (!reference || !orderId) {
      return NextResponse.json({ error: "Reference and orderId are required." }, { status: 400 });
    }

    const order = await db.order.findUnique({ where: { id: orderId } });
    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    // Already confirmed (e.g. by the Paystack webhook) — idempotent success
    if (order.status === "PAID") {
      return NextResponse.json({ success: true, order: orderSummary(order) });
    }

    const secretKey = process.env.PAYSTACK_SECRET_KEY;

    // Mock references are only accepted when running locally without Paystack
    // keys — never in production, never when real verification is possible.
    if (reference.startsWith("MOCK-")) {
      if (process.env.NODE_ENV === "production" || secretKey) {
        return NextResponse.json({ error: "Payment verification failed." }, { status: 400 });
      }
      const updatedOrder = await db.order.update({
        where: { id: orderId },
        data: { status: "PAID" },
      });
      return NextResponse.json({ success: true, order: orderSummary(updatedOrder) });
    }

    // Real reference — fail closed when verification isn't configured
    if (!secretKey) {
      return NextResponse.json({ error: "Payment verification is not configured." }, { status: 503 });
    }

    // The reference must belong to this order, so one real payment cannot be
    // replayed against a different (more expensive) order.
    if (reference !== order.paystackRef) {
      return NextResponse.json({ error: "Reference does not match this order." }, { status: 400 });
    }

    // Direct server-to-server verification call to official Paystack API
    const paystackRes = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${secretKey}`,
      },
    });

    const paystackData = await paystackRes.json();

    if (!paystackRes.ok || !paystackData.status || paystackData.data?.status !== "success") {
      return NextResponse.json({ error: "Payment verification failed with payment gateway." }, { status: 400 });
    }

    // Verify amount (Paystack amount is in kobo, so totalAmount * 100)
    const expectedKobo = order.totalAmount * 100;
    if (paystackData.data.amount < expectedKobo) {
      return NextResponse.json({ error: "Paid amount does not match order total." }, { status: 400 });
    }

    const updatedOrder = await db.order.update({
      where: { id: orderId },
      data: {
        status: "PAID",
      },
    });

    return NextResponse.json({
      success: true,
      order: orderSummary(updatedOrder),
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json({ error: "Failed to verify payment." }, { status: 500 });
  }
}
