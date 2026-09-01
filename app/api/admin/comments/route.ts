import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { CommentStatus } from "@prisma/client";

const VALID_STATUSES: CommentStatus[] = ["PENDING", "APPROVED", "REJECTED"];

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const where =
      status && VALID_STATUSES.includes(status as CommentStatus)
        ? { status: status as CommentStatus }
        : {};

    const comments = await db.productComment.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { product: { select: { name: true, slug: true } } },
    });

    return NextResponse.json({ comments });
  } catch (error) {
    console.error("Admin comments GET error:", error);
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { commentId, status } = body;

    if (!commentId) {
      return NextResponse.json({ error: "commentId is required." }, { status: 400 });
    }
    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: "status must be PENDING, APPROVED, or REJECTED." },
        { status: 400 }
      );
    }

    const updated = await db.productComment.update({
      where: { id: commentId },
      data: { status },
    });

    return NextResponse.json({ success: true, comment: updated });
  } catch (error) {
    console.error("Admin comment PATCH error:", error);
    return NextResponse.json({ error: "Failed to update comment." }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Comment id is required." }, { status: 400 });
    }

    await db.productComment.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin comment DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete comment." }, { status: 500 });
  }
}
