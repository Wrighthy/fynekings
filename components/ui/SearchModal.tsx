"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { fmt } from "@/lib/store";

type ProductResult = {
  id: string;
  name: string;
  slug: string;
  series: string;
  price: number;
  tag: string;
  images: string[];
  inStock?: boolean;
  stockCount?: number;
};

const SUGGESTIONS = [
  "Automatic Watches",
  "Men's Watches",
  "Women's Watches",
  "Quartz Watches",
  "Royal Heritage",
  "Tourbillon",
  "Chronograph",
  "Gold Edition",
  "Midnight",
];

export default function SearchModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ProductResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 80);
    } else {
      setQuery("");
      setResults([]);
    }
  }, [open]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const timer = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(query.trim())}`)
        .then((r) => r.json())
        .then((data) => {
          if (data && Array.isArray(data.products)) {
            setResults(data.products);
          } else {
            setResults([]);
          }
          setLoading(false);
        })
        .catch(() => {
          setResults([]);
          setLoading(false);
        });
    }, 220);

    return () => clearTimeout(timer);
  }, [query]);

  if (!open) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(5, 5, 5, 0.94)",
        backdropFilter: "blur(18px)",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "80px 24px 40px",
        animation: "fadeIn .25s ease",
        overflowY: "auto",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "820px",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: "24px",
        }}
      >
        {/* Header Bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: "15px", letterSpacing: ".12em", color: "var(--gold)", textTransform: "uppercase", fontWeight: 600 }}>
              Discover Timepieces
            </div>
            <div style={{ fontSize: "15px", color: "var(--muted)", marginTop: "2px" }}>
              Search across movements, series, genders, and calibers
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close search"
            style={{
              background: "var(--dark2)",
              border: "1px solid var(--dark4)",
              color: "var(--gold)",
              width: "42px",
              height: "42px",
              fontSize: "1.1rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all .2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--gold)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--dark4)";
            }}
          >
            ✕
          </button>
        </div>

        {/* Input Box */}
        <div style={{ position: "relative", width: "100%" }}>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by model, series, movement (e.g. Automatic, Tourbillon, Men's)..."
            style={{
              width: "100%",
              padding: "20px 54px 20px 24px",
              background: "var(--dark2)",
              border: "1px solid var(--gold)",
              color: "var(--white)",
              fontSize: "1.15rem",
              fontFamily: "Raleway, sans-serif",
              outline: "none",
              letterSpacing: ".02em",
              boxShadow: "0 8px 30px rgba(0,0,0,0.5)",
            }}
          />
          {query ? (
            <button
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              style={{
                position: "absolute",
                right: "18px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                color: "var(--muted)",
                cursor: "pointer",
                fontSize: "1rem",
                padding: "6px",
              }}
              aria-label="Clear search"
            >
              ✕
            </button>
          ) : loading ? (
            <div
              style={{
                position: "absolute",
                right: "20px",
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: "15px",
                color: "var(--gold)",
                letterSpacing: ".1em",
              }}
            >
              Searching...
            </div>
          ) : null}
        </div>

        {/* Suggestion Chips */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ fontSize: "15px", letterSpacing: ".15em", color: "var(--muted)", textTransform: "uppercase", marginRight: "4px" }}>
            Suggested:
          </span>
          {SUGGESTIONS.map((tag) => (
            <button
              key={tag}
              onClick={() => setQuery(tag)}
              style={{
                padding: "7px 14px",
                background: query === tag ? "var(--gold)" : "var(--dark2)",
                border: query === tag ? "1px solid var(--gold)" : "1px solid var(--dark4)",
                color: query === tag ? "var(--black)" : "var(--text)",
                fontSize: "15px",
                letterSpacing: ".1em",
                cursor: "pointer",
                transition: "all .2s ease",
                fontFamily: "Raleway, sans-serif",
                fontWeight: query === tag ? 700 : 500,
              }}
              onMouseEnter={(e) => {
                if (query !== tag) e.currentTarget.style.borderColor = "var(--gold)";
              }}
              onMouseLeave={(e) => {
                if (query !== tag) e.currentTarget.style.borderColor = "var(--dark4)";
              }}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div style={{ maxHeight: "58vh", overflowY: "auto", display: "flex", flexDirection: "column", gap: "12px", paddingRight: "4px" }}>
          {results.map((p) => {
            const isSoldOut = p.stockCount === 0 || p.inStock === false;
            return (
              <Link
                key={p.id}
                href={`/watches/${p.slug}`}
                onClick={onClose}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "20px",
                  padding: "16px 20px",
                  background: "var(--dark2)",
                  border: "1px solid var(--dark3)",
                  textDecoration: "none",
                  transition: "border-color .25s, background .25s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--dark)";
                  e.currentTarget.style.borderColor = "var(--gold)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "var(--dark2)";
                  e.currentTarget.style.borderColor = "var(--dark3)";
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
                  <div
                    style={{
                      width: "68px",
                      height: "76px",
                      background: "var(--dark3)",
                      flexShrink: 0,
                      overflow: "hidden",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "4px",
                    }}
                  >
                    {p.images && p.images.length > 0 ? (
                      <img src={p.images[0]} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                    ) : (
                      <span style={{ fontSize: "1.4rem", color: "var(--gold)" }}>⌚</span>
                    )}
                  </div>
                  <div>
                    <div style={{ fontSize: "15px", letterSpacing: ".12em", color: "var(--gold)", textTransform: "uppercase", fontWeight: 600 }}>
                      {p.series}
                    </div>
                    <div style={{ fontFamily: "Playfair Display, serif", fontSize: "1.2rem", color: "var(--white)", margin: "4px 0" }}>
                      {p.name}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "15px", color: "var(--muted)" }}>
                      <span>{p.tag}</span>
                      {isSoldOut ? (
                        <span style={{ color: "#ff6b6b", fontWeight: 600 }}>· Sold Out</span>
                      ) : (
                        <span style={{ color: "#4abd7e", fontWeight: 600 }}>· In Stock</span>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontFamily: "Playfair Display, serif", fontSize: "1.25rem", color: "var(--white)", fontWeight: 500 }}>
                    {fmt(p.price)}
                  </div>
                  <div style={{ fontSize: "15px", color: "var(--gold)", marginTop: "4px", letterSpacing: ".05em" }}>
                    View Timepiece →
                  </div>
                </div>
              </Link>
            );
          })}

          {query && !loading && results.length === 0 && (
            <div
              style={{
                padding: "60px 20px",
                color: "var(--muted)",
                textAlign: "center",
                fontSize: "15px",
                background: "var(--dark2)",
                border: "1px solid var(--dark3)",
              }}
            >
              <p style={{ color: "var(--white)", fontSize: "1rem", marginBottom: "8px" }}>
                No timepieces found for &ldquo;{query}&rdquo;
              </p>
              <p style={{ margin: 0 }}>
                Try searching for broader terms such as <span style={{ color: "var(--gold)" }}>Automatic</span>,{" "}
                <span style={{ color: "var(--gold)" }}>Men</span>, or explore our full collection.
              </p>
              <Link
                href="/collection"
                onClick={onClose}
                style={{
                  display: "inline-block",
                  marginTop: "20px",
                  padding: "10px 24px",
                  border: "1px solid var(--gold)",
                  color: "var(--gold)",
                  textDecoration: "none",
                  fontSize: "15px",
                  letterSpacing: ".2em",
                  textTransform: "uppercase",
                  fontWeight: 600,
                }}
              >
                Browse All Timepieces
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
