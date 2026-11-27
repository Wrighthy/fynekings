"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { fmt, useCart } from "@/lib/store";
import { useWishlistAction } from "@/lib/wishlistAction";
import { useCompare } from "@/lib/compareStore";
import type { Product } from "@/components/catalog/WatchCatalog";

type ProductCardProps = {
  product: Product;
  onQuickView?: (product: Product) => void;
};

export default function ProductCard({ product: p, onQuickView }: ProductCardProps) {
  const [currentImg, setCurrentImg] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [added, setAdded] = useState(false);

  const addToCart = useCart((s) => s.addToCart);
  const { isInWishlist, handleWishlistClick } = useWishlistAction();
  const { toggleCompare, isInCompare } = useCompare();

  const inWishlist = isInWishlist(p.slug || p.id);
  const inCompare = isInCompare(p.id);
  const isSoldOut = p.stockCount === 0 || p.inStock === false;
  const isLowStock = !isSoldOut && typeof p.stockCount === "number" && p.stockCount <= 3;

  // Image cycling on hover
  useEffect(() => {
    if (!hovered || !p.images || p.images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentImg((idx) => (idx + 1) % p.images.length);
    }, 1200);
    return () => clearInterval(interval);
  }, [hovered, p.images]);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (isSoldOut) return;
    addToCart(p.name, p.series, p.price);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleQuickViewClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (onQuickView) onQuickView(p);
  };

  const handleCompareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
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
      specs: (p.specs as Record<string, string>) || null,
    });
  };

  return (
    <div
      className="fynekings-product-card"
      style={{
        background: "var(--dark)",
        border: "1px solid var(--dark3)",
        borderRadius: "2px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        position: "relative",
        transition: "border-color .3s ease, box-shadow .3s ease, transform .3s ease",
        overflow: "hidden",
      }}
      onMouseEnter={(e) => {
        setHovered(true);
        e.currentTarget.style.borderColor = "var(--gold-dk)";
        e.currentTarget.style.boxShadow = "0 12px 36px rgba(0,0,0,0.7)";
      }}
      onMouseLeave={(e) => {
        setHovered(false);
        setCurrentImg(0);
        e.currentTarget.style.borderColor = "var(--dark3)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {/* Top Media Container */}
      <div
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "1 / 1",
          background: "#ffffff",
          overflow: "hidden",
        }}
      >
        
        {/* Availability Badge */}
        <div style={{ position: "absolute", top: "14px", left: "14px", zIndex: 5, display: "flex", flexDirection: "column", gap: "6px" }}>
          {isSoldOut ? (
            <span
              style={{
                fontSize: "12px",
                letterSpacing: ".15em",
                textTransform: "uppercase",
                padding: "4px 10px",
                background: "rgba(10, 10, 10, 0.88)",
                border: "1px solid rgba(255, 75, 75, 0.7)",
                color: "#ff6b6b",
                fontWeight: 600,
                backdropFilter: "blur(4px)",
              }}
            >
              Sold Out
            </span>
          ) : isLowStock ? (
            <span
              style={{
                fontSize: "12px",
                letterSpacing: ".15em",
                textTransform: "uppercase",
                padding: "4px 10px",
                background: "rgba(10, 10, 10, 0.88)",
                border: "1px solid var(--gold)",
                color: "var(--gold)",
                fontWeight: 600,
                backdropFilter: "blur(4px)",
              }}
            >
              Only {p.stockCount} Left
            </span>
          ) : (
            <span
              style={{
                fontSize: "12px",
                letterSpacing: ".15em",
                textTransform: "uppercase",
                padding: "4px 10px",
                background: "rgba(10, 10, 10, 0.88)",
                border: "1px solid rgba(46, 213, 115, 0.6)",
                color: "#2ed573",
                fontWeight: 600,
                backdropFilter: "blur(4px)",
              }}
            >
              In Stock
            </span>
          )}

          {/* Marketing Badges */}
          {p.badge && (
            <span
              style={{
                fontSize: "12px",
                letterSpacing: ".12em",
                textTransform: "uppercase",
                padding: "4px 10px",
                background: "var(--gold)",
                color: "var(--black)",
                fontWeight: 700,
                boxShadow: "0 2px 8px rgba(0,0,0,0.35)",
              }}
            >
              {p.badge}
            </span>
          )}
          {p.badgeNew && (
            <span
              style={{
                fontSize: "12px",
                letterSpacing: ".12em",
                textTransform: "uppercase",
                padding: "4px 10px",
                background: "rgba(10, 10, 10, 0.88)",
                border: "1px solid var(--gold)",
                color: "var(--gold)",
                fontWeight: 600,
                backdropFilter: "blur(4px)",
              }}
            >
              {p.badgeNew}
            </span>
          )}
        </div>

        {/* Product Image Link */}
        <Link href={`/watches/${p.slug}`} style={{ display: "block", width: "100%", height: "100%", position: "relative" }}>
          {p.images && p.images.length > 0 ? (
            <>
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
                    objectFit: "contain",
                    padding: "20px",
                    opacity: i === currentImg ? 1 : 0,
                    transition: "opacity 0.4s ease",
                  }}
                />
              ))}
              {/* Image Indicators */}
              {p.images.length > 1 && hovered && (
                <div
                  style={{
                    position: "absolute",
                    bottom: "12px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    display: "flex",
                    gap: "5px",
                    zIndex: 4,
                  }}
                >
                  {p.images.map((_, i) => (
                    <div
                      key={i}
                      style={{
                        width: i === currentImg ? "16px" : "5px",
                        height: "4px",
                        background: i === currentImg ? "var(--gold)" : "rgba(0,0,0,0.3)",
                        borderRadius: "2px",
                        transition: "all .25s ease",
                      }}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
              <svg viewBox="0 0 160 160" width="160" height="160" xmlns="http://www.w3.org/2000/svg">
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
                <circle cx="80" cy="80" r="3" fill={p.markerColor} />
              </svg>
            </div>
          )}
        </Link>

        {/* Hover Overlay: Dark overlay with action icons + Add to Cart */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0, 0, 0, 0.58)",
            backdropFilter: "blur(2px)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "16px",
            zIndex: 7,
            opacity: hovered ? 1 : 0,
            pointerEvents: hovered ? "auto" : "none",
            transition: "opacity 0.3s ease",
          }}
        >
          {/* Quick Action Icons Row */}
          <div style={{ display: "flex", gap: "10px" }}>
            {/* Wishlist Button */}
            <button
              onClick={(e) => handleWishlistClick(e, p.slug || p.id)}
              aria-label={inWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
              style={{
                background: "rgba(14, 14, 14, 0.9)",
                backdropFilter: "blur(6px)",
                border: inWishlist ? "1px solid var(--gold)" : "1px solid rgba(255,255,255,0.3)",
                color: inWishlist ? "var(--gold)" : "var(--white)",
                width: "42px",
                height: "42px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                fontSize: "1.1rem",
                transition: "all .25s ease",
                transform: hovered ? "translateY(0)" : "translateY(8px)",
              }}
              onMouseEnter={(e) => {
                if (!inWishlist) {
                  e.currentTarget.style.borderColor = "var(--gold)";
                  e.currentTarget.style.color = "var(--gold)";
                }
              }}
              onMouseLeave={(e) => {
                if (!inWishlist) {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)";
                  e.currentTarget.style.color = "var(--white)";
                }
              }}
              title={inWishlist ? "In Wishlist" : "Save to Wishlist"}
            >
              {inWishlist ? "♥" : "♡"}
            </button>

            {/* Quick View Button */}
            {onQuickView && (
              <button
                onClick={handleQuickViewClick}
                aria-label="Quick View Timepiece"
                style={{
                  background: "rgba(14, 14, 14, 0.9)",
                  backdropFilter: "blur(6px)",
                  border: "1px solid rgba(255,255,255,0.3)",
                  color: "var(--white)",
                  width: "42px",
                  height: "42px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  transition: "all .25s ease",
                  transform: hovered ? "translateY(0)" : "translateY(8px)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--gold)";
                  e.currentTarget.style.color = "var(--gold)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)";
                  e.currentTarget.style.color = "var(--white)";
                }}
                title="Quick View"
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </button>
            )}

            {/* Compare Button */}
            <button
              onClick={handleCompareClick}
              aria-label="Compare Timepiece"
              style={{
                background: "rgba(14, 14, 14, 0.9)",
                backdropFilter: "blur(6px)",
                border: inCompare ? "1px solid var(--gold)" : "1px solid rgba(255,255,255,0.3)",
                color: inCompare ? "var(--gold)" : "var(--white)",
                width: "42px",
                height: "42px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                fontSize: ".85rem",
                transition: "all .25s ease",
                transform: hovered ? "translateY(0)" : "translateY(8px)",
              }}
              onMouseEnter={(e) => {
                if (!inCompare) {
                  e.currentTarget.style.borderColor = "var(--gold)";
                  e.currentTarget.style.color = "var(--gold)";
                }
              }}
              onMouseLeave={(e) => {
                if (!inCompare) {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)";
                  e.currentTarget.style.color = "var(--white)";
                }
              }}
              title={inCompare ? "In Comparison" : "Compare Model"}
            >
              ⚖
            </button>
          </div>

          {/* Add to Cart Button (centered in overlay) */}
          {isSoldOut ? (
            <button
              disabled
              style={{
                padding: "12px 32px",
                background: "rgba(255, 75, 75, 0.15)",
                border: "1px solid rgba(255, 75, 75, 0.5)",
                color: "#ff8b8b",
                fontSize: "13px",
                letterSpacing: ".18em",
                textTransform: "uppercase",
                fontWeight: 600,
                cursor: "not-allowed",
                borderRadius: "2px",
                transform: hovered ? "translateY(0)" : "translateY(10px)",
                transition: "all .25s ease",
                fontFamily: "Raleway, sans-serif",
              }}
            >
              Sold Out
            </button>
          ) : (
            <button
              onClick={handleAddToCart}
              style={{
                padding: "12px 32px",
                background: added ? "#2ed573" : "var(--gold)",
                border: added ? "1px solid #2ed573" : "1px solid var(--gold)",
                color: "var(--black)",
                fontSize: "14px",
                letterSpacing: ".2em",
                textTransform: "uppercase",
                fontWeight: 700,
                cursor: "pointer",
                borderRadius: "2px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                transform: hovered ? "translateY(0)" : "translateY(10px)",
                transition: "all .25s ease",
                fontFamily: "Raleway, sans-serif",
              }}
              onMouseEnter={(e) => {
                if (!added) {
                  e.currentTarget.style.background = "var(--white)";
                  e.currentTarget.style.borderColor = "var(--white)";
                }
              }}
              onMouseLeave={(e) => {
                if (!added) {
                  e.currentTarget.style.background = "var(--gold)";
                  e.currentTarget.style.borderColor = "var(--gold)";
                }
              }}
            >
              {added ? "Added ✓" : "Add to Cart +"}
            </button>
          )}
        </div>
      </div>

      {/* Information Section */}
      <div style={{ padding: "22px 24px 24px", display: "flex", flexDirection: "column", flex: 1, justifyContent: "space-between", borderTop: "1px solid var(--dark3)" }}>
        <div>
          {/* Tag & Movement Row */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "13px", letterSpacing: ".12em", textTransform: "uppercase", color: "var(--gold)", fontWeight: 600 }}>
              {p.tag}
            </span>
            {p.movement && (
              <span style={{ fontSize: "13px", letterSpacing: ".1em", color: "#b8b8b8", textTransform: "uppercase" }}>
                {p.movement}
              </span>
            )}
          </div>

          {/* Product Name */}
          <Link href={`/watches/${p.slug}`} style={{ textDecoration: "none" }}>
            <h3
              style={{
                fontFamily: "Playfair Display, serif",
                fontSize: "23px",
                fontWeight: 400,
                color: "var(--white)",
                margin: "0 0 6px",
                lineHeight: 1.25,
                transition: "color .2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--gold)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--white)")}
            >
              {p.name}
            </h3>
          </Link>

          {/* Series */}
          <div style={{ fontSize: "14px", letterSpacing: ".12em", textTransform: "uppercase", color: "#b8b8b8", marginBottom: "18px" }}>
            {p.series}
          </div>
        </div>

        {/* Pricing Block */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <div>
              <span style={{ fontFamily: "Playfair Display, serif", fontSize: "22px", color: "var(--gold)", fontWeight: 600 }}>
                {fmt(p.price)}
              </span>
              <span style={{ fontSize: "13px", color: "#b8b8b8", marginLeft: "8px" }}>
                + fees
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
