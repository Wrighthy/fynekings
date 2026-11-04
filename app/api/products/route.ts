import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category")?.toLowerCase().trim();
    const gender = searchParams.get("gender")?.toLowerCase().trim();
    const movement = searchParams.get("movement")?.toLowerCase().trim();
    const strap = searchParams.get("strap")?.toLowerCase().trim();
    const style = searchParams.get("style")?.toLowerCase().trim();
    const priceRange = searchParams.get("price")?.toLowerCase().trim();
    const minPriceParam = searchParams.get("minPrice");
    const maxPriceParam = searchParams.get("maxPrice");
    const sort = searchParams.get("sort")?.toLowerCase().trim();
    const search = searchParams.get("search")?.toLowerCase().trim();
    const series = searchParams.get("series")?.trim();
    const premium = searchParams.get("premium")?.toLowerCase().trim();
    const premiumCollection = searchParams.get("premiumCollection")?.toLowerCase().trim();
    const availability = searchParams.get("availability")?.toLowerCase().trim();

    // Build base where clause
    const whereClause: Record<string, any> = {};
    if (availability === "in-stock") {
      whereClause.inStock = true;
    }
    if (premium === "true") whereClause.isPremium = true;

    // Fetch products
    const products = await db.product.findMany({
      where: whereClause,
      orderBy: { createdAt: "asc" },
    });

    if (!products || products.length === 0) {
      return NextResponse.json([]);
    }

    // Filter in-memory for flexibility across multiple filter combinations & smart fallbacks
    let filtered = products.filter((p) => {
      const pCats = Array.isArray(p.categories) ? p.categories.map((c: string) => c.toLowerCase()) : [];

      // Availability check
      if (availability === "in-stock" && (p.inStock === false || p.stockCount === 0)) {
        return false;
      }

      // Gender filter (supports standalone gender param or category)
      const targetGender = gender && gender !== "all" ? gender : undefined;
      if (targetGender) {
        const matchesGender =
          pCats.includes(targetGender) ||
          pCats.includes("unisex") ||
          (targetGender === "men" && !pCats.includes("women"));
        if (!matchesGender) return false;
      }

      // 1. Category Filter
      if (category && category !== "all") {
        const hasDirectCat = pCats.includes(category);

        if (!hasDirectCat) {
          let fallbackMatch = false;
          const pMovement = (p.movement || "").toLowerCase();
          const pTag = (p.tag || "").toLowerCase();
          const pSeries = (p.series || "").toLowerCase();
          const pBadge = (p.badge || "").toLowerCase();
          const pName = (p.name || "").toLowerCase();

          if (category === "men") {
            fallbackMatch = pCats.includes("unisex") || (!pCats.includes("women") && !pName.includes("women"));
          } else if (category === "women") {
            fallbackMatch = pCats.includes("unisex") || pSeries.includes("women") || pName.includes("rose") || pName.includes("classic");
          } else if (category === "unisex") {
            fallbackMatch = pCats.includes("men") || pCats.includes("women");
          } else if (category === "automatic") {
            fallbackMatch = pMovement.includes("auto") || pTag.includes("auto");
          } else if (category === "quartz") {
            fallbackMatch = pMovement.includes("quartz") || pTag.includes("quartz");
          } else if (category === "chronograph") {
            fallbackMatch = pTag.includes("chrono") || pName.includes("chrono");
          } else if (category === "sport") {
            fallbackMatch = pSeries.includes("sport") || (p.style || "").toLowerCase() === "sport";
          } else if (category === "classic") {
            fallbackMatch =
              pSeries.includes("classic") ||
              pSeries.includes("dress") ||
              (p.style || "").toLowerCase() === "dress";
          } else if (category === "bestsellers") {
            fallbackMatch = pBadge.includes("best") || pBadge.includes("hot") || Boolean(p.featured);
          } else if (category === "new-arrivals") {
            fallbackMatch = pBadge.includes("new") || Boolean(p.badgeNew);
          }

          if (!fallbackMatch) return false;
        }
      }

      // 2. Movement Filter
      if (movement && movement !== "all") {
        const pMovement = (p.movement || "").toLowerCase();
        const pTag = (p.tag || "").toLowerCase();
        const movementMatch =
          pMovement === movement ||
          (movement === "automatic" && (pMovement.includes("auto") || pTag.includes("auto"))) ||
          (movement === "quartz" && (pMovement.includes("quartz") || pTag.includes("quartz"))) ||
          (movement === "manual" && (pMovement.includes("manual") || pTag.includes("manual")));
        if (!movementMatch) return false;
      }

      // 3. Strap Material Filter
      if (strap && strap !== "all") {
        const pStrap = (p.strapMaterial || "").toLowerCase();
        const strapMatch =
          pStrap === strap ||
          (strap === "leather" &&
            (pStrap.includes("leather") || pStrap.includes("croc") || pStrap.includes("alligator"))) ||
          (strap === "stainless-steel" && (pStrap.includes("steel") || pStrap.includes("metal"))) ||
          (strap === "rubber" && pStrap.includes("rubber")) ||
          (strap === "mesh" && pStrap.includes("mesh"));
        if (!strapMatch) return false;
      }

      // 4. Style Filter
      if (style && style !== "all") {
        const pStyle = (p.style || "").toLowerCase();
        if (pStyle !== style) return false;
      }

      // 5. Price Filter
      let minPrice = minPriceParam ? parseInt(minPriceParam, 10) : undefined;
      let maxPrice = maxPriceParam ? parseInt(maxPriceParam, 10) : undefined;

      if (priceRange && priceRange !== "all") {
        if (priceRange === "under-50k" || priceRange === "0-50000") {
          minPrice = 0;
          maxPrice = 50000;
        } else if (priceRange === "50k-100k" || priceRange === "50000-100000") {
          minPrice = 50000;
          maxPrice = 100000;
        } else if (priceRange === "100k-plus" || priceRange.startsWith("100000")) {
          minPrice = 100000;
          maxPrice = 999999999;
        } else if (priceRange.includes("-")) {
          const [mn, mx] = priceRange.split("-").map((v) => parseInt(v, 10));
          if (!isNaN(mn)) minPrice = mn;
          if (!isNaN(mx)) maxPrice = mx;
        }
      }

      if (minPrice !== undefined && p.price < minPrice) return false;
      if (maxPrice !== undefined && p.price > maxPrice) return false;

      // 6. Series Filter
      if (series && series !== "All" && p.series !== series) {
        return false;
      }

      // 7. Search Filter
      if (search) {
        const query = search.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(query);
        const matchesSeries = p.series.toLowerCase().includes(query);
        const matchesDesc = (p.description || "").toLowerCase().includes(query);
        const matchesTag = (p.tag || "").toLowerCase().includes(query);
        if (!matchesName && !matchesSeries && !matchesDesc && !matchesTag) {
          return false;
        }
      }

      // 8. Premium Sub-collection Filter
      if (premiumCollection && premiumCollection !== "all") {
        const pCollection = (p.premiumCollection || "").toLowerCase();
        if (pCollection !== premiumCollection) return false;
      }

      return true;
    });

    // Sort
    if (sort) {
      if (sort === "price_asc" || sort === "price: low to high") {
        filtered.sort((a, b) => a.price - b.price);
      } else if (sort === "price_desc" || sort === "price: high to low") {
        filtered.sort((a, b) => b.price - a.price);
      } else if (sort === "name_asc" || sort === "name a-z") {
        filtered.sort((a, b) => a.name.localeCompare(b.name));
      } else if (sort === "newest") {
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      } else if (sort === "popularity" || sort === "bestsellers") {
        filtered.sort((a, b) => {
          const aScore = (a.featured ? 10 : 0) + ((a.badge || "").toLowerCase().includes("best") ? 5 : 0);
          const bScore = (b.featured ? 10 : 0) + ((b.badge || "").toLowerCase().includes("best") ? 5 : 0);
          return bScore - aScore;
        });
      }
    }

    return NextResponse.json(filtered);
  } catch (error) {
    console.error("Products API error:", error);
    return NextResponse.json([]);
  }
}