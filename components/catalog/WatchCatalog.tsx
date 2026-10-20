"use client";

import { useState, useEffect, useMemo, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCart, fmt } from "@/lib/store";
import { useWishlistAction } from "@/lib/wishlistAction";
import { useCompare } from "@/lib/compareStore";
import Nav from "@/components/sections/Nav";
import Footer from "@/components/sections/Footer";
import {
  CATEGORIES,
  MOVEMENT_OPTIONS,
  STRAP_OPTIONS,
  STYLE_OPTIONS,
  PRICE_RANGES,
  getCategoryBySlug,
  PREMIUM_SUBCATEGORIES,
  getPremiumSubcategoryBySlug,
} from "@/lib/categories";

export type Product = {
  id: string;
  name: string;
  slug: string;
  series: string;
  price: number;
  tag: string;
  badge: string | null;
  badgeNew: string | null;
  images: string[];
  strapColor: string;
  strapStroke: string;
  caseColor: string;
  caseStroke: string;
  markerColor: string;
  handColor: string;
  secColor: string;
  textColor: string;
  innerCase: string;
  innerStroke: string;
  strokeWidth: string;
  stockCount?: number;
  inStock?: boolean;
  specs?: Record<string, string> | null;
  categories?: string[];
  movement?: string | null;
  strapMaterial?: string | null;
  style?: string | null;
  isPremium?: boolean;
  premiumCollection?: string | null;
  createdAt?: string;
};

const SORT_OPTIONS = [
  { id: "default", label: "Curated (Default)" },
  { id: "newest", label: "Newest Arrivals" },
  { id: "price_asc", label: "Price: Low to High" },
  { id: "price_desc", label: "Price: High to Low" },
  { id: "name_asc", label: "Name: A to Z" },
];

