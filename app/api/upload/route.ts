import { put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;
        const productId = formData.get("productId") as string;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        const blob = await put(`watches/${productId}/${file.name}`, file, {
            access: "public",
        });

        if (productId) {
            const product = await db.product.findUnique({ where: { id: productId } });
            if (product) {
                await db.product.update({
                    where: { id: productId },
                    data: { images: [...product.images, blob.url] },
                });
            }
        }

        return NextResponse.json({ url: blob.url });
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }
}