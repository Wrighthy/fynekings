"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useCart } from "@/lib/store";
import { useWishlist } from "@/lib/wishlistStore";
import { useCompare } from "@/lib/compareStore";
import { useAuth } from "@/lib/authStore";
import MobileNav from "@/components/ui/MobileNav";
import SearchModal from "@/components/ui/SearchModal";
import SizeGuideModal from "@/components/ui/SizeGuideModal";

import { CATEGORIES } from "@/lib/categories";

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [collectionOpen, setCollectionOpen] = useState(false);

  const cart = useCart((s) => s.cart);
  const setCartOpen = useCart((s) => s.setCartOpen);
  const wishlistCount = useWishlist((s) => s.items.length);
  const compareCount = useCompare((s) => s.items.length);
  const { user, setAuthOpen } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <nav className={scrolled ? "scrolled" : ""}>
        <Link href="/" className="logo">
          <span className="logo-mark">F</span>
          FYNE<span>KINGS</span>
        </Link>

        <ul className="nav-links">
          <li
            onMouseEnter={() => setCollectionOpen(true)}
            onMouseLeave={() => setCollectionOpen(false)}
            style={{ position: "relative" }}
          >
            <Link
              href="/collection"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                color: collectionOpen ? "var(--gold)" : undefined,
              }}
            >
              Collection
              <svg
                width="8"
                height="8"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                style={{
                  transition: "transform .2s ease",
                  transform: collectionOpen ? "rotate(180deg)" : "rotate(0deg)",
                }}
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </Link>

            {/* Dropdown Mega-Menu */}
            {collectionOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  left: "-40px",
                  paddingTop: "16px",
                  zIndex: 1000,
                }}
              >
                <div
                  style={{
                    width: "480px",
                    background: "rgba(12, 12, 12, 0.98)",
                    backdropFilter: "blur(20px)",
                    border: "1px solid var(--dark3)",
                    borderTop: "2px solid var(--gold)",
                    boxShadow: "0 24px 48px rgba(0,0,0,0.8)",
                    padding: "24px 28px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "16px",
                      borderBottom: "1px solid var(--dark3)",
                      paddingBottom: "10px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: ".5rem",
                        letterSpacing: ".3em",
                        textTransform: "uppercase",
                        color: "var(--gold)",
                      }}
                    >
                      Watch Categories
                    </span>
                    <Link
                      href="/collection"
                      onClick={() => setCollectionOpen(false)}
                      style={{
                        fontSize: ".48rem",
                        letterSpacing: ".15em",
                        textTransform: "uppercase",
                        color: "var(--muted)",
                        textDecoration: "none",
                      }}
                    >
                      All Watches →
                    </Link>
                  </div>

                  {/* The Premium Collection Banner in Mega Menu */}
                  <Link
                    href="/premium"
                    onClick={() => setCollectionOpen(false)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 14px",
                      marginBottom: "14px",
                      background: "linear-gradient(90deg, rgba(196,169,98,.18) 0%, rgba(196,169,98,.04) 100%)",
                      border: "1px solid rgba(196,169,98,.35)",
                      borderRadius: "2px",
                      textDecoration: "none",
                      transition: "border-color .2s, background .2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "var(--gold)";
                      e.currentTarget.style.background = "linear-gradient(90deg, rgba(196,169,98,.25) 0%, rgba(196,169,98,.08) 100%)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "rgba(196,169,98,.35)";
                      e.currentTarget.style.background = "linear-gradient(90deg, rgba(196,169,98,.18) 0%, rgba(196,169,98,.04) 100%)";
                    }}
                  >
                    <div>
                      <div style={{ fontSize: ".55rem", letterSpacing: ".2em", textTransform: "uppercase", color: "var(--gold)", fontWeight: 600 }}>
                        ✦ The Premium Collection
                      </div>
                      <div style={{ fontSize: ".45rem", color: "rgba(244,239,228,.7)", letterSpacing: ".05em" }}>
                        Curated Haute Horlogerie & Limited References
                      </div>
                    </div>
                    <span style={{ fontSize: ".6rem", color: "var(--gold)" }}>→</span>
                  </Link>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "10px 20px",
                    }}
                  >
                    {CATEGORIES.map((cat) => (
                      <Link
                        key={cat.slug}
                        href={`/watches/category/${cat.slug}`}
                        onClick={() => setCollectionOpen(false)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          textDecoration: "none",
                          padding: "8px 10px",
                          borderRadius: "2px",
                          transition: "background .2s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "rgba(196,169,98,.1)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "transparent";
                        }}
                      >
                        <span
                          style={{
                            fontSize: ".85rem",
                            color: "var(--gold)",
                            width: "20px",
                            textAlign: "center",
                          }}
                        >
                          {cat.icon}
                        </span>
                        <div>
                          <div
                            style={{
                              fontSize: ".6rem",
                              letterSpacing: ".15em",
                              textTransform: "uppercase",
                              color: "var(--white)",
                              fontWeight: 500,
                            }}
                          >
                            {cat.label}
                          </div>
                          <div
                            style={{
                              fontSize: ".45rem",
                              color: "var(--muted)",
                              letterSpacing: ".05em",
                            }}
                          >
                            {cat.tagline || "Hand-finished timepiece"}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>

                  <div
                    style={{
                      marginTop: "16px",
                      paddingTop: "14px",
                      borderTop: "1px solid var(--dark3)",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Link
                      href="/customize"
                      onClick={() => setCollectionOpen(false)}
                      style={{
                        fontSize: ".48rem",
                        letterSpacing: ".2em",
                        textTransform: "uppercase",
                        color: "var(--gold)",
                        textDecoration: "none",
                      }}
                    >
                      ✦ Bespoke Customizer
                    </Link>
                    <Link
                      href="/virtual-try-on"
                      onClick={() => setCollectionOpen(false)}
                      style={{
                        fontSize: ".48rem",
                        letterSpacing: ".2em",
                        textTransform: "uppercase",
                        color: "var(--muted)",
                        textDecoration: "none",
                      }}
                    >
                      AR Virtual Try-On →
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </li>
          <li>
            <Link
              href="/premium"
              style={{
                color: "var(--gold)",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <span style={{ fontSize: ".6rem" }}>✦</span> Premium
            </Link>
          </li>
          <li><Link href="/inner-circle">Inner Circle</Link></li>
          <li><Link href="/about">About</Link></li>
          <li><Link href="/contact">Contact</Link></li>
          <li><Link href="/faq">FAQ</Link></li>
          <li><Link href="/journal">Craft</Link></li>
        </ul>

        <div className="nav-right">
          {/* Search Button */}
          <button
            onClick={() => setSearchOpen(true)}
            aria-label="Search"
            style={{
              background: "none",
              border: "1px solid var(--dark4)",
              color: "var(--gold)",
              width: "36px",
              height: "36px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              flexShrink: 0,
            }}
            title="Search Timepieces"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
          </button>

          {/* Size Guide Trigger - Desktop only */}
          <button
            onClick={() => setSizeGuideOpen(true)}
            style={{
              background: "none",
              border: "1px solid var(--dark4)",
              color: "var(--muted)",
              padding: "0 10px",
              height: "36px",
              fontSize: ".48rem",
              letterSpacing: ".2em",
              textTransform: "uppercase",
              cursor: "pointer",
            }}
            className="nav-btn-desktop-only"
            title="Size Guide"
          >
            Size Guide
          </button>

          {/* Wishlist Link */}
          <Link
            href="/wishlist"
            style={{
              position: "relative",
              border: "1px solid var(--dark4)",
              color: "var(--gold)",
              width: "36px",
              height: "36px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textDecoration: "none",
              flexShrink: 0,
            }}
            title="Wishlist"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l8.72-8.72 1.06-1.06a5.5 5.5 0 000-7.78z" />
            </svg>
            {wishlistCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: "-4px",
                  right: "-4px",
                  background: "var(--gold)",
                  color: "var(--black)",
                  fontSize: ".45rem",
                  fontWeight: 700,
                  width: "14px",
                  height: "14px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* Compare Link - Desktop only */}
          <Link
            href="/compare"
            style={{
              position: "relative",
              border: "1px solid var(--dark4)",
              color: "var(--gold)",
              width: "36px",
              height: "36px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textDecoration: "none",
            }}
            className="nav-btn-desktop-only"
            title="Compare Timepieces"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
            </svg>
            {compareCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: "-4px",
                  right: "-4px",
                  background: "var(--gold)",
                  color: "var(--black)",
                  fontSize: ".45rem",
                  fontWeight: 700,
                  width: "14px",
                  height: "14px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {compareCount}
              </span>
            )}
          </Link>

          {/* Account Button - Desktop only */}
          {user ? (
            <Link
              href="/account"
              className="nav-btn-desktop-only"
              style={{
                border: "1px solid var(--gold-dk)",
                color: "var(--gold)",
                padding: "8px 12px",
                fontSize: ".5rem",
                letterSpacing: ".2em",
                textTransform: "uppercase",
                textDecoration: "none",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" />
              </svg>
              Account
            </Link>
          ) : (
            <button
              onClick={() => setAuthOpen(true, "login")}
              className="nav-btn-desktop-only"
              style={{
                background: "none",
                border: "1px solid var(--dark4)",
                color: "var(--muted)",
                padding: "8px 12px",
                fontSize: ".5rem",
                letterSpacing: ".2em",
                textTransform: "uppercase",
                cursor: "pointer",
              }}
              title="Sign In / Register"
            >
              Sign In
            </button>
          )}

          {/* Desktop Cart Button */}
          <button className="nav-btn" onClick={() => setCartOpen(true)}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0" />
            </svg>
            Cart <span className="cart-pill">{cart.length}</span>
          </button>

          {/* Mobile Cart Icon Button */}
          <button
            onClick={() => setCartOpen(true)}
            aria-label="View Cart"
            className="mobile-cart-btn"
            style={{
              position: "relative",
              background: "none",
              border: "1px solid var(--dark4)",
              color: "var(--gold)",
              width: "36px",
              height: "36px",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              flexShrink: 0,
            }}
            title="Cart"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0" />
            </svg>
            {cart.length > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: "-4px",
                  right: "-4px",
                  background: "var(--gold)",
                  color: "var(--black)",
                  fontSize: ".45rem",
                  fontWeight: 700,
                  width: "14px",
                  height: "14px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {cart.length}
              </span>
            )}
          </button>

          {/* Mobile Navigation Menu Toggle */}
          <MobileNav />
        </div>
      </nav>

      {/* Modals */}
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
      <SizeGuideModal open={sizeGuideOpen} onClose={() => setSizeGuideOpen(false)} />
    </>
  );
}