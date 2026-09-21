import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { markOrderPaid } from "@/lib/orderFulfillment";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-paystack-signature");
    const secretKey = process.env.PAYSTACK_SECRET_KEY || process.env.TEST_SECRET_KEY;

    // Fail closed: reject when signing secret is not configured or signature header is missing
    if (!secretKey || !signature) {
      return NextResponse.json({ error: "Unauthorized webhook call." }, { status: 401 });
    }

    const hash = crypto.createHmac("sha512", secretKey).update(rawBody).digest("hex");

    const a = Buffer.from(signature);
    const b = Buffer.from(hash);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
      return NextResponse.json({ error: "Invalid Paystack signature." }, { status: 401 });
    }

    const event = JSON.parse(rawBody);

    if (event.event === "charge.success") {
      const data = event.data;
      const reference = data?.reference;

      if (reference) {
        // Find order by paystackRef or linked payment reference
        let order = await db.order.findFirst({ where: { paystackRef: reference } });
        let payment = await db.payment.findUnique({ where: { reference } });

        if (!order && payment) {
          order = await db.order.findUnique({ where: { id: payment.orderId } });
        }

        if (order) {
          // Idempotency check: if order is already paid, do not re-process inventory
          if (order.status === "PAID") {
            return NextResponse.json({ received: true });
          }

          // Currency check: must be NGN
          if (data.currency && data.currency !== "NGN") {
            console.error(`Paystack webhook currency mismatch for order ${order.id}: received ${data.currency}, expected NGN`);
            return NextResponse.json({ received: true });
          }

          // Amount check: Paystack amounts are in kobo — only mark PAID when full amount was received
          const expectedKobo = order.totalAmount * 100;
          if (typeof data.amount === "number" && data.amount < expectedKobo) {
            console.error(`Paystack webhook amount mismatch for order ${order.id}: paid ${data.amount} kobo, expected ${expectedKobo}`);
            if (payment) {
              await db.payment.update({
                where: { id: payment.id },
                data: { status: "FAILED", gatewayResponse: `Amount mismatch: paid ${data.amount}, expected ${expectedKobo}` },
              });
            }
            return NextResponse.json({ received: true });
          }

          // Shared fulfillment: status flip + inventory + customer receipt (strictly idempotent)
          await markOrderPaid(order.id, {
            reference,
            channel: data.channel,
            gatewayResponse: data.gateway_response || "Successful",
            paystackPayload: data,
          });
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Paystack webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed." }, { status: 500 });
  }
}
