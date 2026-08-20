import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const promos = await db.promoCode.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ promos });
  } catch (error) {
    console.error("Admin promos GET error:", error);
    return NextResponse.json({ error: "Failed to fetch promos" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { code, discountType, discountValue, minSpend, maxUses, expiresAt } = body;

    if (!code || !discountValue) {
      return NextResponse.json({ error: "Promo code and discount value are required." }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase();

    const existing = await db.promoCode.findUnique({ where: { code: cleanCode } });
    if (existing) {
      return NextResponse.json({ error: "A promo code with this name already exists." }, { status: 400 });
    }

    const promo = await db.promoCode.create({
      data: {
        code: cleanCode,
        discountType: discountType === "FIXED" ? "FIXED" : "PERCENTAGE",
        discountValue: parseInt(discountValue, 10),
        minSpend: parseInt(minSpend || "0", 10),
        maxUses: maxUses ? parseInt(maxUses, 10) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        active: true,
      },
    });

    return NextResponse.json({ success: true, promo });
  } catch (error) {
    console.error("Admin promo create error:", error);
    return NextResponse.json({ error: "Failed to create promo code." }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { promoId, active } = body;

    if (!promoId) {
      return NextResponse.json({ error: "promoId is required." }, { status: 400 });
    }

    const updated = await db.promoCode.update({
      where: { id: promoId },
      data: { active: Boolean(active) },
    });

    return NextResponse.json({ success: true, promo: updated });
  } catch (error) {
    console.error("Admin promo update error:", error);
    return NextResponse.json({ error: "Failed to update promo code." }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Promo id is required." }, { status: 400 });
    }

    await db.promoCode.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin promo DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete promo code." }, { status: 500 });
  }
}
