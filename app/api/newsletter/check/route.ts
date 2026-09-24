import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email")?.toLowerCase().trim();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ enrolled: false });
    }

    // Check NewsletterSubscriber table (guest signups)
    const subscriber = await db.newsletterSubscriber.findUnique({
      where: { email },
      select: { id: true },
    });

    if (subscriber) {
      return NextResponse.json({ enrolled: true, source: "newsletter" });
    }

    // Also check registered User accounts that are in the Inner Circle
    const user = await db.user.findUnique({
      where: { email },
      select: { isInnerCircle: true },
    });

    if (user?.isInnerCircle) {
      return NextResponse.json({ enrolled: true, source: "inner-circle" });
    }

    return NextResponse.json({ enrolled: false });
  } catch (error) {
    console.error("Newsletter check error:", error);
    return NextResponse.json({ enrolled: false });
  }
}
