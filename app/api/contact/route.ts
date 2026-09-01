import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { limitOr429 } from "@/lib/rateLimit";

export async function POST(req: Request) {
  try {
    // 3 messages per 10 minutes per IP — enough for a real customer, too
    // slow for a spam bot.
    const limited = limitOr429(req, "contact", 3, 10 * 60 * 1000);
    if (limited) return limited;

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }

    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const phone = body.phone ? String(body.phone).trim() : "";
    const subject = String(body.subject || "General Inquiry").trim() || "General Inquiry";
    const message = String(body.message || "").trim();

    if (name.length < 2 || name.length > 60) {
      return NextResponse.json({ error: "Please provide your name." }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Please provide a valid email address." }, { status: 400 });
    }
    if (message.length < 5 || message.length > 2000) {
      return NextResponse.json({ error: "Message must be between 5 and 2000 characters." }, { status: 400 });
    }

    const saved = await db.contactMessage.create({
      data: {
        name,
        email,
        phone: phone || null,
        subject: subject.slice(0, 120),
        message,
      },
    });

    // Optional email notification to the concierge inbox. Best-effort —
    // the message is already safely persisted, so a missing RESEND_API_KEY
    // or a failed send must not fail the request.
    if (process.env.RESEND_API_KEY && process.env.RESEND_FROM_EMAIL && process.env.CONTACT_EMAIL) {
      try {
        const { Resend } = await import("resend");
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL,
          to: process.env.CONTACT_EMAIL,
          replyTo: email,
          subject: `Contact form: ${subject} — ${name}`,
          html: `
            <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 40px; background: #0a0a0a; color: #F4EFE4;">
              <h1 style="color: #C4A962; font-size: 1.5rem; margin-bottom: 8px;">New Contact Message</h1>
              <p style="color: #5A5550; font-size: 0.8rem; margin-bottom: 32px;">Fynekings International · Concierge</p>
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 32px;">
                <tr style="border-bottom: 1px solid #2a2a2a;">
                  <td style="padding: 12px 0; color: #5A5550; font-size: 0.75rem;">Name</td>
                  <td style="padding: 12px 0; color: #F4EFE4; text-align: right;">${name}</td>
                </tr>
                <tr style="border-bottom: 1px solid #2a2a2a;">
                  <td style="padding: 12px 0; color: #5A5550; font-size: 0.75rem;">Email</td>
                  <td style="padding: 12px 0; color: #F4EFE4; text-align: right;">${email}</td>
                </tr>
                <tr style="border-bottom: 1px solid #2a2a2a;">
                  <td style="padding: 12px 0; color: #5A5550; font-size: 0.75rem;">Phone</td>
                  <td style="padding: 12px 0; color: #F4EFE4; text-align: right;">${phone || "Not provided"}</td>
                </tr>
                <tr style="border-bottom: 1px solid #2a2a2a;">
                  <td style="padding: 12px 0; color: #5A5550; font-size: 0.75rem;">Subject</td>
                  <td style="padding: 12px 0; color: #F4EFE4; text-align: right;">${subject}</td>
                </tr>
              </table>
              <div style="border: 1px solid #2a2a2a; padding: 20px; line-height: 1.8; font-size: 0.9rem;">
                ${message.replace(/</g, "&lt;").replace(/\n/g, "<br/>")}
              </div>
              <p style="color: #5A5550; font-size: 0.7rem; margin-top: 24px;">Message ID: ${saved.id} — manage it in the admin dashboard.</p>
            </div>
          `,
        });
      } catch (mailError) {
        console.error("Contact notification email failed (message was saved):", mailError);
      }
    }

    return NextResponse.json({ success: true, message: "Thank you for contacting Fynekings Concierge. Our team will respond within 24 hours." });
  } catch (error) {
    console.error("Contact API error:", error);
    return NextResponse.json({ error: "Failed to dispatch message." }, { status: 500 });
  }
}
