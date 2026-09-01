import crypto from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

// HMAC key for signing admin session tokens. ADMIN_PASSKEY is required in
// production — there is no hardcoded fallback. Changing the passkey also
// invalidates all existing admin sessions.
function adminSecret() {
  const secret = process.env.ADMIN_PASSKEY;
  if (secret) return secret;
  if (process.env.NODE_ENV === "production") {
    throw new Error("ADMIN_PASSKEY must be set in production");
  }
  return "fynekings-dev-secret"; // local development only
}

const TOKEN_TTL_MS = 7 * 24 * 3600 * 1000;

export function createAdminToken() {
  const payload = Buffer.from(
    JSON.stringify({ admin: true, exp: Date.now() + TOKEN_TTL_MS })
  );
  const signature = crypto
    .createHmac("sha256", adminSecret())
    .update(payload)
    .digest("base64url");
  return `${payload.toString("base64url")}.${signature}`;
}

export function verifyAdminToken(token: string | undefined): boolean {
  if (!token) return false;
  const [payloadB64, signature] = token.split(".");
  if (!payloadB64 || !signature) return false;

  try {
    const expected = crypto
      .createHmac("sha256", adminSecret())
      .update(Buffer.from(payloadB64, "base64url"))
      .digest("base64url");

    const a = Buffer.from(signature);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false;

    const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf-8"));
    return payload?.admin === true && typeof payload.exp === "number" && payload.exp > Date.now();
  } catch {
    return false;
  }
}

// Route-handler guard. Returns a 401 response when the request lacks a valid
// admin session, or null when authorized. Usage:
//   const unauthorized = await requireAdmin();
//   if (unauthorized) return unauthorized;
export async function requireAdmin(): Promise<NextResponse | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("fynekings_admin_token")?.value;
  if (!verifyAdminToken(token)) {
    return NextResponse.json({ error: "Admin authentication required." }, { status: 401 });
  }
  return null;
}
