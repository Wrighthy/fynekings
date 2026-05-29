import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Clear existing products
  await prisma.product.deleteMany();

  // Seed products
  await prisma.product.createMany({
    data: [
      {
        name: "Sovereign I",
        series: "Midnight Series",
        price: 485000,
        tag: "Auto · 40mm",
        badge: "No. 01 Best Seller",
        strapColor: "#141414",
        strapStroke: "#2a2a2a",
        caseColor: "#0d0d0d",
        caseStroke: "#C4A962",
        markerColor: "#C4A962",
        handColor: "#F4EFE4",
        secColor: "#C4A962",
        textColor: "#C4A962",
        innerCase: "#080808",
        innerStroke: "#1a1a1a",
        strokeWidth: "1.4",
        featured: true,
        inStock: true,
      },
      {
        name: "Lagos Prestige",
        series: "Gold Edition",
        price: 620000,
        tag: "Auto · 42mm",
        badge: "Hot",
        strapColor: "#2a1f0a",
        strapStroke: "#5A4010",
        caseColor: "#1a1200",
        caseStroke: "#C4A962",
        markerColor: "#C4A962",
        handColor: "#C4A962",
        secColor: "#D9C080",
        textColor: "#C4A962",
        innerCase: "#0e0900",
        innerStroke: "#2a1e00",
        strokeWidth: "2.2",
        featured: true,
        inStock: true,
      },
      {
        name: "Continent",
        series: "Steel Series",
        price: 310000,
        tag: "Quartz · 38mm",
        badgeNew: "New",
        strapColor: "#1a1a2a",
        strapStroke: "#2a2a4a",
        caseColor: "#10101a",
        caseStroke: "#6070C4",
        markerColor: "#8090D4",
        handColor: "#F4EFE4",
        secColor: "#8090D4",
        textColor: "#8090D4",
        innerCase: "#0c0c14",
        innerStroke: "#1e1e30",
        strokeWidth: "1.4",
        featured: true,
        inStock: true,
      },
      {
        name: "Sahara Rose",
        series: "Rose Gold",
        price: 540000,
        tag: "Auto · 40mm",
        strapColor: "#2a1515",
        strapStroke: "#4a2020",
        caseColor: "#1a0c0c",
        caseStroke: "#C47070",
        markerColor: "#C47070",
        handColor: "#F4EFE4",
        secColor: "#C47070",
        textColor: "#C47070",
        innerCase: "#0e0808",
        innerStroke: "#2a1212",
        strokeWidth: "1.6",
        featured: true,
        inStock: true,
      },
    ],
  });

  // Seed limited edition
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
  console.log("   → 4 products created");
  console.log("   → 1 limited edition created");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });