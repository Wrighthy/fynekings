import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
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
