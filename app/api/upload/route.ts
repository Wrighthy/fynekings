import { v2 as cloudinary } from "cloudinary";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;
        const productId = formData.get("productId") as string;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        // Convert file to buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Upload to Cloudinary
        const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                {
                    folder: `fynekings/watches/${productId}`,
                    transformation: [
                        { width: 1200, height: 1200, crop: "limit" },
                        { quality: "auto", fetch_format: "auto" },
                    ],
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result as { secure_url: string });
                }
            ).end(buffer);
        });

        // Save URL to database
        if (productId) {
            const product = await db.product.findUnique({ where: { id: productId } });
            if (product) {
                await db.product.update({
                    where: { id: productId },
                    data: { images: [...product.images, result.secure_url] },
                });
            }
        }

        return NextResponse.json({ url: result.secure_url });
    } catch (error: unknown) {
        const errMsg = error instanceof Error ? error.message : JSON.stringify(error);
        console.error("Upload error:", errMsg);
        return NextResponse.json(
            { error: "Upload failed", details: errMsg },
            { status: 500 }
        );
    }
}