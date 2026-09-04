import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/** GET — list all try-on watches (including inactive) for admin management */
export async function GET() {
  try {
    const watches = await db.tryOnWatch.findMany({
      orderBy: { sortOrder: "asc" },
      include: { product: { select: { id: true, name: true, slug: true } } },
    });
    return NextResponse.json(watches);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}

/** POST — create a new try-on watch */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, slug, series, price, overlayUrl, thumbnailUrl, productId, sortOrder } = body;

    if (!name || !slug || !series || !price || !overlayUrl) {
      return NextResponse.json(
        { error: "Missing required fields: name, slug, series, price, overlayUrl" },
        { status: 400 }
      );
    }

    const watch = await db.tryOnWatch.create({
      data: {
        name,
        slug,
        series,
        price,
        overlayUrl,
        thumbnailUrl: thumbnailUrl || null,
        productId: productId || null,
        sortOrder: sortOrder ?? 0,
        active: true,
      },
    });

    return NextResponse.json(watch, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}

/** PATCH — update an existing try-on watch */
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing watch id" }, { status: 400 });
    }

    const watch = await db.tryOnWatch.update({
      where: { id },
      data,
    });

    return NextResponse.json(watch);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}

/** DELETE — remove a try-on watch */
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing watch id" }, { status: 400 });
    }

    await db.tryOnWatch.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
