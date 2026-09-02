import { v2 as cloudinary } from "cloudinary";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function POST(req: NextRequest) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const productId = formData.get("productId") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Only image files are allowed" }, { status: 400 });
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File exceeds 10MB limit" }, { status: 400 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Determine the upload folder
    const folder = productId ? `fynekings/watches/${productId}` : "fynekings/watches/general";

    // Upload to Cloudinary
    const result = await new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: "image",
          transformation: [
            { width: 1200, height: 1200, crop: "limit" },
            { quality: "auto", fetch_format: "auto" },
          ],
        },
        (error, result) => {
          if (error) {
            reject(new Error(error.message || "Cloudinary upload failed"));
          } else if (!result) {
            reject(new Error("No result returned from Cloudinary"));
          } else {
            resolve(result as { secure_url: string; public_id: string });
          }
        }
      );
      uploadStream.end(buffer);
    });

    // If productId is provided, append the URL to that product in the DB
    if (productId) {
      const product = await db.product.findUnique({ where: { id: productId } });
      if (product) {
        await db.product.update({
          where: { id: productId },
          data: {
            images: [...(product.images as string[]), result.secure_url],
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      url: result.secure_url,
      public_id: result.public_id,
    });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : JSON.stringify(error);
    console.error("Upload error:", errMsg);
    return NextResponse.json(
      { error: "Upload failed", details: errMsg },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const { productId, imageUrl } = await req.json();

    if (!productId || !imageUrl) {
      return NextResponse.json({ error: "productId and imageUrl are required" }, { status: 400 });
    }

    // Remove from the DB first
    const product = await db.product.findUnique({ where: { id: productId } });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const updatedImages = (product.images as string[]).filter((url) => url !== imageUrl);
    await db.product.update({
      where: { id: productId },
      data: { images: updatedImages },
    });

    // Try to delete from Cloudinary (non-fatal if it fails)
    try {
      // Derive public_id from URL: everything after /upload/ and before the extension
      const match = imageUrl.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[a-z]+)?$/);
      if (match && match[1]) {
        await cloudinary.uploader.destroy(match[1], { resource_type: "image" });
      }
    } catch (cdnErr) {
      console.warn("Cloudinary delete skipped:", cdnErr);
    }

    return NextResponse.json({ success: true, remainingImages: updatedImages });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : JSON.stringify(error);
    console.error("Image delete error:", errMsg);
    return NextResponse.json({ error: "Failed to delete image", details: errMsg }, { status: 500 });
  }
}