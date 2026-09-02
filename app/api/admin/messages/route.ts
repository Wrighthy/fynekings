import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/adminAuth";

export async function GET() {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const messages = await db.contactMessage.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
    });
    return NextResponse.json({ messages });
  } catch (error) {
    console.error("Admin messages GET error:", error);
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const body = await req.json();
    const { messageId, handled } = body;

    if (!messageId) {
      return NextResponse.json({ error: "messageId is required." }, { status: 400 });
    }
    if (typeof handled !== "boolean") {
      return NextResponse.json({ error: "handled must be a boolean." }, { status: 400 });
    }

    const updated = await db.contactMessage.update({
      where: { id: messageId },
      data: { handled },
    });

    return NextResponse.json({ success: true, message: updated });
  } catch (error) {
    console.error("Admin message PATCH error:", error);
    return NextResponse.json({ error: "Failed to update message." }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Message id is required." }, { status: 400 });
    }

    await db.contactMessage.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin message DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete message." }, { status: 500 });
  }
}
