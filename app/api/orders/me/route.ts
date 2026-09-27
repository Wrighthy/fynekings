import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/sessionAuth";

// GET /api/orders/me — Retrieve authenticated customer's own order history
export async function GET() {
  try {
    const { user, errorResponse } = await requireAuth();
    if (errorResponse || !user) return errorResponse;

    const orders = await db.order.findMany({
      where: {
        OR: [
          { userId: user.id },
          { customerEmail: user.email.toLowerCase() },
        ],
      },
      orderBy: { createdAt: "desc" },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            series: true,
            images: true,
          },
        },
      },
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error("Fetch orders error:", error);
    return NextResponse.json({ error: "Failed to fetch orders." }, { status: 500 });
  }
}
