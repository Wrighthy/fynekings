import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query") || searchParams.get("id") || "";
    const clean = query.trim();

    if (!clean) {
      return NextResponse.json({ error: "Order ID or email required." }, { status: 400 });
    }

    // Email lookups are enumerable by anyone who knows a customer's email,
    // so they only ever return a sanitized status view — no name, address,
    // or phone. Full details require the order ID or payment reference,
    // which only the customer possesses.
    if (clean.includes("@")) {
      const order = await db.order.findFirst({
        where: { customerEmail: clean.toLowerCase() },
        orderBy: { createdAt: "desc" },
      });

      if (!order) {
        return NextResponse.json({ error: "No order found matching query." }, { status: 404 });
      }

      return NextResponse.json({
        order: {
          id: order.id,
          status: order.status,
          totalAmount: order.totalAmount,
          createdAt: order.createdAt,
        },
      });
    }

    const order = await db.order.findFirst({
      where: {
        OR: [
          { id: clean },
          { paystackRef: clean },
        ],
      },
      include: {
        product: { select: { name: true, series: true, images: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!order) {
      return NextResponse.json({ error: "No order found matching query." }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error("Order tracking API error:", error);
    return NextResponse.json({ error: "Failed to fetch order status." }, { status: 500 });
  }
}
