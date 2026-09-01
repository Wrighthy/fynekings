import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;
        const product = await db.product.findUnique({
            where: { slug },
            select: { id: true },
        });

        if (!product) {
            return NextResponse.json({ error: "Product not found" }, { status: 404 });
        }

        const comments = await db.productComment.findMany({
            where: { productId: product.id, status: "APPROVED" },
            orderBy: { createdAt: "desc" },
            select: { id: true, name: true, body: true, createdAt: true },
        });

        return NextResponse.json({ comments });
    } catch (error) {
        console.error("Product comments GET error:", error);
        return NextResponse.json(
            { error: "Failed to fetch comments" },
            { status: 500 }
        );
    }
}

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;
        const body = await req.json().catch(() => null);
        if (!body || typeof body !== "object") {
            return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
        }
        const name = typeof body.name === "string" ? body.name.trim() : "";
        const email = typeof body.email === "string" ? body.email.trim() : "";
        const commentBody = typeof body.body === "string" ? body.body.trim() : "";

        if (name.length < 2 || name.length > 60) {
            return NextResponse.json(
                { error: "Please enter your name (2–60 characters)." },
                { status: 400 }
            );
        }
        if (!EMAIL_REGEX.test(email)) {
            return NextResponse.json(
                { error: "Please enter a valid email address." },
                { status: 400 }
            );
        }
        if (commentBody.length < 5 || commentBody.length > 1000) {
            return NextResponse.json(
                { error: "Your comment must be between 5 and 1000 characters." },
                { status: 400 }
            );
        }

        const product = await db.product.findUnique({
            where: { slug },
            select: { id: true },
        });

        if (!product) {
            return NextResponse.json({ error: "Product not found" }, { status: 404 });
        }

        await db.productComment.create({
            data: {
                productId: product.id,
                name,
                email,
                body: commentBody,
                status: "PENDING",
            },
        });

        return NextResponse.json({
            success: true,
            message: "Thank you — your comment is awaiting moderation.",
        });
    } catch (error) {
        console.error("Product comment POST error:", error);
        return NextResponse.json(
            { error: "Failed to submit comment. Please try again." },
            { status: 500 }
        );
    }
}
