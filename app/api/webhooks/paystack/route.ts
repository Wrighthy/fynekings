import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-paystack-signature");
    const secretKey = process.env.PAYSTACK_SECRET_KEY;

    if (secretKey && signature) {
      const hash = crypto.createHmac("sha512", secretKey).update(rawBody).digest("hex");
      if (hash !== signature) {
        return NextResponse.json({ error: "Invalid Paystack signature" }, { status: 400 });
      }
    }

    const event = JSON.parse(rawBody);

    if (event.event === "charge.success") {
      const reference = event.data?.reference;
      if (reference) {
        const order = await db.order.findFirst({ where: { paystackRef: reference } });
        if (order && order.status === "PENDING") {
          await db.order.update({
            where: { id: order.id },
            data: { status: "PAID" },
          });
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Paystack webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
