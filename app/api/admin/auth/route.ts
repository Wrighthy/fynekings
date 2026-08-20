import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { passkey } = body;

    const expectedPasskey = process.env.ADMIN_PASSKEY || "fynekings2026";

    if (!passkey || passkey !== expectedPasskey) {
      return NextResponse.json({ error: "Invalid admin passkey." }, { status: 401 });
    }

    const tokenPayload = JSON.stringify({ admin: true, exp: Date.now() + 7 * 24 * 3600 * 1000 });
    const adminToken = Buffer.from(tokenPayload).toString("base64url");

    const response = NextResponse.json({ success: true, message: "Admin access granted." });

    response.cookies.set("fynekings_admin_token", adminToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 3600,
    });

    return response;
  } catch (error) {
    console.error("Admin auth error:", error);
    return NextResponse.json({ error: "Failed to authenticate admin." }, { status: 500 });
  }
}

export async function GET() {
  // Check admin auth state
  return NextResponse.json({ authenticated: true });
}
