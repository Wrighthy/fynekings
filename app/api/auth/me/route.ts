import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { verifyUserToken } from "@/lib/sessionAuth";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("fynekings_token")?.value;

    const session = verifyUserToken(token);
    if (!session) {
      return NextResponse.json({ user: null });
    }

    const user = await db.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        shippingAddress: true,
        city: true,
        country: true,
        orders: {
          orderBy: { createdAt: "desc" },
          include: { product: true },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ user: null });
  }
}
