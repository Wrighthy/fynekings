"use client";

import { useState, useEffect } from "react";
import { useCart, fmt } from "@/lib/store";

type Product = {
  id: string;
  name: string;
  series: string;
  price: number;
  tag: string;
  badge: string | null;
  badgeNew: string | null;
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
};

const FILTERS = ["All", "Midnight", "Gold", "Steel", "Limited"];

export default function BestSellers() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");
  const addToCart = useCart(s => s.addToCart);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/products", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed");
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

  return (
    <section id="bestsellers" style={{ background: "var(--black)" }}>
      <div className="sec-inner">
        <div className="products-header reveal">
          <div>
            <p className="sec-tag">Curated Selection · No. 01</p>
            <h2 className="sec-title">Best <em>Sellers</em></h2>
            <p className="sec-desc">Our most coveted pieces, ranked by collector demand. Each piece is signed, numbered, and shipped insured worldwide.</p>
          </div>
          <div className="products-filter">
            {FILTERS.map(f => (
              <button
                key={f}
                className={`filter-btn ${activeFilter === f ? "active" : ""}`}
                onClick={() => setActiveFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="products-grid reveal" style={{ transitionDelay: ".2s" }}>
          {loading ? (
            [...Array(4)].map((_, i) => (
              <div key={i} className="product-card" style={{ opacity: 0.4 }}>
                <div className="prod-img" style={{ background: "var(--dark3)", minHeight: "200px" }}></div>
                <div className="prod-info">
                  <div style={{ height: "8px", width: "60%", background: "var(--dark4)", borderRadius: "2px", marginBottom: "12px" }}></div>
                  <div style={{ height: "20px", width: "80%", background: "var(--dark4)", borderRadius: "2px" }}></div>
                </div>
              </div>
            ))
          ) : error ? (
            <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "60px", color: "var(--muted)", fontSize: ".6rem", letterSpacing: ".2em", textTransform: "uppercase" }}>
              Unable to load collection. Please refresh.
            </div>
          ) : (
            products.map(p => (
              <div
                key={p.id}
                className="product-card"
                onClick={() => addToCart(p.name, p.series, p.price)}
              >
                {p.badge && <div className="badge-sold">{p.badge}</div>}
                {p.badgeNew && <div className="badge-new">{p.badgeNew}</div>}
                <div className="prod-img">
                  <svg viewBox="0 0 160 160" width="120" height="120" xmlns="http://www.w3.org/2000/svg">
                    <rect x="63" y="8" width="34" height="40" rx="6" fill={p.strapColor} stroke={p.strapStroke} strokeWidth=".8"/>
                    <rect x="63" y="112" width="34" height="40" rx="6" fill={p.strapColor} stroke={p.strapStroke} strokeWidth=".8"/>
                    <circle cx="80" cy="80" r="50" fill={p.caseColor} stroke={p.caseStroke} strokeWidth={p.strokeWidth}/>
                    <circle cx="80" cy="80" r="44" fill={p.innerCase} stroke={p.innerStroke} strokeWidth=".5"/>
                    <line x1="80" y1="40" x2="80" y2="48" stroke={p.markerColor} strokeWidth="1.6"/>
                    <line x1="80" y1="112" x2="80" y2="120" stroke={p.markerColor} strokeWidth="1.6"/>
                    <line x1="40" y1="80" x2="48" y2="80" stroke={p.markerColor} strokeWidth="1.6"/>
                    <line x1="112" y1="80" x2="120" y2="80" stroke={p.markerColor} strokeWidth="1.6"/>
                    <text x="80" y="68" textAnchor="middle" fill={p.textColor} fontFamily="Playfair Display,serif" fontSize="6" letterSpacing="2">FYNEKINGS</text>
                    <line x1="80" y1="80" x2="80" y2="50" stroke={p.handColor} strokeWidth="2" strokeLinecap="round"/>
                    <line x1="80" y1="80" x2="98" y2="70" stroke={p.handColor} strokeWidth="1.6" strokeLinecap="round"/>
                    <line x1="80" y1="80" x2="64" y2="92" stroke={p.secColor} strokeWidth="1" strokeLinecap="round"/>
                    <circle cx="80" cy="80" r="3" fill={p.markerColor}/>
                  </svg>
                </div>
                <div className="prod-overlay">
                  <div className="prod-overlay-inner">
                    <span>+ Add to Cart</span>
                  </div>
                </div>
                <div className="prod-info">
                  <p className="prod-tag">{p.tag}</p>
                  <p className="prod-name">{p.name}</p>
                  <p className="prod-series">{p.series}</p>
                  <div className="prod-bottom">
                    <p className="prod-price">{fmt(p.price)} <small>+ fees</small></p>
                    <p className="prod-cta">Add →</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="products-footer reveal">
          <a href="#" className="view-all">
            View Full Collection (24 pieces)
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M5 12h14M13 5l7 7-7 7"/>
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}