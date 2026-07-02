import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function DELETE(req: NextRequest) {
    try {
        const { productId, imageUrl } = await req.json();
        const product = await db.product.findUnique({ where: { id: productId } });
        if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

        await db.product.update({
            where: { id: productId },
            data: { images: product.images.filter((img: string) => img !== imageUrl) },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete image error:", error);
        return NextResponse.json({ error: "Failed to delete image" }, { status: 500 });
    }
}