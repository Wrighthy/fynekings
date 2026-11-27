"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import ProductCard from "@/components/ui/ProductCard";
import QuickViewModal from "@/components/ui/QuickViewModal";
import type { Product } from "@/components/catalog/WatchCatalog";

const FILTERS = ["All", "Midnight", "Gold", "Steel", "Limited"];

export default function BestSellers() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/products", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to load products");
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setProducts(data);
        } else {
          setError(true);
        }
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Filter products by selected collection or style
  const filteredProducts = useMemo(() => {
    const filterLower = activeFilter.toLowerCase();
    const sourceList = activeFilter === "All"
      ? products
      : products.filter((p) => {
          const series = (p.series || "").toLowerCase();
          const name = (p.name || "").toLowerCase();
          const tag = (p.tag || "").toLowerCase();
          const badge = (p.badge || "").toLowerCase();
          const badgeNew = (p.badgeNew || "").toLowerCase();
          const categories = Array.isArray(p.categories) ? p.categories.join(" ").toLowerCase() : "";

          if (filterLower === "limited") {
            return (
              series.includes("limited") ||
              badge.includes("limited") ||
              badgeNew.includes("limited") ||
              tag.includes("limited") ||
              categories.includes("limited")
            );
          }
          return (
            series.includes(filterLower) ||
            name.includes(filterLower) ||
            tag.includes(filterLower) ||
            categories.includes(filterLower)
          );
        });

    const list = sourceList.length > 0 ? sourceList : products;
    // Render cleanly in rows of 3 (multiple of 3, e.g. 6 or 9)
    const cleanLimit = list.length >= 6 ? (list.length >= 9 ? 9 : 6) : list.length;
    return list.slice(0, cleanLimit);
  }, [products, activeFilter]);

  return (
    <section id="bestsellers" style={{ background: "var(--black)", padding: "100px 0" }}>
      <div className="sec-inner" style={{ maxWidth: "1340px", margin: "0 auto", padding: "0 24px" }}>
        
        {/* Section Header */}
        <div
          className="products-header reveal"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            flexWrap: "wrap",
            gap: "24px",
            marginBottom: "48px",
          }}
        >
          <div>
            <p
              className="sec-tag"
              style={{
                fontSize: "14px",
                letterSpacing: ".12em",
                color: "var(--gold)",
                textTransform: "uppercase",
                marginBottom: "8px",
                fontWeight: 600,
              }}
            >
              Curated Selection · No. 01
            </p>
            <h2
              className="sec-title"
              style={{
                fontFamily: "Playfair Display, serif",
                fontSize: "clamp(2.2rem, 4vw, 3.4rem)",
                fontWeight: 400,
                color: "var(--white)",
                letterSpacing: "-.02em",
                lineHeight: 1.15,
                margin: "0 0 12px",
              }}
            >
              Best <em style={{ fontStyle: "italic", color: "var(--gold)" }}>Sellers</em>
            </h2>
            <p
              className="sec-desc"
              style={{
                fontSize: "17px",
                color: "var(--muted)",
                lineHeight: 1.7,
                maxWidth: "540px",
                margin: 0,
              }}
            >
              Our most coveted timepieces, ranked by collector demand. Each piece is individually inspected, timed, and dispatched with full insurance coverage nationwide.
            </p>
          </div>

          {/* Quick Category Filters */}
          <div
            className="products-filter"
            style={{
              display: "flex",
              gap: "8px",
              flexWrap: "wrap",
            }}
          >
            {FILTERS.map((f) => (
              <button
                key={f}
                className={`filter-btn ${activeFilter === f ? "active" : ""}`}
                onClick={() => setActiveFilter(f)}
                style={{
                  padding: "8px 18px",
                  background: activeFilter === f ? "var(--gold)" : "var(--dark2)",
                  color: activeFilter === f ? "var(--black)" : "var(--muted)",
                  border: activeFilter === f ? "1px solid var(--gold)" : "1px solid var(--dark3)",
                  fontSize: "14px",
                  letterSpacing: ".12em",
                  textTransform: "uppercase",
                  fontWeight: activeFilter === f ? 700 : 500,
                  cursor: "pointer",
                  transition: "all .2s ease",
                  fontFamily: "Raleway, sans-serif",
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="products-grid reveal">
          {loading ? (
            [...Array(6)].map((_, i) => (
              <div
                key={i}
                style={{
                  background: "var(--dark2)",
                  border: "1px solid var(--dark3)",
                  minHeight: "480px",
                  opacity: 0.5,
                  animation: "pulse 1.5s infinite ease-in-out",
                }}
              />
            ))
          ) : error ? (
            <div
              style={{
                gridColumn: "1 / -1",
                textAlign: "center",
                padding: "80px 20px",
                color: "var(--muted)",
                fontSize: "0.82rem",
                letterSpacing: ".2em",
                textTransform: "uppercase",
                background: "var(--dark)",
                border: "1px solid var(--dark3)",
              }}
            >
              Unable to load collection at this moment. Please refresh your browser.
            </div>
          ) : (
            filteredProducts.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onQuickView={(watch) => setQuickViewProduct(watch)}
              />
            ))
          )}
        </div>

        {/* Section Footer: Link to Full Collection */}
        <div
          className="products-footer reveal"
          style={{
            marginTop: "60px",
            textAlign: "center",
          }}
        >
          <Link
            href="/collection"
            className="view-all"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "12px",
              padding: "16px 36px",
              background: "transparent",
              border: "1px solid var(--gold)",
              color: "var(--gold)",
              textDecoration: "none",
              fontSize: "14px",
              letterSpacing: ".25em",
              textTransform: "uppercase",
              fontWeight: 600,
              transition: "all .3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--gold)";
              e.currentTarget.style.color = "var(--black)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "var(--gold)";
            }}
          >
            <span>Explore All {products.length > 0 ? `${products.length} Timepieces` : "Watches"}</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M13 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </section>
  );
}
