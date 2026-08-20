import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query") || searchParams.get("id") || "";

    if (!query.trim()) {
      return NextResponse.json({ error: "Order ID or email required." }, { status: 400 });
    }

    const order = await db.order.findFirst({
      where: {
        OR: [
          { id: query },
          { paystackRef: query },
          { customerEmail: query.toLowerCase() },
        ],
      },
      include: {
        product: true,
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
