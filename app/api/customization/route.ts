import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Resend } from "resend";

export const dynamic = "force-dynamic";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const {
            baseWatchId,
            baseWatchName,
            strapName,
            caseName,
            dialName,
            strapExtra,
            caseExtra,
            dialExtra,
            totalPrice,
            customerName,
            customerEmail,
            customerPhone,
            notes,
        } = body;

        // Save to database
        const customization = await db.customization.create({
            data: {
                strapName,
                caseName,
                dialName,
                strapExtra: strapExtra || 0,
                caseExtra: caseExtra || 0,
                dialExtra: dialExtra || 0,
                totalPrice,
                sessionId: baseWatchId,
            },
        });

        // Send email to you
        await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL!,
            to: process.env.CONTACT_EMAIL!,
            subject: `New Custom Watch Configuration — ${baseWatchName}`,
            html: `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 40px; background: #0a0a0a; color: #F4EFE4;">
          <h1 style="color: #C4A962; font-size: 1.8rem; margin-bottom: 8px;">New Custom Configuration</h1>
          <p style="color: #5A5550; font-size: 0.8rem; margin-bottom: 32px;">Fynekings International · Lagos</p>
          
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 32px;">
            <tr style="border-bottom: 1px solid #2a2a2a;">
              <td style="padding: 12px 0; color: #5A5550; font-size: 0.75rem;">Base Watch</td>
              <td style="padding: 12px 0; color: #F4EFE4; text-align: right;">${baseWatchName}</td>
            </tr>
            <tr style="border-bottom: 1px solid #2a2a2a;">
              <td style="padding: 12px 0; color: #5A5550; font-size: 0.75rem;">Strap</td>
              <td style="padding: 12px 0; color: #F4EFE4; text-align: right;">${strapName}</td>
            </tr>
            <tr style="border-bottom: 1px solid #2a2a2a;">
              <td style="padding: 12px 0; color: #5A5550; font-size: 0.75rem;">Case Finish</td>
              <td style="padding: 12px 0; color: #F4EFE4; text-align: right;">${caseName}</td>
            </tr>
            <tr style="border-bottom: 1px solid #2a2a2a;">
              <td style="padding: 12px 0; color: #5A5550; font-size: 0.75rem;">Dial Style</td>
              <td style="padding: 12px 0; color: #F4EFE4; text-align: right;">${dialName}</td>
            </tr>
            <tr style="border-bottom: 1px solid #2a2a2a;">
              <td style="padding: 12px 0; color: #C4A962; font-size: 0.75rem; font-weight: bold;">Total Price</td>
              <td style="padding: 12px 0; color: #C4A962; text-align: right; font-weight: bold;">₦${totalPrice.toLocaleString()}</td>
            </tr>
          </table>

          <h2 style="color: #C4A962; font-size: 1.2rem; margin-bottom: 16px;">Customer Details</h2>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 32px;">
            <tr style="border-bottom: 1px solid #2a2a2a;">
              <td style="padding: 12px 0; color: #5A5550; font-size: 0.75rem;">Name</td>
              <td style="padding: 12px 0; color: #F4EFE4; text-align: right;">${customerName || "Not provided"}</td>
            </tr>
            <tr style="border-bottom: 1px solid #2a2a2a;">
              <td style="padding: 12px 0; color: #5A5550; font-size: 0.75rem;">Email</td>
              <td style="padding: 12px 0; color: #F4EFE4; text-align: right;">${customerEmail || "Not provided"}</td>
            </tr>
            <tr style="border-bottom: 1px solid #2a2a2a;">
              <td style="padding: 12px 0; color: #5A5550; font-size: 0.75rem;">Phone</td>
              <td style="padding: 12px 0; color: #F4EFE4; text-align: right;">${customerPhone || "Not provided"}</td>
            </tr>
            ${notes ? `<tr><td style="padding: 12px 0; color: #5A5550; font-size: 0.75rem;">Notes</td><td style="padding: 12px 0; color: #F4EFE4; text-align: right;">${notes}</td></tr>` : ""}
          </table>

          <p style="color: #5A5550; font-size: 0.7rem;">Configuration ID: ${customization.id}</p>
        </div>
      `,
        });

        // Send confirmation email to customer
        if (customerEmail) {
            await resend.emails.send({
                from: process.env.RESEND_FROM_EMAIL!,
                to: customerEmail,
                subject: `Your Fynekings Custom Configuration — ${baseWatchName}`,
                html: `
          <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 40px; background: #0a0a0a; color: #F4EFE4;">
            <h1 style="color: #C4A962; font-size: 1.8rem; margin-bottom: 8px;">Configuration Received</h1>
            <p style="color: #5A5550; font-size: 0.8rem; margin-bottom: 24px;">Fynekings International · Lagos</p>
            <p style="color: #F4EFE4; line-height: 1.8; margin-bottom: 24px;">
              Thank you ${customerName ? `, ${customerName}` : ""}. We've received your custom watch configuration and our atelier team will review it within 24 hours.
            </p>
            <p style="color: #C4A962; font-size: 0.85rem; margin-bottom: 32px;">
              Base: ${baseWatchName} · ${strapName} strap · ${caseName} case · ${dialName} dial<br/>
              Total: ₦${totalPrice.toLocaleString()}
            </p>
            <p style="color: #5A5550; font-size: 0.7rem;">
              Questions? Reply to this email or WhatsApp us.<br/>
              Fynekings International Ltd · Victoria Island, Lagos
            </p>
          </div>
        `,
            });
        }

        return NextResponse.json({ success: true, id: customization.id });
    } catch (error) {
        console.error("Customization error:", error);
        return NextResponse.json({ error: "Failed to save configuration" }, { status: 500 });
    }
}

export async function GET() {
    try {
        const customizations = await db.customization.findMany({
            orderBy: { createdAt: "desc" },
            take: 50,
        });
        return NextResponse.json(customizations);
    } catch {
        return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
    }
}