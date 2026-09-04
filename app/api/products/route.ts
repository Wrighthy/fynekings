import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// Mock data matching seed.js — used when the database is unavailable
// const MOCK_PRODUCTS = [
//   {
//     id: "mock-1", name: "Sovereign I", slug: "sovereign-i", series: "Midnight Series",
//     price: 485000, tag: "Auto · 40mm", badge: "No. 01 Best Seller", badgeNew: null,
//     description: "The Sovereign I is the flagship of the Midnight Series.",
//     strapColor: "#141414", strapStroke: "#2a2a2a", caseColor: "#0d0d0d", caseStroke: "#C4A962",
//     markerColor: "#C4A962", handColor: "#F4EFE4", secColor: "#C4A962", textColor: "#C4A962",
//     innerCase: "#080808", innerStroke: "#1a1a1a", strokeWidth: "1.4",
//     featured: true, inStock: true, stockCount: 10, lowStockThreshold: 3, images: [], specs: {},
//   },
//   {
//     id: "mock-2", name: "Lagos Prestige", slug: "lagos-prestige", series: "Gold Edition",
//     price: 620000, tag: "Auto · 42mm", badge: "Hot", badgeNew: null,
//     description: "The Lagos Prestige is a statement of pure luxury.",
//     strapColor: "#2a1f0a", strapStroke: "#5A4010", caseColor: "#1a1200", caseStroke: "#C4A962",
//     markerColor: "#C4A962", handColor: "#C4A962", secColor: "#D9C080", textColor: "#C4A962",
//     innerCase: "#0e0900", innerStroke: "#2a1e00", strokeWidth: "2.2",
//     featured: true, inStock: true, stockCount: 10, lowStockThreshold: 3, images: [], specs: {},
//   },
//   {
//     id: "mock-3", name: "Continent", slug: "continent", series: "Steel Series",
//     price: 310000, tag: "Quartz · 38mm", badge: null, badgeNew: "New",
//     description: "A clean steel case and precise quartz movement for the modern African professional.",
//     strapColor: "#1a1a2a", strapStroke: "#2a2a4a", caseColor: "#10101a", caseStroke: "#6070C4",
//     markerColor: "#8090D4", handColor: "#F4EFE4", secColor: "#8090D4", textColor: "#8090D4",
//     innerCase: "#0c0c14", innerStroke: "#1e1e30", strokeWidth: "1.4",
//     featured: true, inStock: true, stockCount: 10, lowStockThreshold: 3, images: [], specs: {},
//   },
//   {
//     id: "mock-4", name: "Sahara Rose", slug: "sahara-rose", series: "Rose Gold",
//     price: 540000, tag: "Auto · 40mm", badge: null, badgeNew: null,
//     description: "Inspired by the warm hues of the Saharan sunset.",
//     strapColor: "#2a1515", strapStroke: "#4a2020", caseColor: "#1a0c0c", caseStroke: "#C47070",
//     markerColor: "#C47070", handColor: "#F4EFE4", secColor: "#C47070", textColor: "#C47070",
//     innerCase: "#0e0808", innerStroke: "#2a1212", strokeWidth: "1.6",
//     featured: true, inStock: true, stockCount: 10, lowStockThreshold: 3, images: [], specs: {},
//   },
//   {
//     id: "mock-5", name: "Victoria Crown", slug: "victoria-crown", series: "Platinum Series",
//     price: 980000, tag: "Auto · 41mm", badge: "New Arrival", badgeNew: null,
//     description: "Brushed platinum case, skeletonised dial revealing the movement.",
//     strapColor: "#E8E4DC", strapStroke: "#C4A962", caseColor: "#d4d4d4", caseStroke: "#888888",
//     markerColor: "#888888", handColor: "#1a1a1a", secColor: "#C4A962", textColor: "#888888",
//     innerCase: "#c8c8c8", innerStroke: "#999999", strokeWidth: "1.4",
//     featured: true, inStock: true, stockCount: 10, lowStockThreshold: 3, images: [], specs: {},
//   },
//   {
//     id: "mock-6", name: "Abuja Classic", slug: "abuja-classic", series: "Dress Collection",
//     price: 395000, tag: "Auto · 36mm", badge: null, badgeNew: null,
//     description: "Slim, elegant, and understated.",
//     strapColor: "#1a1a1a", strapStroke: "#3a3a3a", caseColor: "#e8e8e8", caseStroke: "#aaaaaa",
//     markerColor: "#aaaaaa", handColor: "#1a1a1a", secColor: "#C4A962", textColor: "#aaaaaa",
//     innerCase: "#f0f0f0", innerStroke: "#cccccc", strokeWidth: "1.2",
//     featured: false, inStock: true, stockCount: 10, lowStockThreshold: 3, images: [], specs: {},
//   },
//   {
//     id: "mock-7", name: "Niger Delta", slug: "niger-delta", series: "Sport Collection",
//     price: 445000, tag: "Auto · 42mm", badge: "New", badgeNew: null,
//     description: "Built for the adventurous collector. 200m water resistance.",
//     strapColor: "#1a2a1a", strapStroke: "#2a4a2a", caseColor: "#0a1a0a", caseStroke: "#4a8a4a",
//     markerColor: "#6aaa6a", handColor: "#F4EFE4", secColor: "#C4A962", textColor: "#6aaa6a",
//     innerCase: "#081408", innerStroke: "#1a3a1a", strokeWidth: "1.6",
//     featured: false, inStock: true, stockCount: 10, lowStockThreshold: 3, images: [], specs: {},
//   },
//   {
//     id: "mock-8", name: "Eko Atlantic", slug: "eko-atlantic", series: "Blue Water Series",
//     price: 520000, tag: "Auto · 40mm", badge: null, badgeNew: null,
//     description: "Deep ocean blue dial, steel case, and luminous hands.",
//     strapColor: "#0a0a2a", strapStroke: "#1a1a4a", caseColor: "#080818", caseStroke: "#4060C4",
//     markerColor: "#6080D4", handColor: "#F4EFE4", secColor: "#C4A962", textColor: "#6080D4",
//     innerCase: "#060612", innerStroke: "#141430", strokeWidth: "1.4",
//     featured: false, inStock: true, stockCount: 10, lowStockThreshold: 3, images: [], specs: {},
//   },
// ];
const MOCK_PRODUCTS: any[] = [];

export async function GET() {
  try {
    const products = await db.product.findMany({
      where: { inStock: true },
      orderBy: { createdAt: "asc" },
    });
    // If the DB returned results, use them; otherwise fall back to mock data
    if (products.length > 0) {
      return NextResponse.json(products);
    }
    console.warn("No products in database — serving mock data");
    return NextResponse.json(MOCK_PRODUCTS);
  } catch (error) {
    console.warn("Database unavailable — serving mock products:", (error as Error).message);
    return NextResponse.json(MOCK_PRODUCTS);
  }
}