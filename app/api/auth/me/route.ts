import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("fynekings_token")?.value;

    if (!token) {
      return NextResponse.json({ user: null });
    }

    const payloadRaw = Buffer.from(token, "base64url").toString("utf-8");
    const payload = JSON.parse(payloadRaw);

    if (payload.exp < Date.now()) {
      return NextResponse.json({ user: null });
    }

    const user = await db.user.findUnique({
      where: { id: payload.userId },
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
