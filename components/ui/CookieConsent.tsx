"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("fynekings-cookie-consent");
    if (!consent) {
      setTimeout(() => setShow(true), 1200);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("fynekings-cookie-consent", "accepted");
    setShow(false);
  };

  const handleDecline = () => {
    localStorage.setItem("fynekings-cookie-consent", "declined");
    setShow(false);
  };

  if (!show) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "24px",
        left: "24px",
        right: "24px",
        maxWidth: "540px",
        background: "rgba(12, 12, 12, 0.94)",
        backdropFilter: "blur(20px)",
        border: "1px solid var(--gold-dk)",
        padding: "24px",
        zIndex: 9980,
        boxShadow: "0 20px 40px rgba(0,0,0,0.8)",
        animation: "fadeUp .4s ease",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
        <span style={{ color: "var(--gold)", fontSize: ".8rem" }}>✦</span>
        <span style={{ fontSize: ".5rem", letterSpacing: ".35em", color: "var(--gold)", textTransform: "uppercase" }}>
          Cookie & Privacy Preferences
        </span>
      </div>
      <p style={{ fontSize: ".62rem", letterSpacing: ".08em", lineHeight: 1.8, color: "var(--text)", marginBottom: "20px" }}>
        We use essential cookies to deliver a seamless horological experience, analyze site traffic, and personalize luxury concierge services. Read our{" "}
        <Link href="/privacy" style={{ color: "var(--gold)", textDecoration: "underline" }}>
          Privacy Policy
        </Link>
        .
      </p>
      <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
        <button
          onClick={handleDecline}
          style={{
            padding: "10px 20px",
            background: "transparent",
            border: "1px solid var(--dark4)",
            color: "var(--muted)",
            fontSize: ".52rem",
            letterSpacing: ".25em",
            textTransform: "uppercase",
            cursor: "none",
          }}
        >
          Decline
        </button>
        <button
          onClick={handleAccept}
          style={{
            padding: "10px 24px",
            background: "var(--gold)",
            border: "none",
            color: "var(--black)",
            fontSize: ".52rem",
            letterSpacing: ".25em",
            textTransform: "uppercase",
            fontWeight: 600,
            cursor: "none",
          }}
        >
          Accept All
        </button>
      </div>
    </div>
  );
}
