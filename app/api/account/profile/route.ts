import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/sessionAuth";

// GET /api/account/profile
export async function GET() {
  try {
    const { user, errorResponse } = await requireAuth();
    if (errorResponse || !user) return errorResponse;

    const fullUser = await db.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        shippingAddress: true,
        city: true,
        country: true,
        isInnerCircle: true,
        innerCircleJoinedAt: true,
        createdAt: true,
        orders: {
          orderBy: { createdAt: "desc" },
          include: { product: true },
        },
      },
    });

    return NextResponse.json({ user: fullUser });
  } catch (error) {
    console.error("Fetch profile error:", error);
    return NextResponse.json({ error: "Failed to fetch profile." }, { status: 500 });
  }
}

// PATCH /api/account/profile — Update customer's own shipping/contact info
export async function PATCH(req: Request) {
  try {
    const { user, errorResponse } = await requireAuth();
    if (errorResponse || !user) return errorResponse;

    const body = await req.json();
    const { name, phone, shippingAddress, city, country } = body;

    const updated = await db.user.update({
      where: { id: user.id },
      data: {
        ...(name ? { name } : {}),
        ...(phone !== undefined ? { phone } : {}),
        ...(shippingAddress !== undefined ? { shippingAddress } : {}),
        ...(city !== undefined ? { city } : {}),
        ...(country !== undefined ? { country } : {}),
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        shippingAddress: true,
        city: true,
        country: true,
        isInnerCircle: true,
        innerCircleJoinedAt: true,
      },
    });

    return NextResponse.json({ success: true, user: updated });
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json({ error: "Failed to update profile." }, { status: 500 });
  }
}
