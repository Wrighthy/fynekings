"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { fmt, useCart } from "@/lib/store";
import { useWishlistAction } from "@/lib/wishlistAction";
import type { Product } from "@/components/catalog/WatchCatalog";

type QuickViewModalProps = {
  product: Product | null;
  onClose: () => void;
};

export default function QuickViewModal({ product, onClose }: QuickViewModalProps) {
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const addToCart = useCart((s) => s.addToCart);
  const { isInWishlist, handleWishlistClick } = useWishlistAction();

  useEffect(() => {
    setActiveImg(0);
    setQty(1);
    setAdded(false);
  }, [product]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (product) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [product, onClose]);

  if (!product) return null;

  const inWishlist = isInWishlist(product.slug || product.id);
  const isSoldOut = product.stockCount === 0 || product.inStock === false;
  const isLowStock = !isSoldOut && typeof product.stockCount === "number" && product.stockCount <= 3;

  const handleAdd = () => {
    if (isSoldOut) return;
    for (let i = 0; i < qty; i++) {
      addToCart(product.name, product.series, product.price);
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 2200);
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.85)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        animation: "fadeIn .2s ease",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#0d0d0d",
          border: "1px solid var(--dark3)",
          boxShadow: "0 30px 70px rgba(0,0,0,0.9)",
          maxWidth: "860px",
          width: "100%",
          maxHeight: "90vh",
          overflowY: "auto",
          position: "relative",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 380px), 1fr))",
          gap: "0",
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close Quick View"
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            background: "rgba(18,18,18,.8)",
            border: "1px solid var(--dark4)",
            color: "var(--muted)",
            width: "36px",
            height: "36px",
            fontSize: "1rem",
            cursor: "pointer",
            zIndex: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all .2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "var(--gold)";
            e.currentTarget.style.borderColor = "var(--gold)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "var(--muted)";
            e.currentTarget.style.borderColor = "var(--dark4)";
          }}
        >
          ✕
        </button>

        {/* Left: Image Viewer */}
        <div
          style={{
            background: "linear-gradient(135deg, #141414 0%, #080808 100%)",
            padding: "36px 28px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            borderRight: "1px solid var(--dark3)",
            position: "relative",
          }}
        >
          <div
            style={{
              width: "100%",
              aspectRatio: "1",
              maxWidth: "340px",
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {product.images && product.images.length > 0 ? (
              <img
                src={product.images[activeImg] || product.images[0]}
                alt={product.name}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  animation: "fadeIn .25s ease",
                }}
              />
            ) : (
              <div style={{ color: "var(--gold)", fontSize: ".8rem", letterSpacing: ".2em" }}>
                FYNEKINGS
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div
              style={{
                display: "flex",
                gap: "8px",
                marginTop: "20px",
                overflowX: "auto",
                maxWidth: "100%",
                padding: "4px",
              }}
            >
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  style={{
                    width: "48px",
                    height: "48px",
                    padding: 0,
                    background: "#161616",
                    border: i === activeImg ? "1px solid var(--gold)" : "1px solid var(--dark3)",
                    opacity: i === activeImg ? 1 : 0.6,
                    cursor: "pointer",
                    overflow: "hidden",
                    flexShrink: 0,
                  }}
                >
                  <img src={img} alt={`View ${i + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Details & Actions */}
        <div style={{ padding: "36px 32px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            {/* Top Status & Series */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px", gap: "10px" }}>
              <span style={{ fontSize: ".68rem", letterSpacing: ".2em", textTransform: "uppercase", color: "var(--gold)", fontWeight: 600 }}>
                {product.series}
              </span>
              {isSoldOut ? (
                <span
                  style={{
                    fontSize: ".62rem",
                    letterSpacing: ".15em",
                    textTransform: "uppercase",
                    padding: "3px 8px",
                    background: "rgba(255, 75, 75, 0.12)",
                    border: "1px solid rgba(255, 75, 75, 0.4)",
                    color: "#ff6b6b",
                    fontWeight: 600,
                  }}
                >
                  Sold Out
                </span>
              ) : isLowStock ? (
                <span
                  style={{
                    fontSize: ".62rem",
                    letterSpacing: ".15em",
                    textTransform: "uppercase",
                    padding: "3px 8px",
                    background: "rgba(196, 169, 98, 0.15)",
                    border: "1px solid var(--gold)",
                    color: "var(--gold)",
                    fontWeight: 600,
                  }}
                >
                  Only {product.stockCount} Left
                </span>
              ) : (
                <span
                  style={{
                    fontSize: ".62rem",
                    letterSpacing: ".15em",
                    textTransform: "uppercase",
                    padding: "3px 8px",
                    background: "rgba(46, 213, 115, 0.12)",
                    border: "1px solid rgba(46, 213, 115, 0.4)",
                    color: "#2ed573",
                    fontWeight: 600,
                  }}
                >
                  In Stock · Ready to Dispatch
                </span>
              )}
            </div>

            {/* Product Title */}
            <h2
              style={{
                fontFamily: "Playfair Display, serif",
                fontSize: "1.75rem",
                fontWeight: 400,
                color: "var(--white)",
                margin: "0 0 6px",
                lineHeight: 1.15,
              }}
            >
              {product.name}
            </h2>

            {/* Tag / Category */}
            <div style={{ fontSize: ".72rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".12em", marginBottom: "16px" }}>
              {product.tag} {product.movement ? `· ${product.movement}` : ""}
            </div>

            {/* Price */}
            <div style={{ display: "flex", alignItems: "baseline", gap: "10px", marginBottom: "18px" }}>
              <span style={{ fontFamily: "Playfair Display, serif", fontSize: "1.6rem", color: "var(--gold)", fontWeight: 500 }}>
                {fmt(product.price)}
              </span>
              <span style={{ fontSize: ".7rem", color: "#888", letterSpacing: ".05em" }}>
                + standard checkout fees
              </span>
            </div>

            {/* Description */}
            <p style={{ fontSize: ".82rem", lineHeight: 1.6, color: "#d0d0d0", margin: "0 0 20px" }}>
              {product.description ||
                "A distinguished luxury timepiece crafted with meticulous attention to detail and hand-finished in our Lagos atelier."}
            </p>

            {/* Key Specs summary */}
            {product.specs && typeof product.specs === "object" && (
              <div
                style={{
                  background: "#141414",
                  border: "1px solid var(--dark3)",
                  padding: "12px 14px",
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "8px 14px",
                  marginBottom: "22px",
                }}
              >
                {product.specs.movement && (
                  <div>
                    <div style={{ fontSize: ".58rem", color: "#888", textTransform: "uppercase", letterSpacing: ".1em" }}>Movement</div>
                    <div style={{ fontSize: ".74rem", color: "var(--white)", fontWeight: 500 }}>{product.specs.movement}</div>
                  </div>
                )}
                {product.specs.caseDiameter && (
                  <div>
                    <div style={{ fontSize: ".58rem", color: "#888", textTransform: "uppercase", letterSpacing: ".1em" }}>Case Size</div>
                    <div style={{ fontSize: ".74rem", color: "var(--white)", fontWeight: 500 }}>{product.specs.caseDiameter}</div>
                  </div>
                )}
                {product.specs.waterResistance && (
                  <div>
                    <div style={{ fontSize: ".58rem", color: "#888", textTransform: "uppercase", letterSpacing: ".1em" }}>Water Resistance</div>
                    <div style={{ fontSize: ".74rem", color: "var(--white)", fontWeight: 500 }}>{product.specs.waterResistance}</div>
                  </div>
                )}
                {product.specs.strap && (
                  <div>
                    <div style={{ fontSize: ".58rem", color: "#888", textTransform: "uppercase", letterSpacing: ".1em" }}>Strap / Bracelet</div>
                    <div style={{ fontSize: ".74rem", color: "var(--white)", fontWeight: 500 }}>{product.specs.strap}</div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Row */}
          <div>
            {!isSoldOut && (
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px" }}>
                {/* Quantity Stepper */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    border: "1px solid var(--dark4)",
                    background: "#141414",
                    height: "44px",
                  }}
                >
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--white)",
                      width: "36px",
                      height: "100%",
                      cursor: "pointer",
                      fontSize: "1rem",
                    }}
                  >
                    -
                  </button>
                  <span
                    style={{
                      width: "32px",
                      textAlign: "center",
                      color: "var(--gold)",
                      fontWeight: 600,
                      fontSize: ".85rem",
                    }}
                  >
                    {qty}
                  </span>
                  <button
                    onClick={() => setQty((q) => q + 1)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--white)",
                      width: "36px",
                      height: "100%",
                      cursor: "pointer",
                      fontSize: "1rem",
                    }}
                  >
                    +
                  </button>
                </div>

                {/* Primary Add to Cart */}
                <button
                  onClick={handleAdd}
                  style={{
                    flex: 1,
                    height: "44px",
                    background: added ? "#2ed573" : "var(--gold)",
                    color: "var(--black)",
                    border: "none",
                    fontSize: ".75rem",
                    letterSpacing: ".2em",
                    textTransform: "uppercase",
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "all .25s ease",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                  }}
                  onMouseEnter={(e) => {
                    if (!added) e.currentTarget.style.background = "var(--gold-lt)";
                  }}
                  onMouseLeave={(e) => {
                    if (!added) e.currentTarget.style.background = "var(--gold)";
                  }}
                >
                  {added ? "Added to Cart ✓" : `Add to Cart — ${fmt(product.price * qty)}`}
                </button>

                {/* Wishlist Button */}
                <button
                  onClick={(e) => handleWishlistClick(e, product.slug || product.id)}
                  style={{
                    width: "44px",
                    height: "44px",
                    background: "#141414",
                    border: inWishlist ? "1px solid var(--gold)" : "1px solid var(--dark4)",
                    color: inWishlist ? "var(--gold)" : "var(--muted)",
                    fontSize: "1.2rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all .2s",
                  }}
                  title={inWishlist ? "In Wishlist" : "Save to Wishlist"}
                >
                  {inWishlist ? "♥" : "♡"}
                </button>
              </div>
            )}

            {isSoldOut && (
              <div
                style={{
                  padding: "14px",
                  background: "rgba(255, 75, 75, 0.08)",
                  border: "1px solid rgba(255, 75, 75, 0.25)",
                  color: "#ff8b8b",
                  fontSize: ".78rem",
                  textAlign: "center",
                  textTransform: "uppercase",
                  letterSpacing: ".15em",
                  marginBottom: "14px",
                }}
              >
                Currently Out of Stock · Contact Concierge for Reservation
              </div>
            )}

            {/* Link to Full Page */}
            <Link
              href={`/watches/${product.slug}`}
              onClick={onClose}
              style={{
                display: "block",
                textAlign: "center",
                padding: "10px",
                fontSize: ".72rem",
                letterSpacing: ".15em",
                textTransform: "uppercase",
                color: "var(--gold)",
                textDecoration: "none",
                fontWeight: 600,
                border: "1px solid rgba(196,169,98,.3)",
                transition: "all .2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--gold)";
                e.currentTarget.style.background = "rgba(196,169,98,.08)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(196,169,98,.3)";
                e.currentTarget.style.background = "transparent";
              }}
            >
              View Full Timepiece Specifications & Atelier Craft →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
