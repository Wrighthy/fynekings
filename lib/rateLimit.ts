// Simple in-memory rate limiter for public POST endpoints.
//
// Limitations (acceptable at this scale): buckets live per server instance,
// so they reset on cold starts and aren't shared across serverless
// instances — a determined attacker gets slight slack, but casual abuse
// and brute-force attempts are still throttled hard.

import { NextResponse } from "next/server";

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

// Prune expired entries occasionally so the Map can't grow unbounded.
let lastPrune = 0;
function prune(now: number) {
  if (now - lastPrune < 60_000) return;
  lastPrune = now;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

// Extracts the caller IP from x-forwarded-for (first hop) or falls back to
// an "unknown" bucket shared by requests without the header.
export function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}

// Returns true when the request is allowed; increments the counter otherwise.
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  prune(now);

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (bucket.count < limit) {
    bucket.count += 1;
    return true;
  }
  return false;
}

// Convenience wrapper for route handlers: returns a 429 response when the
// caller is over the limit, or null when the request may proceed.
export function limitOr429(
  req: Request,
  scope: string,
  limit: number,
  windowMs: number
): NextResponse | null {
  const allowed = rateLimit(`${scope}:${clientIp(req)}`, limit, windowMs);
  if (allowed) return null;
  return NextResponse.json(
    { error: "Too many requests. Please try again shortly." },
    { status: 429 }
  );
}
