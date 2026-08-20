import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { items, customerName, customerEmail, customerPhone, shippingAddress, city, country } = body;

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

    const totalAmount = items.reduce((acc: number, item: { amount: number; fee: number }) => acc + item.amount + item.fee, 0);
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
        totalAmount,
        paystackRef,
        userId,
        customConfig: items.some((i: { custom: unknown }) => i.custom) ? items : null,
      },
    });

    return NextResponse.json({
      orderId: order.id,
      paystackRef: order.paystackRef,
      totalAmount: order.totalAmount,
    });
  } catch (error) {
    console.error("Checkout creation error:", error);
    return NextResponse.json({ error: "Failed to create order." }, { status: 500 });
  }
}
