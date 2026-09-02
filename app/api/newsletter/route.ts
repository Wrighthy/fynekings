import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { limitOr429 } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  try {
    // 5 signups per hour per IP — plenty for humans, stops list-flooding.
    const limited = limitOr429(req, "newsletter", 5, 60 * 60 * 1000);
    if (limited) return limited;

    const { email } = await req.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Please enter a valid email" },
        { status: 400 }
      );
    }

    const subscriber = await db.newsletterSubscriber.upsert({
      where: { email },
      update: {},
      create: { email },
    });

    return NextResponse.json({
      success: true,
      message: "Welcome to the Collector Club!",
      id: subscriber.id,
    });
  } catch (error) {
    console.error("Newsletter error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}