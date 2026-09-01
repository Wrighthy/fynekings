import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/adminAuth";

export async function GET() {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

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
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

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
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const body = await req.json();
    const { subject, messageHtml } = body;

    if (!subject || !messageHtml) {
      return NextResponse.json({ error: "Subject and content are required." }, { status: 400 });
    }

    const subscribers = await db.newsletterSubscriber.findMany({ select: { email: true } });
    const recipientEmails = subscribers.map((s) => s.email);

    if (recipientEmails.length === 0) {
      return NextResponse.json({ error: "No subscribers to send to." }, { status: 400 });
    }

    // Real dispatch requires Resend to be configured. Without keys we fall
    // back to the old simulated log and say so in the response — never
    // claim a send that didn't happen.
    if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM_EMAIL) {
      console.log(
        `[EMAIL BROADCAST — SIMULATED, RESEND_API_KEY/RESEND_FROM_EMAIL not set] Subject: "${subject}" | Recipients: ${recipientEmails.length}`
      );
      return NextResponse.json({
        success: true,
        simulated: true,
        recipientCount: recipientEmails.length,
        message: `Resend is not configured (set RESEND_API_KEY and RESEND_FROM_EMAIL) — nothing was actually sent to ${recipientEmails.length} subscribers.`,
      });
    }

    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);
    const from = process.env.RESEND_FROM_EMAIL;

    // Wrap the admin's content in the house style and send in chunks —
    // Resend caps recipients per API call.
    const html = `
      <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 40px; background: #0a0a0a; color: #F4EFE4;">
        ${messageHtml}
        <p style="color: #5A5550; font-size: 0.7rem; margin-top: 40px; border-top: 1px solid #2a2a2a; padding-top: 16px;">
          You are receiving this because you subscribed to the Fynekings newsletter.<br/>
          Fynekings International Ltd · Victoria Island, Lagos
        </p>
      </div>
    `;

    const CHUNK_SIZE = 50;
    const failed: string[] = [];
    for (let i = 0; i < recipientEmails.length; i += CHUNK_SIZE) {
      const chunk = recipientEmails.slice(i, i + CHUNK_SIZE);
      const result = await resend.emails.send({
        from,
        to: chunk,
        subject,
        html,
      });
      if (result.error) {
        console.error("Broadcast chunk failed:", result.error, "chunk:", chunk);
        failed.push(...chunk);
      }
    }

    const sent = recipientEmails.length - failed.length;
    if (sent === 0) {
      return NextResponse.json(
        { error: "All sends failed — check RESEND_API_KEY and RESEND_FROM_EMAIL." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      recipientCount: sent,
      message: failed.length
        ? `Sent to ${sent} subscribers; ${failed.length} failed (see server logs).`
        : `Broadcast sent to ${sent} subscribers.`,
    });
  } catch (error) {
    console.error("Admin broadcast error:", error);
    return NextResponse.json({ error: "Failed to send email broadcast." }, { status: 500 });
  }
}
