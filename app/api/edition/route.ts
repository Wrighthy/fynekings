import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const edition = await db.limitedEdition.findFirst({
      where: { active: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(edition, {
      headers: {
        "Cache-Control": "s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    console.error("Edition fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch edition" },
      { status: 500 }
    );
  }
}