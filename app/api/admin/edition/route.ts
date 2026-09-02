import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/adminAuth";

export async function GET() {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const edition = await db.limitedEdition.findFirst({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(edition || null);
  } catch (error) {
    console.error("Admin edition fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch edition" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const body = await req.json();
    const { id, name, reference, price, totalStock, soldCount, dropEndsAt, imageUrl, description, active } = body;

    if (!name || !reference || price === undefined || !totalStock) {
      return NextResponse.json({ error: "Missing required edition fields" }, { status: 400 });
    }

    let edition;
    if (id) {
      edition = await db.limitedEdition.update({
        where: { id },
        data: {
          name,
          reference,
          price: parseInt(price, 10),
          totalStock: parseInt(totalStock, 10),
          soldCount: parseInt(soldCount ?? 0, 10),
          dropEndsAt: dropEndsAt ? new Date(dropEndsAt) : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          imageUrl: imageUrl || null,
          description: description || null,
          active: active !== undefined ? Boolean(active) : true,
        },
      });
    } else {
      edition = await db.limitedEdition.create({
        data: {
          name,
          reference,
          price: parseInt(price, 10),
          totalStock: parseInt(totalStock, 10),
          soldCount: parseInt(soldCount ?? 0, 10),
          dropEndsAt: dropEndsAt ? new Date(dropEndsAt) : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          imageUrl: imageUrl || null,
          description: description || null,
          active: active !== undefined ? Boolean(active) : true,
        },
      });
    }

    return NextResponse.json({ success: true, edition });
  } catch (error: any) {
    console.error("Admin edition save error:", error);
    return NextResponse.json({ error: error.message || "Failed to save edition" }, { status: 500 });
  }
}
