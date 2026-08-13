/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
    console.log("Seeding database...");
    await prisma.product.deleteMany();

    await prisma.product.createMany({
        data: [
            {
                name: "Sovereign I",
                slug: "sovereign-i",
                series: "Midnight Series",
                price: 485000,
                tag: "Auto · 40mm",
                badge: "No. 01 Best Seller",
                description: "The Sovereign I is the flagship of the Midnight Series. Hand-finished in our Victoria Island atelier, every component speaks to an obsession with precision.",
                specs: { movement: "Automatic · Cal. F-2401", caseDiameter: "40mm", caseThickness: "10.8mm", caseMaterial: "316L Surgical Steel", crystal: "Sapphire · Anti-reflective", waterResistance: "100m", powerReserve: "72 hours", jewels: "25", frequency: "28,800 vph", strap: "Black Alligator · Hand-stitched" },
                images: [],
                strapColor: "#141414", strapStroke: "#2a2a2a", caseColor: "#0d0d0d", caseStroke: "#C4A962",
                markerColor: "#C4A962", handColor: "#F4EFE4", secColor: "#C4A962", textColor: "#C4A962",
                innerCase: "#080808", innerStroke: "#1a1a1a", strokeWidth: "1.4", featured: true, inStock: true,
            },
            {
                name: "Lagos Prestige",
                slug: "lagos-prestige",
                series: "Gold Edition",
                price: 620000,
                tag: "Auto · 42mm",
                badge: "Hot",
                description: "The Lagos Prestige is a statement of pure luxury. Its full gold PVD case catches Lagos sunlight in ways that demand attention.",
                specs: { movement: "Automatic · Cal. F-2401", caseDiameter: "42mm", caseThickness: "11.2mm", caseMaterial: "316L Steel · Gold PVD", crystal: "Sapphire · Anti-reflective", waterResistance: "50m", powerReserve: "72 hours", jewels: "25", frequency: "28,800 vph", strap: "Cognac Alligator · Hand-stitched" },
                images: [],
                strapColor: "#2a1f0a", strapStroke: "#5A4010", caseColor: "#1a1200", caseStroke: "#C4A962",
                markerColor: "#C4A962", handColor: "#C4A962", secColor: "#D9C080", textColor: "#C4A962",
                innerCase: "#0e0900", innerStroke: "#2a1e00", strokeWidth: "2.2", featured: true, inStock: true,
            },
            {
                name: "Continent",
                slug: "continent",
                series: "Steel Series",
                price: 310000,
                tag: "Quartz · 38mm",
                badgeNew: "New",
                description: "The Continent bridges continents and cultures. A clean steel case and precise quartz movement for the modern African professional.",
                specs: { movement: "Quartz · Swiss ETA 956.032", caseDiameter: "38mm", caseThickness: "9.4mm", caseMaterial: "316L Brushed Steel", crystal: "Sapphire · Anti-reflective", waterResistance: "100m", powerReserve: "Battery · 3 years", jewels: "7", frequency: "32,768 Hz", strap: "Navy Leather · Hand-stitched" },
                images: [],
                strapColor: "#1a1a2a", strapStroke: "#2a2a4a", caseColor: "#10101a", caseStroke: "#6070C4",
                markerColor: "#8090D4", handColor: "#F4EFE4", secColor: "#8090D4", textColor: "#8090D4",
                innerCase: "#0c0c14", innerStroke: "#1e1e30", strokeWidth: "1.4", featured: true, inStock: true,
            },
            {
                name: "Sahara Rose",
                slug: "sahara-rose",
                series: "Rose Gold",
                price: 540000,
                tag: "Auto · 40mm",
                description: "Inspired by the warm hues of the Saharan sunset. Rose gold case paired with a deep crimson strap.",
                specs: { movement: "Automatic · Cal. F-2401", caseDiameter: "40mm", caseThickness: "10.8mm", caseMaterial: "316L Steel · Rose Gold PVD", crystal: "Sapphire · Anti-reflective", waterResistance: "50m", powerReserve: "72 hours", jewels: "25", frequency: "28,800 vph", strap: "Oxblood Alligator · Hand-stitched" },
                images: [],
                strapColor: "#2a1515", strapStroke: "#4a2020", caseColor: "#1a0c0c", caseStroke: "#C47070",
                markerColor: "#C47070", handColor: "#F4EFE4", secColor: "#C47070", textColor: "#C47070",
                innerCase: "#0e0808", innerStroke: "#2a1212", strokeWidth: "1.6", featured: true, inStock: true,
            },
            {
                name: "Victoria Crown",
                slug: "victoria-crown",
                series: "Platinum Series",
                price: 980000,
                tag: "Auto · 41mm",
                badge: "New Arrival",
                description: "Named after Victoria Island. Brushed platinum case, skeletonised dial revealing the movement, and a hand-stitched ivory strap.",
                specs: { movement: "Automatic · Cal. F-2401 Skeleton", caseDiameter: "41mm", caseThickness: "12.4mm", caseMaterial: "316L Steel · Platinum PVD", crystal: "Sapphire · Double anti-reflective", waterResistance: "30m", powerReserve: "72 hours", jewels: "25", frequency: "28,800 vph", strap: "Ivory Croc · Hand-stitched" },
                images: [],
                strapColor: "#E8E4DC", strapStroke: "#C4A962", caseColor: "#d4d4d4", caseStroke: "#888888",
                markerColor: "#888888", handColor: "#1a1a1a", secColor: "#C4A962", textColor: "#888888",
                innerCase: "#c8c8c8", innerStroke: "#999999", strokeWidth: "1.4", featured: true, inStock: true,
            },
            {
                name: "Abuja Classic",
                slug: "abuja-classic",
                series: "Dress Collection",
                price: 395000,
                tag: "Auto · 36mm",
                description: "Slim, elegant, and understated. The Abuja Classic is built for the boardroom and the black-tie event.",
                specs: { movement: "Automatic · Cal. F-2401 Slim", caseDiameter: "36mm", caseThickness: "7.8mm", caseMaterial: "316L Polished Steel", crystal: "Sapphire · Anti-reflective", waterResistance: "30m", powerReserve: "48 hours", jewels: "21", frequency: "21,600 vph", strap: "Black Calfskin · Deployant clasp" },
                images: [],
                strapColor: "#1a1a1a", strapStroke: "#3a3a3a", caseColor: "#e8e8e8", caseStroke: "#aaaaaa",
                markerColor: "#aaaaaa", handColor: "#1a1a1a", secColor: "#C4A962", textColor: "#aaaaaa",
                innerCase: "#f0f0f0", innerStroke: "#cccccc", strokeWidth: "1.2", featured: false, inStock: true,
            },
            {
                name: "Niger Delta",
                slug: "niger-delta",
                series: "Sport Collection",
                price: 445000,
                tag: "Auto · 42mm",
                badge: "New",
                description: "Built for the adventurous collector. 200m water resistance, rotating bezel, bold green dial inspired by the lush Niger Delta mangroves.",
                specs: { movement: "Automatic · Cal. F-2401 Sport", caseDiameter: "42mm", caseThickness: "13.2mm", caseMaterial: "316L Steel · Brushed & Polished", crystal: "Sapphire · 6× anti-reflective", waterResistance: "200m", powerReserve: "72 hours", jewels: "25", frequency: "28,800 vph", strap: "Black Rubber · Steel clasp" },
                images: [],
                strapColor: "#1a2a1a", strapStroke: "#2a4a2a", caseColor: "#0a1a0a", caseStroke: "#4a8a4a",
                markerColor: "#6aaa6a", handColor: "#F4EFE4", secColor: "#C4A962", textColor: "#6aaa6a",
                innerCase: "#081408", innerStroke: "#1a3a1a", strokeWidth: "1.6", featured: false, inStock: true,
            },
            {
                name: "Eko Atlantic",
                slug: "eko-atlantic",
                series: "Blue Water Series",
                price: 520000,
                tag: "Auto · 40mm",
                description: "Inspired by Lagos's newest landmark rising from the Atlantic. Deep ocean blue dial, steel case, and luminous hands.",
                specs: { movement: "Automatic · Cal. F-2401", caseDiameter: "40mm", caseThickness: "11mm", caseMaterial: "316L Steel · Sandblasted", crystal: "Sapphire · Anti-reflective", waterResistance: "150m", powerReserve: "72 hours", jewels: "25", frequency: "28,800 vph", strap: "Navy Blue Rubber · Folding clasp" },
                images: [],
                strapColor: "#0a0a2a", strapStroke: "#1a1a4a", caseColor: "#080818", caseStroke: "#4060C4",
                markerColor: "#6080D4", handColor: "#F4EFE4", secColor: "#C4A962", textColor: "#6080D4",
                innerCase: "#060612", innerStroke: "#141430", strokeWidth: "1.4", featured: false, inStock: true,
            },
        ],
    });

    await prisma.limitedEdition.deleteMany();
    await prisma.limitedEdition.create({
        data: {
            name: "Obsidian King",
            reference: "F-OBK/24",
            price: 850000,
            totalStock: 50,
            soldCount: 38,
            dropEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
            active: true,
        },
    });

    console.log("✅ Database seeded successfully");
    console.log("   → 8 products created");
    console.log("   → 1 limited edition created");
}

main()
    .catch(e => { console.error(e); process.exit(1); })
    .finally(async () => { await prisma.$disconnect(); });