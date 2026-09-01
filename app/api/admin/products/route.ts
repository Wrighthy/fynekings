import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/adminAuth";

export async function GET() {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const products = await db.product.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ products });
  } catch (error) {
    console.error("Admin products GET error:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const body = await req.json();
    const { name, series, price, tag, description, stockCount, imageUrl, images, specs } = body;

    if (!name || !series || !price || !tag) {
      return NextResponse.json({ error: "Name, series, price, and tag are required." }, { status: 400 });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + "-" + Date.now().toString(36);
    const initialImages = imageUrl ? [imageUrl] : (images || []);

    const newProduct = await db.product.create({
      data: {
        name,
        series,
        price: parseInt(price, 10),
        tag,
        description: description || "Hand-finished luxury timepiece.",
        stockCount: parseInt(stockCount || "10", 10),
        inStock: parseInt(stockCount || "10", 10) > 0,
        images: initialImages,
        slug,
        strapColor: "#141414",
        strapStroke: "#C4A962",
        caseColor: "#1a1a1a",
        caseStroke: "#C4A962",
        markerColor: "#C4A962",
        handColor: "#F4EFE4",
        secColor: "#C4A962",
        textColor: "#C4A962",
        innerCase: "#0d0d0d",
        innerStroke: "#1e1e1e",
        strokeWidth: "2.5",
        specs: specs || { movement: "Automatic 25 Jewels", caseDiameter: "40mm", waterResistance: "50m (5ATM)" },
      },
    });

    return NextResponse.json({ success: true, product: newProduct });
  } catch (error) {
    console.error("Admin product create error:", error);
    return NextResponse.json({ error: "Failed to create product." }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const body = await req.json();
    const { productId, price, stockCount, inStock, name, series, tag, description } = body;

    if (!productId) {
      return NextResponse.json({ error: "productId is required." }, { status: 400 });
    }

    const updateData: any = {};
    if (price !== undefined) updateData.price = parseInt(price, 10);
    if (stockCount !== undefined) {
      const count = parseInt(stockCount, 10);
      updateData.stockCount = count;
      updateData.inStock = count > 0;
    }
    if (inStock !== undefined) updateData.inStock = Boolean(inStock);
    if (name) updateData.name = name;
    if (series) updateData.series = series;
    if (tag) updateData.tag = tag;
    if (description !== undefined) updateData.description = description;

    const updated = await db.product.update({
      where: { id: productId },
      data: updateData,
    });

    return NextResponse.json({ success: true, product: updated });
  } catch (error) {
    console.error("Admin product update error:", error);
    return NextResponse.json({ error: "Failed to update product." }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Product id is required." }, { status: 400 });
    }

    await db.product.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin product DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete product." }, { status: 500 });
  }
}
