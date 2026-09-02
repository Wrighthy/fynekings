import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { limitOr429 } from "@/lib/rateLimit";

export async function POST(req: Request) {
  try {
    // Generous — fires on every pageview, so allow 120 per 5 minutes per IP.
    const limited = limitOr429(req, "analytics", 120, 5 * 60 * 1000);
    if (limited) return limited;

    const body = await req.json();
    const { eventName, pageUrl, referrer, sessionId } = body;

    const userAgent = req.headers.get("user-agent") || undefined;

    if (!eventName || !pageUrl) {
      return NextResponse.json({ error: "eventName and pageUrl required." }, { status: 400 });
    }

    await db.analyticsEvent.create({
      data: {
        eventName,
        pageUrl,
        referrer: referrer || null,
        userAgent: userAgent || null,
        sessionId: sessionId || null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    // Non-blocking telemetry error
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
