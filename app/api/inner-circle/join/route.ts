import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/sessionAuth";

export async function POST() {
  try {
    const { user, errorResponse } = await requireAuth();
    if (errorResponse || !user) return errorResponse;

    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: {
        isInnerCircle: true,
        innerCircleJoinedAt: new Date(),
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

    return NextResponse.json({
      success: true,
      message: "Successfully enlisted in the FYNEKINGS Inner Circle.",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Inner Circle join error:", error);
    return NextResponse.json(
      { error: "Failed to join the Inner Circle. Please try again." },
      { status: 500 }
    );
  }
}
