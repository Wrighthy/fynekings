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
};

export default function SearchModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ProductResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
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
      fetch(`/api/search?q=${encodeURIComponent(query)}`)
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
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  if (!open) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(5, 5, 5, 0.92)",
        backdropFilter: "blur(16px)",
        zIndex: 9990,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "80px 24px 40px",
        animation: "fadeIn .25s ease",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "800px",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: "24px",
        }}
      >
        {/* Header bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontSize: ".55rem", letterSpacing: ".4em", color: "var(--gold-dk)", textTransform: "uppercase" }}>
            Search Timepieces
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "1px solid var(--gold-dk)",
              color: "var(--gold)",
              width: "36px",
              height: "36px",
              fontSize: ".9rem",
              cursor: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ✕
          </button>
        </div>

        {/* Input box */}
        <div style={{ position: "relative", width: "100%" }}>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, series, movement, tag..."
            style={{
              width: "100%",
              padding: "20px 24px",
              background: "var(--dark2)",
              border: "1px solid var(--gold-dk)",
              color: "var(--white)",
              fontSize: "1.1rem",
              fontFamily: "Playfair Display, serif",
              outline: "none",
              letterSpacing: ".05em",
            }}
          />
          {loading && (
            <div style={{ position: "absolute", right: "20px", top: "50%", transform: "translateY(-50%)", fontSize: ".6rem", color: "var(--gold)" }}>
              Searching...
            </div>
          )}
        </div>

        {/* Quick Suggestion Tags */}
        {!query && (
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center", marginTop: "8px" }}>
            <span style={{ fontSize: ".5rem", letterSpacing: ".2em", color: "var(--muted)", textTransform: "uppercase" }}>Popular:</span>
            {["Royal Heritage", "Chronograph", "Automatic", "Tourbillon", "Skeleton", "Rose Gold"].map((tag) => (
              <button
                key={tag}
                onClick={() => setQuery(tag)}
                style={{
                  padding: "6px 14px",
                  background: "var(--dark3)",
                  border: "1px solid var(--dark4)",
                  color: "var(--text)",
                  fontSize: ".55rem",
                  letterSpacing: ".15em",
                  textTransform: "uppercase",
                  cursor: "none",
                }}
              >
                {tag}
              </button>
            ))}
          </div>
        )}

        {/* Results List */}
        <div style={{ maxHeight: "60vh", overflowY: "auto", display: "flex", flexDirection: "column", gap: "12px" }}>
          {results.map((p) => (
            <Link
              key={p.id}
              href={`/watches/${p.slug}`}
              onClick={onClose}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "20px",
                padding: "14px 20px",
                background: "var(--dark)",
                border: "1px solid var(--dark3)",
                textDecoration: "none",
                transition: "border-color .3s, background .3s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--dark2)";
                e.currentTarget.style.borderColor = "var(--gold-dk)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "var(--dark)";
                e.currentTarget.style.borderColor = "var(--dark3)";
              }}
            >
              <div style={{ width: "64px", height: "64px", background: "var(--dark2)", flexShrink: 0, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {p.images && p.images.length > 0 ? (
                  <img src={p.images[0]} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <span style={{ fontSize: "1.2rem", color: "var(--gold)" }}>⌚</span>
                )}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: ".45rem", letterSpacing: ".3em", color: "var(--gold-dk)", textTransform: "uppercase" }}>{p.series}</div>
                <div style={{ fontFamily: "Playfair Display, serif", fontSize: "1.1rem", color: "var(--white)", margin: "2px 0" }}>{p.name}</div>
                <div style={{ fontSize: ".55rem", letterSpacing: ".1em", color: "var(--muted)", textTransform: "uppercase" }}>{p.tag}</div>
              </div>
              <div style={{ fontFamily: "Playfair Display, serif", fontSize: "1.1rem", color: "var(--gold)" }}>
                {fmt(p.price)}
              </div>
            </Link>
          ))}

          {query && !loading && results.length === 0 && (
            <div style={{ padding: "40px", color: "var(--muted)", textAlign: "center", fontSize: ".7rem", letterSpacing: ".15em" }}>
              No timepieces found matching &ldquo;{query}&rdquo;
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
