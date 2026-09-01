import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { limitOr429 } from "@/lib/rateLimit";

export async function POST(req: Request) {
  try {
    // 10 attempts per 5 minutes per IP — slows promo-code guessing.
    const limited = limitOr429(req, "promo", 10, 5 * 60 * 1000);
    if (limited) return limited;

    const body = await req.json();
    const { code, subtotal } = body;

    if (!code || subtotal === undefined) {
      return NextResponse.json({ error: "Promo code and subtotal are required." }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase();

    const promo = await db.promoCode.findUnique({ where: { code: cleanCode } });

    if (!promo || !promo.active) {
      return NextResponse.json({ error: "Invalid or inactive promo code." }, { status: 400 });
    }

    if (promo.expiresAt && promo.expiresAt < new Date()) {
      return NextResponse.json({ error: "This promo code has expired." }, { status: 400 });
    }

    if (promo.maxUses && promo.usedCount >= promo.maxUses) {
      return NextResponse.json({ error: "This promo code has reached its maximum usage limit." }, { status: 400 });
    }

    if (subtotal < promo.minSpend) {
      return NextResponse.json({ error: `Minimum cart value of ₦${promo.minSpend.toLocaleString("en-NG")} required for this promo.` }, { status: 400 });
    }

    let discountAmount = 0;
    if (promo.discountType === "PERCENTAGE") {
      discountAmount = Math.round((subtotal * promo.discountValue) / 100);
    } else {
      discountAmount = Math.min(promo.discountValue, subtotal);
    }

    return NextResponse.json({
      success: true,
      code: promo.code,
      discountType: promo.discountType,
      discountValue: promo.discountValue,
      discountAmount,
    });
  } catch (error) {
    console.error("Apply promo API error:", error);
    return NextResponse.json({ error: "Failed to apply promo code." }, { status: 500 });
  }
}
