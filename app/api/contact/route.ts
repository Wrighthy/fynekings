import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone, subject, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Name, email, and message are required." }, { status: 400 });
    }

    console.log("Contact form submission received:", { name, email, phone, subject, message, date: new Date().toISOString() });

    return NextResponse.json({ success: true, message: "Thank you for contacting Fynekings Concierge. Our team will respond within 24 hours." });
  } catch (error) {
    console.error("Contact API error:", error);
    return NextResponse.json({ error: "Failed to dispatch message." }, { status: 500 });
  }
}
