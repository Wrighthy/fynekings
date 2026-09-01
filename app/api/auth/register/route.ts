import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import crypto from "crypto";
import { createUserToken } from "@/lib/sessionAuth";

function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, name, phone, shippingAddress, city } = body;

    if (!email || !password || !name) {
      return NextResponse.json({ error: "Name, email, and password are required." }, { status: 400 });
    }

    const existing = await db.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 400 });
    }

    const passwordHash = hashPassword(password);
    const user = await db.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        name,
        phone: phone || null,
        shippingAddress: shippingAddress || null,
        city: city || null,
      },
    });

    // Create signed session token & set HttpOnly cookie
    const sessionToken = createUserToken(user.id, user.email);

    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        shippingAddress: user.shippingAddress,
        city: user.city,
        country: user.country,
      },
    });

    response.cookies.set("fynekings_token", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 3600,
    });

    return response;
  } catch (error) {
    console.error("Register API error:", error);
    return NextResponse.json({ error: "Failed to create account." }, { status: 500 });
  }
}
