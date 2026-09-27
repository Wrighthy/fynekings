import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/sessionAuth";

// GET /api/wishlist — Retrieve customer's saved wishlist items
export async function GET() {
  try {
    const { user, errorResponse } = await requireAuth();
    if (errorResponse || !user) return errorResponse;

    const wishlistItems = await db.wishlistItem.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            series: true,
            price: true,
            tag: true,
            images: true,
            inStock: true,
          },
        },
      },
    });

    return NextResponse.json({
      items: wishlistItems.map((w) => ({
        id: w.id,
        productId: w.productId,
        product: w.product,
        createdAt: w.createdAt,
      })),
    });
  } catch (error) {
    console.error("Fetch wishlist error:", error);
    return NextResponse.json({ error: "Failed to fetch wishlist." }, { status: 500 });
  }
}

// POST /api/wishlist — Add product to customer's wishlist
export async function POST(req: Request) {
  try {
    const { user, errorResponse } = await requireAuth();
    if (errorResponse || !user) return errorResponse;

    const body = await req.json();
    const { productId, slug } = body;

    let targetProductId = productId;
    if (!targetProductId && slug) {
      const product = await db.product.findUnique({ where: { slug }, select: { id: true } });
      if (product) targetProductId = product.id;
    }

    if (!targetProductId) {
      return NextResponse.json({ error: "Product ID or slug is required." }, { status: 400 });
    }

    const item = await db.wishlistItem.upsert({
      where: {
        userId_productId: {
          userId: user.id,
          productId: targetProductId,
        },
      },
      create: {
        userId: user.id,
        productId: targetProductId,
      },
      update: {},
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            series: true,
            price: true,
            tag: true,
            images: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, item });
  } catch (error) {
    console.error("Add to wishlist error:", error);
    return NextResponse.json({ error: "Failed to add to wishlist." }, { status: 500 });
  }
}

// DELETE /api/wishlist — Remove product from customer's wishlist
export async function DELETE(req: Request) {
  try {
    const { user, errorResponse } = await requireAuth();
    if (errorResponse || !user) return errorResponse;

    const { searchParams } = new URL(req.url);
    let productId = searchParams.get("productId");
    const slug = searchParams.get("slug");

    if (!productId && slug) {
      const product = await db.product.findUnique({ where: { slug }, select: { id: true } });
      if (product) productId = product.id;
    }

    if (!productId) {
      return NextResponse.json({ error: "Product ID or slug is required." }, { status: 400 });
    }

    await db.wishlistItem.deleteMany({
      where: {
        userId: user.id,
        productId: productId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Remove from wishlist error:", error);
    return NextResponse.json({ error: "Failed to remove from wishlist." }, { status: 500 });
  }
}
