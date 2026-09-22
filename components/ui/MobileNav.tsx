"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useCart } from "@/lib/store";
import { useAuth } from "@/lib/authStore";

const NAV_LINKS = [
  { label: "Collection", href: "/collection" },
  { label: "Virtual Try-On", href: "/virtual-try-on" },
  { label: "Bespoke Customizer", href: "/customize" },
  { label: "Inner Circle", href: "/inner-circle" },
  { label: "The Craft", href: "/journal" },
  { label: "Wishlist", href: "/wishlist" },
  { label: "Compare Models", href: "/compare" },
  { label: "Orders & Tracking", href: "/orders" },
  { label: "My Account", href: "/account" },
  { label: "About Fynekings", href: "/about" },
  { label: "Contact Us", href: "/contact" },
  { label: "FAQ & Help", href: "/faq" },
];

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const cart = useCart((s) => s.cart);
  const setCartOpen = useCart((s) => s.setCartOpen);
  const { user, setAuthOpen } = useAuth();

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Close on escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <>
      {/* Hamburger button — only visible on mobile/tablet */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Open navigation menu"
        className="mobile-menu-btn"
        style={{
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
        title="Open Navigation"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {/* Overlay */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.75)",
            backdropFilter: "blur(6px)",
            zIndex: 900,
            animation: "fadeIn .3s ease",
          }}
        />
      )}

      {/* Slide-in panel */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: "min(380px, 88vw)",
          background: "#080808",
          borderLeft: "1px solid var(--dark3)",
          zIndex: 950,
          transform: open ? "translateX(0)" : "translateX(100%)",
          transition: "transform .35s cubic-bezier(.7,0,.3,1)",
          display: "flex",
          flexDirection: "column",
          overflowY: "auto",
        }}
      >
        {/* Panel header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "20px 24px",
            borderBottom: "1px solid var(--dark3)",
          }}
        >
          <Link
            href="/"
            onClick={() => setOpen(false)}
            style={{
              fontFamily: "Playfair Display, serif",
              fontSize: "1.05rem",
              letterSpacing: ".35em",
              color: "var(--white)",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <span
              style={{
                width: "22px",
                height: "22px",
                border: "1px solid var(--gold)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: ".45rem",
                color: "var(--gold)",
              }}
            >
              F
            </span>
            FYNE<span style={{ color: "var(--gold)" }}>KINGS</span>
          </Link>
          <button
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            style={{
              background: "none",
              border: "1px solid var(--dark4)",
              color: "var(--muted)",
              width: "36px",
              height: "36px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all .3s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--gold-dk)";
              e.currentTarget.style.color = "var(--gold)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--dark4)";
              e.currentTarget.style.color = "var(--muted)";
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Account Header banner */}
        <div
          style={{
            padding: "14px 24px",
            background: "var(--dark2)",
            borderBottom: "1px solid var(--dark3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {user ? (
            <div style={{ fontSize: ".55rem", letterSpacing: ".15em", color: "var(--gold)", textTransform: "uppercase" }}>
              Signed in as {user.name || user.email}
            </div>
          ) : (
            <button
              onClick={() => {
                setAuthOpen(true, "login");
                setOpen(false);
              }}
              style={{
                background: "none",
                border: "none",
                color: "var(--gold)",
                fontSize: ".55rem",
                letterSpacing: ".2em",
                textTransform: "uppercase",
                cursor: "pointer",
              }}
            >
              Sign In / Register →
            </button>
          )}
        </div>

        {/* Nav links */}
        <nav style={{ padding: "20px 24px", flex: 1, position: "static", background: "transparent", display: "block", width: "100%" }}>
          <div
            style={{
              fontSize: ".45rem",
              letterSpacing: ".4em",
              color: "var(--gold-dk)",
              textTransform: "uppercase",
              marginBottom: "14px",
            }}
          >
            Navigation
          </div>
          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0", padding: 0, margin: 0 }}>
            {NAV_LINKS.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px 0",
                    borderBottom: "1px solid var(--dark3)",
                    fontFamily: "Playfair Display, serif",
                    fontSize: "1.05rem",
                    fontWeight: 300,
                    color: "var(--white)",
                    textDecoration: "none",
                    transition: "color .3s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "var(--gold)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "var(--white)")}
                >
                  {link.label}
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M5 12h14M13 5l7 7-7 7" />
                  </svg>
                </Link>
              </li>
            ))}
          </ul>

          {/* Cart button */}
          <button
            onClick={() => {
              setCartOpen(true);
              setOpen(false);
            }}
            style={{
              width: "100%",
              marginTop: "20px",
              padding: "13px",
              background: "var(--gold)",
              color: "var(--black)",
              border: "none",
              fontSize: ".58rem",
              letterSpacing: ".28em",
              textTransform: "uppercase",
              fontWeight: 600,
              fontFamily: "Raleway, sans-serif",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0" />
            </svg>
            View Cart ({cart.length})
          </button>
        </nav>

        {/* Footer */}
        <div style={{ padding: "18px 24px", borderTop: "1px solid var(--dark3)" }}>
          <div
            style={{
              fontSize: ".45rem",
              letterSpacing: ".4em",
              color: "var(--gold-dk)",
              textTransform: "uppercase",
              marginBottom: "10px",
            }}
          >
            Follow Fynekings
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            {[
              {
                label: "Instagram",
                icon: (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="5" />
                    <circle cx="12" cy="12" r="4" />
                    <circle cx="17.5" cy="6.5" r=".8" fill="currentColor" />
                  </svg>
                ),
                href: "https://instagram.com/fynekings",
              },
              {
                label: "Twitter",
                icon: (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                  </svg>
                ),
                href: "https://twitter.com/fynekings",
              },
              {
                label: "WhatsApp",
                icon: (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M21 11.5a8.4 8.4 0 01-1.2 4.3 8.5 8.5 0 01-7.3 4.2 8.4 8.4 0 01-4.3-1.2L3 21l2.3-5.2a8.4 8.4 0 01-1.2-4.3 8.5 8.5 0 014.2-7.3 8.4 8.4 0 014.3-1.2A8.5 8.5 0 0121 11.5z" />
                  </svg>
                ),
                href: "https://wa.me/2348000000000",
              },
            ].map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                style={{
                  width: "36px",
                  height: "36px",
                  border: "1px solid var(--dark4)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--muted)",
                  textDecoration: "none",
                  transition: "all .3s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--gold)";
                  e.currentTarget.style.color = "var(--gold)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--dark4)";
                  e.currentTarget.style.color = "var(--muted)";
                }}
              >
                {s.icon}
              </a>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}