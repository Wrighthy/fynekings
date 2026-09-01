import crypto from "crypto";

// HMAC key for signing admin session tokens. Set ADMIN_PASSKEY in production;
// tokens are signed with it, so changing the passkey invalidates old sessions.
function adminSecret() {
  return process.env.ADMIN_PASSKEY || "fynekings-dev-secret";
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
