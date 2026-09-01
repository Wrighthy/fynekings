import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import crypto from "crypto";
import { createUserToken } from "@/lib/sessionAuth";

function verifyPassword(password: string, storedHash: string) {
  const [salt, originalHash] = storedHash.split(":");
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return hash === originalHash;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const user = await db.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user || !verifyPassword(password, user.passwordHash)) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    // Set HttpOnly cookie with an HMAC-signed session token
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
    console.error("Login API error:", error);
    return NextResponse.json({ error: "Failed to sign in." }, { status: 500 });
  }
}
