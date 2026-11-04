import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";

    if (!query.trim()) {
      return NextResponse.json({ products: [] });
    }

    const products = await db.product.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { series: { contains: query, mode: "insensitive" } },
          { tag: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
          { movement: { contains: query, mode: "insensitive" } },
          { strapMaterial: { contains: query, mode: "insensitive" } },
          { style: { contains: query, mode: "insensitive" } },
        ],
      },
      take: 12,
    });

    return NextResponse.json({ products });
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json({ error: "Failed to search products" }, { status: 500 });
  }
}
