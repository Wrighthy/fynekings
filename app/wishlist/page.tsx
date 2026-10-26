"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Nav from "@/components/sections/Nav";
import Footer from "@/components/sections/Footer";
import { useAuth } from "@/lib/authStore";
import { useWishlist } from "@/lib/wishlistStore";
import { useCart, fmt } from "@/lib/store";

type Product = {
  id: string;
  name: string;
  slug: string;
  series: string;
  price: number;
  tag: string;
  images: string[];
};

function WishlistContent() {
  const { user } = useAuth();
  const { items, removeFromWishlist, clearWishlist, syncWithServer } = useWishlist();
  const addToCart = useCart((s) => s.addToCart);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    syncWithServer();
  }, [syncWithServer]);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setProducts(data.filter((p: Product) => items.includes(p.id) || items.includes(p.slug)));
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [items]);

  return (
    <div style={{ background: "var(--black)", minHeight: "100vh", fontFamily: "Raleway, sans-serif" }}>
      <Nav />

      {/* Header */}
      <div style={{ padding: "160px 24px 60px", maxWidth: "1200px", margin: "0 auto", textAlign: "center" }}>
        <div style={{ fontSize: ".52rem", letterSpacing: ".45em", color: "var(--gold)", textTransform: "uppercase", marginBottom: "16px" }}>
          Saved Timepieces
        </div>
        <h1 style={{ fontFamily: "Playfair Display, serif", fontSize: "clamp(2.8rem, 6vw, 4.5rem)", fontWeight: 300, color: "var(--white)", marginBottom: "20px" }}>
          Your <em style={{ fontStyle: "italic", color: "var(--gold)" }}>Wishlist</em>
        </h1>
        <p style={{ fontSize: ".7rem", letterSpacing: ".1em", color: "var(--muted)" }}>
          {items.length} {items.length === 1 ? "timepiece" : "timepieces"} saved for future acquisition
        </p>
      </div>

      {/* Grid */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px 100px" }}>
        {!user && items.length > 0 && (
          <div
            style={{
              background: "rgba(201, 168, 76, 0.08)",
              border: "1px solid var(--gold-dk)",
              padding: "16px 24px",
              marginBottom: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "16px",
            }}
          >
            <div>
              <div style={{ fontSize: ".55rem", letterSpacing: ".2em", textTransform: "uppercase", color: "var(--gold)", fontWeight: 600, marginBottom: "4px" }}>
                Guest Wishlist Active
              </div>
              <div style={{ fontSize: ".72rem", color: "var(--muted)", lineHeight: 1.6 }}>
                Your selections are securely saved on this device. Sign in or create an account whenever you wish to synchronize them across all your devices.
              </div>
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <Link
                href="/login?redirect=/wishlist"
                style={{
                  fontSize: ".52rem",
                  letterSpacing: ".15em",
                  textTransform: "uppercase",
                  color: "var(--gold)",
                  textDecoration: "none",
                  border: "1px solid var(--gold-dk)",
                  padding: "8px 16px",
                }}
              >
                Sign In
              </Link>
              <Link
                href="/signup?redirect=/wishlist"
                style={{
                  fontSize: ".52rem",
                  letterSpacing: ".15em",
                  textTransform: "uppercase",
                  background: "var(--gold)",
                  color: "var(--black)",
                  textDecoration: "none",
                  fontWeight: 600,
                  padding: "8px 16px",
                }}
              >
                Create Account
              </Link>
            </div>
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: "center", color: "var(--gold)", padding: "40px", fontFamily: "Playfair Display, serif" }}>
            Loading saved timepieces...
          </div>
        ) : products.length === 0 ? (
          <div style={{ background: "var(--dark2)", border: "1px solid var(--dark3)", padding: "60px 24px", textAlign: "center", maxWidth: "600px", margin: "0 auto" }}>
            <div style={{ fontSize: "2rem", color: "var(--gold)", marginBottom: "16px" }}>♡</div>
            <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: "1.8rem", color: "var(--white)", fontWeight: 300, marginBottom: "16px" }}>
              Your Wishlist is Empty
            </h2>
            <p style={{ fontSize: ".7rem", color: "var(--muted)", marginBottom: "32px", lineHeight: 2 }}>
              Explore our collection and click the heart icon on any timepiece to save it for later.
            </p>
            <Link href="/collection" className="btn-primary" style={{ display: "inline-flex" }}>
              <span>Browse Collection →</span>
            </Link>
          </div>
        ) : (
          <div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "24px" }}>
              <button
                onClick={clearWishlist}
                style={{ background: "none", border: "1px solid var(--dark4)", color: "var(--muted)", padding: "8px 16px", fontSize: ".5rem", letterSpacing: ".2em", textTransform: "uppercase", cursor: "pointer" }}
              >
                Clear All Saved Items
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))", gap: "24px" }}>
              {products.map((p) => (
                <div key={p.id} style={{ background: "var(--dark2)", border: "1px solid var(--dark3)", display: "flex", flexDirection: "column" }}>
                  <div style={{ aspectRatio: "1", background: "var(--dark)", position: "relative", overflow: "hidden" }}>
                    {p.images?.[0] && (
                      <img src={p.images[0]} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    )}
                    <button
                      onClick={() => removeFromWishlist(p.id, !!user)}
                      style={{ position: "absolute", top: "12px", right: "12px", background: "rgba(0,0,0,0.6)", border: "1px solid var(--gold-dk)", color: "var(--gold)", width: "32px", height: "32px", cursor: "pointer" }}
                      title="Remove from wishlist"
                    >
                      ✕
                    </button>
                  </div>

                  <div style={{ padding: "24px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                    <div>
                      <div style={{ fontSize: ".45rem", letterSpacing: ".3em", color: "var(--gold-dk)", textTransform: "uppercase", marginBottom: "4px" }}>{p.series}</div>
                      <h3 style={{ fontFamily: "Playfair Display, serif", fontSize: "1.4rem", color: "var(--white)", fontWeight: 300, marginBottom: "8px" }}>{p.name}</h3>
                      <div style={{ fontFamily: "Playfair Display, serif", fontSize: "1.3rem", color: "var(--gold)", marginBottom: "20px" }}>{fmt(p.price)}</div>
                    </div>

                    <div style={{ display: "flex", gap: "10px" }}>
                      <button
                        onClick={() => addToCart(p.name, p.series, p.price)}
                        style={{ flex: 1, padding: "12px", background: "var(--gold)", color: "var(--black)", border: "none", fontSize: ".52rem", letterSpacing: ".2em", textTransform: "uppercase", fontWeight: 600, cursor: "pointer" }}
                      >
                        Add to Cart
                      </button>
                      <Link
                        href={`/watches/${p.slug}`}
                        style={{ padding: "12px 16px", border: "1px solid var(--gold-dk)", color: "var(--gold)", textDecoration: "none", fontSize: ".52rem", letterSpacing: ".2em", textTransform: "uppercase", display: "flex", alignItems: "center" }}
                      >
                        View →
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

export default function WishlistPage() {
  return <WishlistContent />;
}
