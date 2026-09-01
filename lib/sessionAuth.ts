import crypto from "crypto";

// HMAC key for signing user session tokens. Set SESSION_SECRET in production
// (falls back to the admin passkey so one env var is enough to secure both).
function sessionSecret() {
  return process.env.SESSION_SECRET || process.env.ADMIN_PASSKEY || "fynekings-dev-secret";
}

const SESSION_TTL_MS = 7 * 24 * 3600 * 1000;

export type SessionPayload = {
  userId: string;
  email: string;
};

export function createUserToken(userId: string, email: string) {
  const payload = Buffer.from(
    JSON.stringify({ userId, email, exp: Date.now() + SESSION_TTL_MS })
  );
  const signature = crypto
    .createHmac("sha256", sessionSecret())
    .update(payload)
    .digest("base64url");
  return `${payload.toString("base64url")}.${signature}`;
}

// Returns the session payload for a valid, unexpired, correctly-signed token,
// or null for anything else (missing, tampered, expired).
export function verifyUserToken(token: string | undefined): SessionPayload | null {
  if (!token) return null;
  const [payloadB64, signature] = token.split(".");
  if (!payloadB64 || !signature) return null;

  try {
    const expected = crypto
      .createHmac("sha256", sessionSecret())
      .update(Buffer.from(payloadB64, "base64url"))
      .digest("base64url");

    const a = Buffer.from(signature);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

    const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf-8"));
    if (
      payload?.exp === undefined ||
      typeof payload.exp !== "number" ||
      payload.exp <= Date.now() ||
      typeof payload.userId !== "string"
    ) {
      return null;
    }
    return { userId: payload.userId, email: payload.email };
  } catch {
    return null;
  }
}
