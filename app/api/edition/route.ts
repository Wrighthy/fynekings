import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// Mock data matching seed.js — used when the database is unavailable
const MOCK_EDITION = {
  id: "mock-edition-1",
  name: "Obsidian King",
  reference: "F-OBK/24",
  price: 850000,
  totalStock: 50,
  soldCount: 38,
  dropEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
  active: true,
};

export async function GET() {
  try {
    const edition = await db.limitedEdition.findFirst({
      where: { active: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(edition ?? MOCK_EDITION, {
      headers: {
        "Cache-Control": "s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    console.warn("Database unavailable — serving mock edition:", (error as Error).message);
    return NextResponse.json(MOCK_EDITION, {
      headers: {
        "Cache-Control": "s-maxage=60, stale-while-revalidate=300",
      },
    });
  }
}