function WatchCardImage({ p }: { p: Product }) {
  const [currentImg, setCurrentImg] = useState(0);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (!hovered || !p.images || p.images.length <= 1) return;
    const id = setInterval(() => {
      setCurrentImg((i) => (i + 1) % p.images.length);
    }, 800);
    return () => clearInterval(id);
  }, [hovered, p.images]);

  if (!p.images || p.images.length === 0) {
    return (
      <svg viewBox="0 0 160 160" width="130" height="130" xmlns="http://www.w3.org/2000/svg">
        <rect x="63" y="8" width="34" height="40" rx="6" fill={p.strapColor} stroke={p.strapStroke} strokeWidth=".8" />
        <rect x="63" y="112" width="34" height="40" rx="6" fill={p.strapColor} stroke={p.strapStroke} strokeWidth=".8" />
        <circle cx="80" cy="80" r="50" fill={p.caseColor} stroke={p.caseStroke} strokeWidth={p.strokeWidth || "1.4"} />
        <circle cx="80" cy="80" r="44" fill={p.innerCase} stroke={p.innerStroke} strokeWidth=".5" />
        <line x1="80" y1="40" x2="80" y2="48" stroke={p.markerColor} strokeWidth="1.6" />
        <line x1="80" y1="112" x2="80" y2="120" stroke={p.markerColor} strokeWidth="1.6" />
        <line x1="40" y1="80" x2="48" y2="80" stroke={p.markerColor} strokeWidth="1.6" />
        <line x1="112" y1="80" x2="120" y2="80" stroke={p.markerColor} strokeWidth="1.6" />
        <text x="80" y="68" textAnchor="middle" fill={p.textColor} fontFamily="Playfair Display,serif" fontSize="6" letterSpacing="2">
          FYNEKINGS
        </text>
        <line x1="80" y1="80" x2="80" y2="50" stroke={p.handColor} strokeWidth="2" strokeLinecap="round" />
        <line x1="80" y1="80" x2="98" y2="70" stroke={p.handColor} strokeWidth="1.6" strokeLinecap="round" />
        <line x1="80" y1="80" x2="64" y2="92" stroke={p.secColor} strokeWidth="1" strokeLinecap="round" />
        <circle cx="80" cy="80" r="3" fill={p.markerColor} />
      </svg>
    );
  }

  return (
    <div
      style={{ position: "absolute", inset: 0 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        setCurrentImg(0);
      }}
    >
      {p.images.map((img, i) => (
        <img
          key={i}
          src={img}
          alt={`${p.name} view ${i + 1}`}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: i === currentImg ? 1 : 0,
            transition: "opacity 0.4s ease",
          }}
        />
      ))}
      {p.images.length > 1 && hovered && (
        <div
          style={{
            position: "absolute",
            bottom: "10px",
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            gap: "5px",
            zIndex: 3,
          }}
        >
          {p.images.map((_, i) => (
            <div
              key={i}
              style={{
                width: i === currentImg ? "16px" : "4px",
                height: "4px",
                background: i === currentImg ? "var(--gold)" : "rgba(255,255,255,.4)",
                borderRadius: "2px",
                transition: "all .3s",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function WatchCatalog({
  initialCategory = "all",
  categoryTitleOverride,
  categoryDescriptionOverride,
  isPremiumOnly = false,
  initialPremiumCollection = "all",
}: {
  initialCategory?: string;
  categoryTitleOverride?: string;
  categoryDescriptionOverride?: string;
  isPremiumOnly?: boolean;
  initialPremiumCollection?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  // URL query params or props
  const paramCategory = searchParams.get("category") || initialCategory;
  const paramPremiumSub = searchParams.get("premiumCollection") || initialPremiumCollection;
  const paramMovement = searchParams.get("movement") || "all";
  const paramStrap = searchParams.get("strap") || "all";
  const paramStyle = searchParams.get("style") || "all";
  const paramPrice = searchParams.get("price") || "all";
  const paramSort = searchParams.get("sort") || "default";
  const paramSearch = searchParams.get("search") || "";

  // Component state
  const [activeCategory, setActiveCategory] = useState(paramCategory);
  const [activePremiumSub, setActivePremiumSub] = useState(paramPremiumSub);
  const [activeMovement, setActiveMovement] = useState(paramMovement);
  const [activeStrap, setActiveStrap] = useState(paramStrap);
  const [activeStyle, setActiveStyle] = useState(paramStyle);
  const [activePrice, setActivePrice] = useState(paramPrice);
  const [activeSort, setActiveSort] = useState(paramSort);
  const [search, setSearch] = useState(paramSearch);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Products state
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const addToCart = useCart((s) => s.addToCart);
  const { handleWishlistClick, isInWishlist } = useWishlistAction();
  const { toggleCompare, isInCompare } = useCompare();

  // Active category object
  const categoryInfo = useMemo(() => {
    if (activeCategory === "all") return null;
    return getCategoryBySlug(activeCategory);
  }, [activeCategory]);

  const premiumSubInfo = useMemo(() => {
    if (!isPremiumOnly || activePremiumSub === "all") return null;
    return getPremiumSubcategoryBySlug(activePremiumSub);
  }, [isPremiumOnly, activePremiumSub]);

  // Sync state if initialCategory or searchParams change externally
  useEffect(() => {
    if (paramCategory && paramCategory !== activeCategory) {
      setActiveCategory(paramCategory);
    }
  }, [paramCategory]);

  useEffect(() => {
    if (paramPremiumSub && paramPremiumSub !== activePremiumSub) {
      setActivePremiumSub(paramPremiumSub);
    }
  }, [paramPremiumSub]);

  // Fetch products with current filters
  useEffect(() => {
    setLoading(true);
    const query = new URLSearchParams();
    if (isPremiumOnly) {
      query.set("premium", "true");
      if (activePremiumSub && activePremiumSub !== "all") {
        query.set("premiumCollection", activePremiumSub);
      }
    } else {
      if (activeCategory && activeCategory !== "all") query.set("category", activeCategory);
    }
    if (activeMovement && activeMovement !== "all") query.set("movement", activeMovement);
    if (activeStrap && activeStrap !== "all") query.set("strap", activeStrap);
    if (activeStyle && activeStyle !== "all") query.set("style", activeStyle);
    if (activePrice && activePrice !== "all") query.set("price", activePrice);
    if (activeSort && activeSort !== "default") query.set("sort", activeSort);
    if (search.trim()) query.set("search", search.trim());

    fetch(`/api/products?${query.toString()}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setProducts(data);
        } else {
          setProducts([]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fetch products error:", err);
        setProducts([]);
        setLoading(false);
      });
  }, [isPremiumOnly, activePremiumSub, activeCategory, activeMovement, activeStrap, activeStyle, activePrice, activeSort, search]);

  // Handle category change
  const handleSelectCategory = (slug: string) => {
    setActiveCategory(slug);
    startTransition(() => {
      if (slug === "all") {
        router.push("/collection", { scroll: false });
      } else {
        router.push(`/watches/category/${slug}`, { scroll: false });
      }
    });
  };

  const handleSelectPremiumSub = (slug: string) => {
    setActivePremiumSub(slug);
    startTransition(() => {
      if (slug === "all") {
        router.push("/premium", { scroll: false });
      } else {
        router.push(`/premium/${slug}`, { scroll: false });
      }
    });
  };

  const handleResetFilters = () => {
    setActiveMovement("all");
    setActiveStrap("all");
    setActiveStyle("all");
    setActivePrice("all");
    setSearch("");
  };

  const hasActiveFilters =
    activeMovement !== "all" ||
    activeStrap !== "all" ||
    activeStyle !== "all" ||
    activePrice !== "all" ||
    Boolean(search.trim());

  // Page title and subtitle
  const pageTitle =
    categoryTitleOverride ||
    (isPremiumOnly
      ? premiumSubInfo
        ? `${premiumSubInfo.label}`
        : "The Premium Collection"
      : categoryInfo
      ? `${categoryInfo.label} Collection`
      : "The Full Collection");

  const pageDescription =
    categoryDescriptionOverride ||
    (isPremiumOnly
      ? premiumSubInfo
        ? premiumSubInfo.description
        : "Our most elevated and prestigious horological expressions. Strictly curated for connoisseurs, each reference showcases haute horlogerie finishing, precious materials, and distinguished provenance."
      : categoryInfo
      ? categoryInfo.description
      : "Every Fynekings timepiece, hand-finished in Lagos. Each piece signed, numbered, and shipped insured worldwide.");

  return (
    <div style={{ background: "var(--black)", minHeight: "100vh", fontFamily: "Raleway, sans-serif", color: "var(--text)" }}>
      <Nav />

      {/* Hero Header */}
      <div
        style={{
          background: isPremiumOnly
            ? "radial-gradient(ellipse at 50% -20%, rgba(196,169,98,0.18) 0%, rgba(12,12,12,0.98) 65%, rgba(6,6,6,1) 100%)"
            : "linear-gradient(180deg, rgba(17,17,17,0.95) 0%, rgba(8,8,8,1) 100%)",
          borderBottom: isPremiumOnly ? "1px solid rgba(196,169,98,0.25)" : "1px solid var(--dark3)",
          padding: "140px 64px 50px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ maxWidth: "1380px", margin: "0 auto", position: "relative", zIndex: 1 }}>
          {/* Breadcrumb */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px", fontSize: ".52rem", letterSpacing: ".3em", textTransform: "uppercase" }}>
            <Link href="/" style={{ color: "var(--muted)", textDecoration: "none" }}>
              Home
            </Link>
            <span style={{ color: "var(--dark4)" }}>→</span>
            {isPremiumOnly ? (
              <>
                <Link href="/premium" style={{ color: activePremiumSub === "all" ? "var(--gold)" : "var(--muted)", textDecoration: "none" }}>
                  The Premium Collection
                </Link>
                {activePremiumSub !== "all" && (
                  <>
                    <span style={{ color: "var(--dark4)" }}>→</span>
                    <span style={{ color: "var(--gold)" }}>
                      {premiumSubInfo?.label || activePremiumSub}
                    </span>
                  </>
                )}
              </>
            ) : (
              <>
                <Link href="/collection" style={{ color: activeCategory === "all" ? "var(--gold)" : "var(--muted)", textDecoration: "none" }}>
                  Watches
                </Link>
                {categoryInfo && (
                  <>
                    <span style={{ color: "var(--dark4)" }}>→</span>
                    <span style={{ color: "var(--gold)" }}>{categoryInfo.label}</span>
                  </>
                )}
              </>
            )}
          </div>

          {isPremiumOnly && (
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                background: "rgba(196,169,98,0.12)",
                border: "1px solid rgba(196,169,98,0.35)",
                padding: "4px 12px",
                borderRadius: "2px",
                marginBottom: "16px",
                fontSize: ".5rem",
                letterSpacing: ".25em",
                color: "var(--gold)",
                textTransform: "uppercase",
                fontWeight: 600,
              }}
            >
              <span>✦</span>
              <span>HAUTE HORLOGERIE & ATELIER EDITIONS</span>
            </div>
          )}

          <h1
            style={{
              fontFamily: "Playfair Display, serif",
              fontSize: "clamp(2.4rem, 5.5vw, 4.6rem)",
              fontWeight: 300,
              color: "var(--white)",
              marginBottom: "14px",
              letterSpacing: "-.02em",
              lineHeight: 1.15,
            }}
          >
            {pageTitle}
          </h1>

          <p
            style={{
              fontSize: ".7rem",
              letterSpacing: ".1em",
              color: isPremiumOnly ? "rgba(244, 239, 228, 0.75)" : "var(--muted)",
              lineHeight: 2.2,
              maxWidth: "680px",
              marginBottom: "36px",
            }}
          >
            {pageDescription}
          </p>

          {/* Quick Categories Bar */}
          <div
            style={{
              display: "flex",
              gap: "8px",
              overflowX: "auto",
              paddingBottom: "8px",
              scrollbarWidth: "none",
            }}
          >
            {isPremiumOnly ? (
              <>
                <button
                  onClick={() => handleSelectPremiumSub("all")}
                  style={{
                    padding: "10px 18px",
                    fontSize: ".55rem",
                    letterSpacing: ".2em",
                    textTransform: "uppercase",
                    borderRadius: "30px",
                    border: activePremiumSub === "all" ? "1px solid var(--gold)" : "1px solid var(--dark4)",
                    background: activePremiumSub === "all" ? "rgba(196,169,98,.2)" : "rgba(20,20,20,.6)",
                    color: activePremiumSub === "all" ? "var(--gold)" : "var(--muted)",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    fontFamily: "Raleway, sans-serif",
                    transition: "all .3s ease",
                  }}
                >
                  All Premium
                </button>
                {PREMIUM_SUBCATEGORIES.map((sub) => {
                  const isSelected = activePremiumSub === sub.slug;
                  return (
                    <button
                      key={sub.slug}
                      onClick={() => handleSelectPremiumSub(sub.slug)}
                      style={{
                        padding: "10px 18px",
                        fontSize: ".55rem",
                        letterSpacing: ".2em",
                        textTransform: "uppercase",
                        borderRadius: "30px",
                        border: isSelected ? "1px solid var(--gold)" : "1px solid var(--dark4)",
                        background: isSelected ? "rgba(196,169,98,.2)" : "rgba(20,20,20,.6)",
                        color: isSelected ? "var(--gold)" : "var(--muted)",
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        fontFamily: "Raleway, sans-serif",
                        transition: "all .3s ease",
                      }}
                    >
                      <span style={{ color: "var(--gold)", opacity: 0.9 }}>{sub.icon}</span>
                      <span>{sub.label}</span>
                    </button>
                  );
                })}
              </>
            ) : (
              <>
                <button
                  onClick={() => handleSelectCategory("all")}
                  style={{
                    padding: "10px 18px",
                    fontSize: ".55rem",
                    letterSpacing: ".2em",
                    textTransform: "uppercase",
                    borderRadius: "30px",
                    border: activeCategory === "all" ? "1px solid var(--gold)" : "1px solid var(--dark4)",
                    background: activeCategory === "all" ? "rgba(196,169,98,.15)" : "rgba(20,20,20,.6)",
                    color: activeCategory === "all" ? "var(--gold)" : "var(--muted)",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    fontFamily: "Raleway, sans-serif",
                    transition: "all .3s ease",
                  }}
                >
                  All Watches
                </button>
                {CATEGORIES.map((cat) => {
                  const isSelected = activeCategory === cat.slug;
                  return (
                    <button
                      key={cat.slug}
                      onClick={() => handleSelectCategory(cat.slug)}
                      style={{
                        padding: "10px 18px",
                        fontSize: ".55rem",
                        letterSpacing: ".2em",
                        textTransform: "uppercase",
                        borderRadius: "30px",
                        border: isSelected ? "1px solid var(--gold)" : "1px solid var(--dark4)",
                        background: isSelected ? "rgba(196,169,98,.15)" : "rgba(20,20,20,.6)",
                        color: isSelected ? "var(--gold)" : "var(--muted)",
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        fontFamily: "Raleway, sans-serif",
                        transition: "all .3s ease",
                      }}
                    >
                      <span style={{ opacity: 0.8 }}>{cat.icon}</span>
                      <span>{cat.label}</span>
                    </button>
                  );
                })}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Catalog View: Sidebar + Products */}
      <div style={{ maxWidth: "1380px", margin: "0 auto", padding: "40px 64px 120px" }}>
        {/* Top Control Bar: Search + Mobile Filter Trigger + Sort + Count */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "20px",
            paddingBottom: "24px",
            borderBottom: "1px solid var(--dark3)",
            marginBottom: "32px",
          }}
        >
          {/* Search Input */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              background: "var(--dark2)",
              border: "1px solid var(--dark4)",
              padding: "10px 16px",
              minWidth: "260px",
              flex: "0 1 340px",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Search by model, series..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                background: "none",
                border: "none",
                outline: "none",
                color: "var(--white)",
                fontSize: ".62rem",
                letterSpacing: ".1em",
                fontFamily: "Raleway, sans-serif",
                width: "100%",
              }}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: ".7rem" }}
              >
                ✕
              </button>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="catalog-mobile-filter-btn"
              style={{
                display: "none",
                padding: "10px 16px",
                background: "var(--dark2)",
                border: "1px solid var(--dark4)",
                color: "var(--gold)",
                fontSize: ".55rem",
                letterSpacing: ".15em",
                textTransform: "uppercase",
                cursor: "pointer",
              }}
            >
              ☰ Filters {hasActiveFilters && "•"}
            </button>

            {/* Results count */}
            <span style={{ fontSize: ".55rem", letterSpacing: ".25em", color: "var(--muted)", textTransform: "uppercase" }}>
              {loading ? "Searching atelier..." : `${products.length} Timepiece${products.length !== 1 ? "s" : ""}`}
            </span>

            {/* Sort Dropdown */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: ".5rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".15em" }}>Sort:</span>
              <select
                value={activeSort}
                onChange={(e) => setActiveSort(e.target.value)}
                style={{
                  background: "var(--dark2)",
                  border: "1px solid var(--dark4)",
                  color: "var(--white)",
                  fontFamily: "Raleway, sans-serif",
                  fontSize: ".55rem",
                  letterSpacing: ".15em",
                  padding: "10px 14px",
                  outline: "none",
                  cursor: "pointer",
                }}
              >
                {SORT_OPTIONS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Active Filter Pills */}
        {hasActiveFilters && (
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px", marginBottom: "28px" }}>
            <span style={{ fontSize: ".5rem", letterSpacing: ".2em", textTransform: "uppercase", color: "var(--muted)", marginRight: "4px" }}>
              Active Filters:
            </span>

            {activeMovement !== "all" && (
              <span
                style={{
                  fontSize: ".5rem",
                  background: "rgba(196,169,98,.12)",
                  border: "1px solid var(--gold)",
                  color: "var(--gold)",
                  padding: "4px 10px",
                  borderRadius: "2px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  textTransform: "uppercase",
                }}
              >
                Movement: {activeMovement}
                <button
                  onClick={() => setActiveMovement("all")}
                  style={{ background: "none", border: "none", color: "var(--gold)", cursor: "pointer", padding: 0 }}
                >
                  ✕
                </button>
              </span>
            )}

            {activeStrap !== "all" && (
              <span
                style={{
                  fontSize: ".5rem",
                  background: "rgba(196,169,98,.12)",
                  border: "1px solid var(--gold)",
                  color: "var(--gold)",
                  padding: "4px 10px",
                  borderRadius: "2px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  textTransform: "uppercase",
                }}
              >
                Strap: {activeStrap}
                <button
                  onClick={() => setActiveStrap("all")}
                  style={{ background: "none", border: "none", color: "var(--gold)", cursor: "pointer", padding: 0 }}
                >
                  ✕
                </button>
              </span>
            )}

            {activeStyle !== "all" && (
              <span
                style={{
                  fontSize: ".5rem",
                  background: "rgba(196,169,98,.12)",
                  border: "1px solid var(--gold)",
                  color: "var(--gold)",
                  padding: "4px 10px",
                  borderRadius: "2px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  textTransform: "uppercase",
                }}
              >
                Style: {activeStyle}
                <button
                  onClick={() => setActiveStyle("all")}
                  style={{ background: "none", border: "none", color: "var(--gold)", cursor: "pointer", padding: 0 }}
                >
                  ✕
                </button>
              </span>
            )}

            {activePrice !== "all" && (
              <span
                style={{
                  fontSize: ".5rem",
                  background: "rgba(196,169,98,.12)",
                  border: "1px solid var(--gold)",
                  color: "var(--gold)",
                  padding: "4px 10px",
                  borderRadius: "2px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  textTransform: "uppercase",
                }}
              >
                Price: {PRICE_RANGES.find((p) => p.id === activePrice)?.label || activePrice}
                <button
                  onClick={() => setActivePrice("all")}
                  style={{ background: "none", border: "none", color: "var(--gold)", cursor: "pointer", padding: 0 }}
                >
                  ✕
                </button>
              </span>
            )}

            {search && (
              <span
                style={{
                  fontSize: ".5rem",
                  background: "rgba(196,169,98,.12)",
                  border: "1px solid var(--gold)",
                  color: "var(--gold)",
                  padding: "4px 10px",
                  borderRadius: "2px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  textTransform: "uppercase",
                }}
              >
                Query: &quot;{search}&quot;
                <button
                  onClick={() => setSearch("")}
                  style={{ background: "none", border: "none", color: "var(--gold)", cursor: "pointer", padding: 0 }}
                >
                  ✕
                </button>
              </span>
            )}

            <button
              onClick={handleResetFilters}
              style={{
                background: "none",
                border: "none",
                color: "var(--muted)",
                fontSize: ".5rem",
                letterSpacing: ".15em",
                textTransform: "uppercase",
                cursor: "pointer",
                textDecoration: "underline",
                marginLeft: "8px",
              }}
            >
              Clear All Filters
            </button>
          </div>
        )}

        {/* Content Layout: Filter Sidebar + Products Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "250px 1fr", gap: "40px", alignItems: "start" }}>
          {/* Desktop Filter Sidebar */}
          <aside className="catalog-filter-sidebar" style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--dark3)", paddingBottom: "12px" }}>
              <span style={{ fontSize: ".58rem", letterSpacing: ".3em", textTransform: "uppercase", color: "var(--gold)" }}>
                Filter Catalog
              </span>
              {hasActiveFilters && (
                <button
                  onClick={handleResetFilters}
                  style={{ background: "none", border: "none", color: "var(--muted)", fontSize: ".48rem", letterSpacing: ".15em", textTransform: "uppercase", cursor: "pointer" }}
                >
                  Reset
                </button>
              )}
            </div>

            {/* Movement Filter */}
            <div>
              <div style={{ fontSize: ".5rem", letterSpacing: ".25em", color: "var(--white)", textTransform: "uppercase", marginBottom: "12px" }}>
                Movement
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: ".58rem", color: activeMovement === "all" ? "var(--gold)" : "var(--muted)", cursor: "pointer" }}>
                  <input
                    type="radio"
                    name="movement"
                    checked={activeMovement === "all"}
                    onChange={() => setActiveMovement("all")}
                    style={{ accentColor: "var(--gold)" }}
                  />
                  <span>All Movements</span>
                </label>
                {MOVEMENT_OPTIONS.map((m) => (
                  <label key={m.id} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: ".58rem", color: activeMovement === m.id ? "var(--gold)" : "var(--muted)", cursor: "pointer" }}>
                    <input
                      type="radio"
                      name="movement"
                      checked={activeMovement === m.id}
                      onChange={() => setActiveMovement(m.id)}
                      style={{ accentColor: "var(--gold)" }}
                    />
                    <span>{m.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Strap Material Filter */}
            <div style={{ borderTop: "1px solid var(--dark3)", paddingTop: "20px" }}>
              <div style={{ fontSize: ".5rem", letterSpacing: ".25em", color: "var(--white)", textTransform: "uppercase", marginBottom: "12px" }}>
                Strap Material
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: ".58rem", color: activeStrap === "all" ? "var(--gold)" : "var(--muted)", cursor: "pointer" }}>
                  <input
                    type="radio"
                    name="strap"
                    checked={activeStrap === "all"}
                    onChange={() => setActiveStrap("all")}
                    style={{ accentColor: "var(--gold)" }}
                  />
                  <span>All Straps</span>
                </label>
                {STRAP_OPTIONS.map((s) => (
                  <label key={s.id} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: ".58rem", color: activeStrap === s.id ? "var(--gold)" : "var(--muted)", cursor: "pointer" }}>
                    <input
                      type="radio"
                      name="strap"
                      checked={activeStrap === s.id}
                      onChange={() => setActiveStrap(s.id)}
                      style={{ accentColor: "var(--gold)" }}
                    />
                    <span>{s.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Style Filter */}
            <div style={{ borderTop: "1px solid var(--dark3)", paddingTop: "20px" }}>
              <div style={{ fontSize: ".5rem", letterSpacing: ".25em", color: "var(--white)", textTransform: "uppercase", marginBottom: "12px" }}>
                Watch Style
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: ".58rem", color: activeStyle === "all" ? "var(--gold)" : "var(--muted)", cursor: "pointer" }}>
                  <input
                    type="radio"
                    name="style"
                    checked={activeStyle === "all"}
                    onChange={() => setActiveStyle("all")}
                    style={{ accentColor: "var(--gold)" }}
                  />
                  <span>All Styles</span>
                </label>
                {STYLE_OPTIONS.map((st) => (
                  <label key={st.id} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: ".58rem", color: activeStyle === st.id ? "var(--gold)" : "var(--muted)", cursor: "pointer" }}>
                    <input
                      type="radio"
                      name="style"
                      checked={activeStyle === st.id}
                      onChange={() => setActiveStyle(st.id)}
                      style={{ accentColor: "var(--gold)" }}
                    />
                    <span>{st.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div style={{ borderTop: "1px solid var(--dark3)", paddingTop: "20px" }}>
              <div style={{ fontSize: ".5rem", letterSpacing: ".25em", color: "var(--white)", textTransform: "uppercase", marginBottom: "12px" }}>
                Price Range
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: ".58rem", color: activePrice === "all" ? "var(--gold)" : "var(--muted)", cursor: "pointer" }}>
                  <input
                    type="radio"
                    name="price"
                    checked={activePrice === "all"}
                    onChange={() => setActivePrice("all")}
                    style={{ accentColor: "var(--gold)" }}
                  />
                  <span>All Prices</span>
                </label>
                {PRICE_RANGES.map((pr) => (
                  <label key={pr.id} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: ".58rem", color: activePrice === pr.id ? "var(--gold)" : "var(--muted)", cursor: "pointer" }}>
                    <input
                      type="radio"
                      name="price"
                      checked={activePrice === pr.id}
                      onChange={() => setActivePrice(pr.id)}
                      style={{ accentColor: "var(--gold)" }}
                    />
                    <span>{pr.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </aside>

          {/* Watches Grid */}
          <main>
            {loading ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: isPremiumOnly ? "20px" : "10px" }}>
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    style={{
                      background: "var(--dark)",
                      border: isPremiumOnly ? "1px solid rgba(196,169,98,.2)" : "1px solid var(--dark3)",
                      aspectRatio: "3/4",
                      opacity: 0.35,
                      animation: "pulse 1.5s infinite",
                    }}
                  />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "90px 30px",
                  background: "var(--dark)",
                  border: isPremiumOnly ? "1px solid rgba(196,169,98,.25)" : "1px solid var(--dark3)",
                }}
              >
                <div style={{ fontSize: "1.8rem", color: "var(--gold)", marginBottom: "12px" }}>⌚</div>
                <h3 style={{ fontFamily: "Playfair Display, serif", fontSize: "1.3rem", color: "var(--white)", marginBottom: "8px" }}>
                  {isPremiumOnly ? "No Premium Timepieces Found" : "No Timepieces Found"}
                </h3>
                <p style={{ fontSize: ".65rem", color: "var(--muted)", letterSpacing: ".1em", maxWidth: "420px", margin: "0 auto 24px", lineHeight: 2 }}>
                  {isPremiumOnly
                    ? "We couldn't find any premium timepieces matching your selected filters. Try resetting the filters or exploring another subcategory."
                    : "We couldn't find any watches matching your selected combination of filters. Try clearing some filters or searching for another series."}
                </p>
                <button
                  onClick={handleResetFilters}
                  style={{
                    padding: "12px 24px",
                    background: "var(--gold)",
                    color: "#000",
                    border: "none",
                    fontSize: ".55rem",
                    letterSpacing: ".2em",
                    textTransform: "uppercase",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: isPremiumOnly ? "20px" : "10px" }}>
                {products.map((p) => {
                  const inWishlist = isInWishlist(p.id);
                  const inCompare = isInCompare(p.id);

                  return (
                    <div
                      key={p.id}
                      style={{
                        background: isPremiumOnly ? "rgba(14, 14, 14, 0.95)" : "var(--dark)",
                        border: isPremiumOnly ? "1px solid rgba(196, 169, 98, 0.28)" : "1px solid var(--dark3)",
                        boxShadow: isPremiumOnly ? "0 8px 24px rgba(0,0,0,0.5)" : "none",
                        position: "relative",
                        cursor: "pointer",
                        transition: "border-color .3s, transform .3s, background .3s, box-shadow .3s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "var(--gold)";
                        e.currentTarget.style.background = isPremiumOnly ? "rgba(20, 20, 20, 0.98)" : "var(--dark2)";
                        if (isPremiumOnly) e.currentTarget.style.boxShadow = "0 12px 32px rgba(196,169,98,0.12)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = isPremiumOnly ? "rgba(196, 169, 98, 0.28)" : "var(--dark3)";
                        e.currentTarget.style.background = isPremiumOnly ? "rgba(14, 14, 14, 0.95)" : "var(--dark)";
                        if (isPremiumOnly) e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.5)";
                      }}
                    >
                      {/* Badges */}
                      {p.isPremium && (
                        <div
                          style={{
                            position: "absolute",
                            top: "12px",
                            left: "12px",
                            zIndex: 10,
                            background: "rgba(10, 10, 10, 0.9)",
                            border: "1px solid var(--gold)",
                            color: "var(--gold)",
                            fontSize: ".46rem",
                            letterSpacing: ".2em",
                            padding: "3px 8px",
                            textTransform: "uppercase",
                            fontWeight: 600,
                            backdropFilter: "blur(6px)",
                            borderRadius: "2px",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          <span style={{ fontSize: ".5rem" }}>✦</span>
                          <span>
                            {p.premiumCollection === "limited-edition"
                              ? "Limited Edition"
                              : p.premiumCollection === "premium-automatic"
                              ? "Premium Automatic"
                              : p.premiumCollection === "premium-chronograph"
                              ? "Premium Chrono"
                              : p.premiumCollection === "premium-men"
                              ? "Premium Men"
                              : p.premiumCollection === "premium-women"
                              ? "Premium Women"
                              : "Premium"}
                          </span>
                        </div>
                      )}
                      {p.badge && <div className="badge-sold">{p.badge}</div>}
                      {p.badgeNew && <div className="badge-new">{p.badgeNew}</div>}

                      {/* Wishlist & Compare Buttons */}
                      <div style={{ position: "absolute", top: "12px", right: "12px", zIndex: 10, display: "flex", gap: "6px" }}>
                        <button
                          onClick={(e) => handleWishlistClick(e, p.slug || p.id)}
                          style={{
                            background: "rgba(12, 12, 12, 0.8)",
                            backdropFilter: "blur(4px)",
                            border: inWishlist ? "1px solid var(--gold)" : "1px solid var(--dark4)",
                            color: inWishlist ? "var(--gold)" : "var(--muted)",
                            width: "32px",
                            height: "32px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            fontSize: ".75rem",
                          }}
                          title={inWishlist ? "Remove from Wishlist" : "Save to Wishlist"}
                        >
                          {inWishlist ? "♥" : "♡"}
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleCompare({
                              id: p.id,
                              name: p.name,
                              slug: p.slug,
                              series: p.series,
                              price: p.price,
                              strapColor: p.strapColor,
                              caseColor: p.caseColor,
                              caseStroke: p.caseStroke,
                              images: p.images,
                              specs: p.specs || null,
                            });
                          }}
                          style={{
                            background: "rgba(12, 12, 12, 0.8)",
                            backdropFilter: "blur(4px)",
                            border: inCompare ? "1px solid var(--gold)" : "1px solid var(--dark4)",
                            color: inCompare ? "var(--gold)" : "var(--muted)",
                            width: "32px",
                            height: "32px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            fontSize: ".65rem",
                          }}
                          title={inCompare ? "Remove from Compare Matrix" : "Add to Watch Comparison"}
                        >
                          ⚖
                        </button>
                      </div>

                      {/* Image Preview / SVG */}
                      <Link href={`/watches/${p.slug}`} style={{ display: "block", textDecoration: "none" }}>
                        <div
                          style={{
                            aspectRatio: "1",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "30px",
                            background: "linear-gradient(135deg, var(--dark2) 0%, var(--dark) 100%)",
                            position: "relative",
                            overflow: "hidden",
                          }}
                        >
                          <WatchCardImage p={p} />
                        </div>
                      </Link>

                      {/* Info & Details */}
                      <div style={{ padding: "20px 22px", borderTop: "1px solid var(--dark3)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                          <p style={{ fontSize: ".45rem", letterSpacing: ".3em", textTransform: "uppercase", color: "var(--gold)" }}>
                            {p.tag}
                          </p>
                          {p.movement && (
                            <span style={{ fontSize: ".42rem", letterSpacing: ".15em", color: "var(--muted)", textTransform: "uppercase" }}>
                              {p.movement}
                            </span>
                          )}
                        </div>

                        <Link href={`/watches/${p.slug}`} style={{ textDecoration: "none" }}>
                          <p
                            style={{
                              fontFamily: "Playfair Display, serif",
                              fontSize: "1.15rem",
                              fontWeight: 400,
                              color: "var(--white)",
                              marginBottom: "4px",
                              letterSpacing: ".01em",
                              transition: "color .3s",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--gold)")}
                            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--white)")}
                          >
                            {p.name}
                          </p>
                        </Link>

                        <p style={{ fontSize: ".52rem", letterSpacing: ".2em", textTransform: "uppercase", color: "var(--muted)", marginBottom: "16px" }}>
                          {p.series}
                        </p>

                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <p style={{ fontSize: ".85rem", color: "var(--gold)", fontFamily: "Playfair Display, serif" }}>
                            {fmt(p.price)}{" "}
                            <small style={{ fontSize: ".5rem", color: "var(--muted)", fontFamily: "Raleway, sans-serif", letterSpacing: ".15em" }}>
                              + fees
                            </small>
                          </p>
                          {p.stockCount === 0 || p.inStock === false ? (
                            <span style={{ fontSize: ".48rem", letterSpacing: ".2em", color: "#ff6b6b", textTransform: "uppercase", fontWeight: 600 }}>
                              Sold Out
                            </span>
                          ) : (
                            <button
                              onClick={() => addToCart(p.name, p.series, p.price)}
                              style={{
                                fontSize: ".48rem",
                                letterSpacing: ".3em",
                                textTransform: "uppercase",
                                color: "var(--muted)",
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                fontFamily: "Raleway, sans-serif",
                                transition: "color .3s",
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--gold)")}
                              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted)")}
                            >
                              Add →
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      {mobileFiltersOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 999 }}>
          <div
            onClick={() => setMobileFiltersOpen(false)}
            style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)" }}
          />
          <div
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              bottom: 0,
              width: "min(340px, 85vw)",
              background: "#0d0d0d",
              borderLeft: "1px solid var(--dark3)",
              padding: "30px 24px",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "24px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--dark3)", paddingBottom: "16px" }}>
              <span style={{ fontSize: ".6rem", letterSpacing: ".3em", textTransform: "uppercase", color: "var(--gold)" }}>
                Filter Watches
              </span>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                style={{ background: "none", border: "none", color: "var(--white)", fontSize: "1rem", cursor: "pointer" }}
              >
                ✕
              </button>
            </div>

            {/* Movement */}
            <div>
              <div style={{ fontSize: ".5rem", letterSpacing: ".2em", color: "var(--white)", textTransform: "uppercase", marginBottom: "10px" }}>
                Movement
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: ".6rem", color: activeMovement === "all" ? "var(--gold)" : "var(--muted)" }}>
                  <input type="radio" name="m-mob" checked={activeMovement === "all"} onChange={() => setActiveMovement("all")} />
                  All Movements
                </label>
                {MOVEMENT_OPTIONS.map((m) => (
                  <label key={m.id} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: ".6rem", color: activeMovement === m.id ? "var(--gold)" : "var(--muted)" }}>
                    <input type="radio" name="m-mob" checked={activeMovement === m.id} onChange={() => setActiveMovement(m.id)} />
                    {m.label}
                  </label>
                ))}
              </div>
            </div>

            {/* Strap */}
            <div>
              <div style={{ fontSize: ".5rem", letterSpacing: ".2em", color: "var(--white)", textTransform: "uppercase", marginBottom: "10px" }}>
                Strap Material
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: ".6rem", color: activeStrap === "all" ? "var(--gold)" : "var(--muted)" }}>
                  <input type="radio" name="s-mob" checked={activeStrap === "all"} onChange={() => setActiveStrap("all")} />
                  All Straps
                </label>
                {STRAP_OPTIONS.map((s) => (
                  <label key={s.id} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: ".6rem", color: activeStrap === s.id ? "var(--gold)" : "var(--muted)" }}>
                    <input type="radio" name="s-mob" checked={activeStrap === s.id} onChange={() => setActiveStrap(s.id)} />
                    {s.label}
                  </label>
                ))}
              </div>
            </div>

            {/* Style */}
            <div>
              <div style={{ fontSize: ".5rem", letterSpacing: ".2em", color: "var(--white)", textTransform: "uppercase", marginBottom: "10px" }}>
                Watch Style
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: ".6rem", color: activeStyle === "all" ? "var(--gold)" : "var(--muted)" }}>
                  <input type="radio" name="st-mob" checked={activeStyle === "all"} onChange={() => setActiveStyle("all")} />
                  All Styles
                </label>
                {STYLE_OPTIONS.map((st) => (
                  <label key={st.id} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: ".6rem", color: activeStyle === st.id ? "var(--gold)" : "var(--muted)" }}>
                    <input type="radio" name="st-mob" checked={activeStyle === st.id} onChange={() => setActiveStyle(st.id)} />
                    {st.label}
                  </label>
                ))}
              </div>
            </div>

            {/* Price */}
            <div>
              <div style={{ fontSize: ".5rem", letterSpacing: ".2em", color: "var(--white)", textTransform: "uppercase", marginBottom: "10px" }}>
                Price Range
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: ".6rem", color: activePrice === "all" ? "var(--gold)" : "var(--muted)" }}>
                  <input type="radio" name="p-mob" checked={activePrice === "all"} onChange={() => setActivePrice("all")} />
                  All Prices
                </label>
                {PRICE_RANGES.map((pr) => (
                  <label key={pr.id} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: ".6rem", color: activePrice === pr.id ? "var(--gold)" : "var(--muted)" }}>
                    <input type="radio" name="p-mob" checked={activePrice === pr.id} onChange={() => setActivePrice(pr.id)} />
                    {pr.label}
                  </label>
                ))}
              </div>
            </div>

            <div style={{ marginTop: "auto", display: "flex", gap: "10px" }}>
              <button
                onClick={handleResetFilters}
                style={{ flex: 1, padding: "12px", background: "none", border: "1px solid var(--dark4)", color: "var(--muted)", fontSize: ".55rem", textTransform: "uppercase", cursor: "pointer" }}
              >
                Reset
              </button>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                style={{ flex: 2, padding: "12px", background: "var(--gold)", color: "#000", border: "none", fontSize: ".55rem", textTransform: "uppercase", fontWeight: 600, cursor: "pointer" }}
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
