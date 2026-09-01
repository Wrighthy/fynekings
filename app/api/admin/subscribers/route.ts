import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const subscribers = await db.newsletterSubscriber.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ subscribers });
  } catch (error) {
    console.error("Admin subscribers GET error:", error);
    return NextResponse.json({ error: "Failed to fetch subscribers" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Subscriber id is required." }, { status: 400 });
    }

    await db.newsletterSubscriber.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin subscriber DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete subscriber." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { subject, messageHtml } = body;

    if (!subject || !messageHtml) {
      return NextResponse.json({ error: "Subject and content are required." }, { status: 400 });
    }

    const subscribers = await db.newsletterSubscriber.findMany({ select: { email: true } });
    const recipientEmails = subscribers.map((s) => s.email);

    // Simulated broadcast dispatch logging
    console.log(`[EMAIL BROADCAST] Subject: "${subject}" | Recipients: ${recipientEmails.length}`);

    return NextResponse.json({
      success: true,
      recipientCount: recipientEmails.length,
      message: `Broadcast queued successfully to ${recipientEmails.length} subscribers.`,
    });
  } catch (error) {
    console.error("Admin broadcast error:", error);
    return NextResponse.json({ error: "Failed to send email broadcast." }, { status: 500 });
  }
}
