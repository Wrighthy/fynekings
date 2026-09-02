import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const STATIC_WATCHES = [
  {
    id: "tryon-1",
    name: "Royal Gold",
    slug: "royal-gold",
    series: "Signature",
    price: 420000,
    overlayUrl: "/watches/watch1.png",
    thumbnailUrl: "/watches/watch1.png",
    productId: null,
  },
  {
    id: "tryon-2",
    name: "Midnight Silver",
    slug: "midnight-silver",
    series: "Signature",
    price: 420000,
    overlayUrl: "/watches/watch2.png",
    thumbnailUrl: "/watches/watch2.png",
    productId: null,
  },
];

export async function GET() {
  return NextResponse.json(STATIC_WATCHES);
}

