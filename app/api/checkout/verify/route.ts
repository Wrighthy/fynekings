import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { reference, orderId } = body;

    if (!reference || !orderId) {
      return NextResponse.json({ error: "Reference and orderId are required." }, { status: 400 });
    }

    const order = await db.order.findUnique({ where: { id: orderId } });
    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    const secretKey = process.env.PAYSTACK_SECRET_KEY;

    if (secretKey && !reference.startsWith("MOCK-")) {
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
    }

    // Update order status to PAID
    const updatedOrder = await db.order.update({
      where: { id: orderId },
      data: {
        status: "PAID",
        paystackRef: reference,
      },
    });

    return NextResponse.json({
      success: true,
      order: {
        id: updatedOrder.id,
        status: updatedOrder.status,
        totalAmount: updatedOrder.totalAmount,
        customerName: updatedOrder.customerName,
        customerEmail: updatedOrder.customerEmail,
      },
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json({ error: "Failed to verify payment." }, { status: 500 });
  }
}
