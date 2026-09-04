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
  {
    id: "tryon-3",
    name: "Royal Gold",
    slug: "royal-gold",
    series: "Signature",
    price: 420000,
    overlayUrl: "/watches/watch3.png",
    thumbnailUrl: "/watches/watch3.png",
    productId: null,
  },
  {
    id: "tryon-4",
    name: "Royal Gold",
    slug: "royal-gold",
    series: "Signature",
    price: 420000,
    overlayUrl: "/watches/watch4.png",
    thumbnailUrl: "/watches/watch4.png",
    productId: null,
  },
  {
    id: "tryon-5",
    name: "Royal Gold",
    slug: "royal-gold",
    series: "Signature",
    price: 420000,
    overlayUrl: "/watches/watch5.png",
    thumbnailUrl: "/watches/watch5.png",
    productId: null,
  },
  {
    id: "tryon-6",
    name: "Royal Gold",
    slug: "royal-gold",
    series: "Signature",
    price: 420000,
    overlayUrl: "/watches/watch6.png",
    thumbnailUrl: "/watches/watch6.png",
    productId: null,
  },
  {
    id: "tryon-7",
    name: "Royal Gold",
    slug: "royal-gold",
    series: "Signature",
    price: 420000,
    overlayUrl: "/watches/watch7.png",
    thumbnailUrl: "/watches/watch7.png",
    productId: null,
  },
  {
    id: "tryon-8",
    name: "Royal Gold",
    slug: "royal-gold",
    series: "Signature",
    price: 420000,
    overlayUrl: "/watches/watch8.png",
    thumbnailUrl: "/watches/watch8.png",
    productId: null,
  },
];

export async function GET() {
  return NextResponse.json(STATIC_WATCHES);
}

