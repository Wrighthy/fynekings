"use client";

import Link from "next/link";
import Nav from "@/components/sections/Nav";
import Footer from "@/components/sections/Footer";
import { useCompare } from "@/lib/compareStore";
import { useCart, fmt } from "@/lib/store";

export default function ComparePage() {
  const { items, removeFromCompare, clearCompare } = useCompare();
  const addToCart = useCart((s) => s.addToCart);

  const specKeys = ["movement", "caseDiameter", "waterResistance", "glass", "strap", "jewels"];

  return (
    <div style={{ background: "var(--black)", minHeight: "100vh", fontFamily: "Raleway, sans-serif" }}>
      <Nav />

      {/* Header */}
      <div style={{ padding: "160px 24px 60px", maxWidth: "1200px", margin: "0 auto", textAlign: "center" }}>
        <div style={{ fontSize: ".52rem", letterSpacing: ".45em", color: "var(--gold)", textTransform: "uppercase", marginBottom: "16px" }}>
          Horological Comparison Matrix
        </div>
        <h1 style={{ fontFamily: "Playfair Display, serif", fontSize: "clamp(2.8rem, 6vw, 4.5rem)", fontWeight: 300, color: "var(--white)", marginBottom: "20px" }}>
          Timepiece <em style={{ fontStyle: "italic", color: "var(--gold)" }}>Comparison</em>
        </h1>
        <p style={{ fontSize: ".7rem", letterSpacing: ".1em", color: "var(--muted)" }}>
          Comparing {items.length} {items.length === 1 ? "model" : "models"} side by side
        </p>
      </div>

      {/* Main Grid / Matrix */}
      <div style={{ maxWidth: "1300px", margin: "0 auto", padding: "0 24px 100px", overflowX: "auto" }}>
        {items.length === 0 ? (
          <div style={{ background: "var(--dark2)", border: "1px solid var(--dark3)", padding: "60px 24px", textAlign: "center", maxWidth: "600px", margin: "0 auto" }}>
            <div style={{ fontSize: "2rem", color: "var(--gold)", marginBottom: "16px" }}>⚖</div>
            <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: "1.8rem", color: "var(--white)", fontWeight: 300, marginBottom: "16px" }}>
              No Timepieces Selected for Comparison
            </h2>
            <p style={{ fontSize: ".7rem", color: "var(--muted)", marginBottom: "32px", lineHeight: 2 }}>
              Visit our collection page and click &ldquo;Compare&rdquo; on up to 4 models to view technical side-by-side specifications.
            </p>
            <Link href="/collection" className="btn-primary" style={{ display: "inline-flex" }}>
              <span>Browse Collection →</span>
            </Link>
          </div>
        ) : (
          <div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "24px" }}>
              <button
                onClick={clearCompare}
                style={{ background: "none", border: "1px solid var(--dark4)", color: "var(--muted)", padding: "8px 16px", fontSize: ".5rem", letterSpacing: ".2em", textTransform: "uppercase", cursor: "pointer" }}
              >
                Clear Comparison Matrix
              </button>
            </div>

            {/* Matrix Table */}
            <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid var(--dark3)" }}>
              <thead>
                <tr>
                  <th style={{ padding: "24px", background: "var(--dark)", borderRight: "1px solid var(--dark3)", borderBottom: "1px solid var(--dark3)", width: "200px", textAlign: "left", fontSize: ".55rem", letterSpacing: ".3em", color: "var(--gold-dk)", textTransform: "uppercase" }}>
                    Feature / Spec
                  </th>
                  {items.map((item) => (
                    <th key={item.id} style={{ padding: "24px", background: "var(--dark2)", borderRight: "1px solid var(--dark3)", borderBottom: "1px solid var(--dark3)", textAlign: "center", minWidth: "220px" }}>
                      <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center" }}>
                        <button
                          onClick={() => removeFromCompare(item.id)}
                          style={{ position: "absolute", top: "-12px", right: "-12px", background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: ".9rem" }}
                          title="Remove model"
                        >
                          ✕
                        </button>
                        <div style={{ width: "120px", height: "120px", background: "var(--dark)", marginBottom: "16px", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          {item.images?.[0] ? (
                            <img src={item.images[0]} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          ) : (
                            <span style={{ fontSize: "2rem", color: "var(--gold)" }}>⌚</span>
                          )}
                        </div>
                        <div style={{ fontSize: ".45rem", letterSpacing: ".3em", color: "var(--gold-dk)", textTransform: "uppercase" }}>{item.series}</div>
                        <h3 style={{ fontFamily: "Playfair Display, serif", fontSize: "1.2rem", color: "var(--white)", fontWeight: 300, margin: "4px 0 12px" }}>{item.name}</h3>
                        <div style={{ fontFamily: "Playfair Display, serif", fontSize: "1.3rem", color: "var(--gold)", marginBottom: "16px" }}>{fmt(item.price)}</div>
                        <button
                          onClick={() => addToCart(item.name, item.series, item.price)}
                          style={{ width: "100%", padding: "10px", background: "var(--gold)", color: "var(--black)", border: "none", fontSize: ".5rem", letterSpacing: ".2em", textTransform: "uppercase", fontWeight: 600, cursor: "pointer" }}
                        >
                          Add to Cart
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {specKeys.map((key) => (
                  <tr key={key} style={{ borderBottom: "1px solid var(--dark3)" }}>
                    <td style={{ padding: "18px 24px", background: "var(--dark)", borderRight: "1px solid var(--dark3)", fontSize: ".55rem", letterSpacing: ".2em", color: "var(--gold)", textTransform: "uppercase" }}>
                      {key.replace(/([A-Z])/g, " $1").trim()}
                    </td>
                    {items.map((item) => (
                      <td key={item.id} style={{ padding: "18px 24px", background: "var(--dark2)", borderRight: "1px solid var(--dark3)", textAlign: "center", fontSize: ".7rem", color: "var(--white)" }}>
                        {item.specs?.[key] || "Automatic 25 Jewels"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
