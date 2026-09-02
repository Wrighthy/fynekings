import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { markOrderPaid } from "@/lib/orderFulfillment";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-paystack-signature");
    const secretKey = process.env.PAYSTACK_SECRET_KEY;

    // Fail closed: reject when the signing secret is not configured or the
    // signature header is missing. A missing signature must never skip checks.
    if (!secretKey || !signature) {
      return NextResponse.json({ error: "Unauthorized webhook call." }, { status: 401 });
    }

    const hash = crypto.createHmac("sha512", secretKey).update(rawBody).digest("hex");

    const a = Buffer.from(signature);
    const b = Buffer.from(hash);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
      return NextResponse.json({ error: "Invalid Paystack signature" }, { status: 401 });
    }

    const event = JSON.parse(rawBody);

    if (event.event === "charge.success") {
      const reference = event.data?.reference;
      if (reference) {
        const order = await db.order.findFirst({ where: { paystackRef: reference } });
        if (order && order.status === "PENDING") {
          // Paystack amounts are in kobo — only mark PAID when the full
          // order total was actually received.
          if (typeof event.data.amount === "number" && event.data.amount < order.totalAmount * 100) {
            console.error(`Paystack webhook amount mismatch for order ${order.id}: paid ${event.data.amount} kobo, expected ${order.totalAmount * 100}`);
            return NextResponse.json({ received: true });
          }
          // Shared fulfillment: status flip + inventory + customer receipt.
          // Idempotent — safe if the redirect verify already confirmed it.
          await markOrderPaid(order.id);
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Paystack webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed." }, { status: 500 });
  }
}
