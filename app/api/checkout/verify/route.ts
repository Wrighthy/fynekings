import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { limitOr429 } from "@/lib/rateLimit";
import { markOrderPaid } from "@/lib/orderFulfillment";

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
    // 20 verifications per 10 minutes per IP — protects against reference brute-forcing
    const limited = limitOr429(req, "verify", 20, 10 * 60 * 1000);
    if (limited) return limited;

    const body = await req.json();
    const { reference, orderId } = body;

    if (!reference || !orderId) {
      return NextResponse.json({ error: "Reference and orderId are required." }, { status: 400 });
    }

    // 1. Verify order exists
    const order = await db.order.findUnique({ where: { id: orderId } });
    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    // 2. Prevent duplicate processing if already PAID (idempotent success)
    if (order.status === "PAID") {
      return NextResponse.json({
        success: true,
        alreadyConfirmed: true,
        order: orderSummary(order),
      });
    }

    // 3. Verify reference belongs to this order
    const payment = await db.payment.findUnique({ where: { reference } });
    if (payment && payment.orderId !== order.id) {
      return NextResponse.json({ error: "Payment reference does not match this order." }, { status: 400 });
    }
    if (!payment && order.paystackRef !== reference) {
      return NextResponse.json({ error: "Invalid payment reference for this order." }, { status: 400 });
    }

    // If this payment attempt already succeeded
    if (payment && payment.status === "SUCCESS") {
      const updatedOrder = (await markOrderPaid(orderId)) ?? order;
      return NextResponse.json({ success: true, order: orderSummary(updatedOrder) });
    }

    // 4. Secret key check (fail-closed)
    const secretKey = process.env.PAYSTACK_SECRET_KEY || process.env.TEST_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json({ error: "Payment verification service is not configured." }, { status: 503 });
    }

    // 5. Server-to-server verification call to official Paystack API
    const paystackRes = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${secretKey}`,
      },
    });

    const paystackData = await paystackRes.json().catch(() => null);

    // Transaction must exist on Paystack
    if (!paystackRes.ok || !paystackData || !paystackData.status || !paystackData.data) {
      if (payment) {
        await db.payment.update({
          where: { id: payment.id },
          data: { status: "FAILED", gatewayResponse: paystackData?.message || "Transaction not found on gateway" },
        });
      }
      return NextResponse.json({ error: "Transaction verification failed with payment gateway." }, { status: 400 });
    }

    const tx = paystackData.data;

    // Handle cancelled or abandoned transactions
    if (tx.status === "abandoned" || tx.status === "cancelled") {
      if (payment) {
        await db.payment.update({
          where: { id: payment.id },
          data: { status: "CANCELLED", gatewayResponse: tx.gateway_response || tx.status },
        });
      }
      return NextResponse.json(
        { error: "Payment was cancelled or abandoned.", paymentStatus: "CANCELLED" },
        { status: 400 }
      );
    }

    // Must be successful
    if (tx.status !== "success") {
      if (payment) {
        await db.payment.update({
          where: { id: payment.id },
          data: { status: "FAILED", gatewayResponse: tx.gateway_response || tx.status },
        });
      }
      return NextResponse.json(
        { error: `Payment gateway returned status: ${tx.status}`, paymentStatus: "FAILED" },
        { status: 400 }
      );
    }

    // Verify reference matches
    if (tx.reference !== reference) {
      return NextResponse.json({ error: "Gateway reference does not match expected transaction." }, { status: 400 });
    }

    // Verify currency is NGN
    if (tx.currency !== "NGN") {
      if (payment) {
        await db.payment.update({
          where: { id: payment.id },
          data: { status: "FAILED", gatewayResponse: `Invalid currency: ${tx.currency}` },
        });
      }
      return NextResponse.json({ error: "Payment currency mismatch. Expected NGN." }, { status: 400 });
    }

    // Verify amount (Paystack amount is in kobo, so order.totalAmount * 100)
    const expectedKobo = order.totalAmount * 100;
    if (typeof tx.amount !== "number" || tx.amount < expectedKobo) {
      if (payment) {
        await db.payment.update({
          where: { id: payment.id },
          data: { status: "FAILED", gatewayResponse: `Amount mismatch: paid ${tx.amount} kobo, expected ${expectedKobo}` },
        });
      }
      return NextResponse.json({ error: "Paid amount does not match expected order total." }, { status: 400 });
    }

    // 6. Update Payment record status
    if (payment) {
      await db.payment.update({
        where: { id: payment.id },
        data: {
          status: "SUCCESS",
          paidAt: tx.paid_at ? new Date(tx.paid_at) : new Date(),
          channel: tx.channel || null,
          gatewayResponse: tx.gateway_response || "Successful",
          paystackPayload: tx,
        },
      });
    }

    // 7. Fulfill order: status -> PAID, decrement stock, send email (idempotent)
    const updatedOrder = (await markOrderPaid(orderId, {
      reference,
      channel: tx.channel,
      gatewayResponse: tx.gateway_response,
      paystackPayload: tx,
    })) ?? order;

    return NextResponse.json({
      success: true,
      order: orderSummary(updatedOrder),
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json({ error: "Failed to verify payment." }, { status: 500 });
  }
}
