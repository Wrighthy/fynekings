"use client";

import Link from "next/link";
import Nav from "@/components/sections/Nav";
import Footer from "@/components/sections/Footer";

export default function CustomizePage() {
  return (
    <div style={{ background: "var(--black)", minHeight: "100vh", fontFamily: "Raleway, sans-serif" }}>
      <Nav />
      <div style={{ padding: "180px 24px 100px", maxWidth: "680px", margin: "0 auto", textAlign: "center" }}>
        <div style={{ fontSize: "14px", letterSpacing: ".12em", color: "var(--gold)", textTransform: "uppercase", marginBottom: "16px" }}>
          Collector Notice
        </div>
        <h1 style={{ fontFamily: "Playfair Display, serif", fontSize: "clamp(2.5rem, 5vw, 4rem)", fontWeight: 300, color: "var(--white)", marginBottom: "20px" }}>
          Custom Build <em style={{ fontStyle: "italic", color: "var(--gold)" }}>Currently Unavailable</em>
        </h1>
        <p style={{ fontSize: "15px", lineHeight: 2.2, color: "var(--text)", marginBottom: "36px" }}>
          Bespoke 3D custom watch manufacturing is currently paused while our horological house focuses on curating and hand-calibrating our signature limited edition and core collection timepieces.
        </p>
        <Link href="/collection" className="btn-primary" style={{ display: "inline-flex" }}>
          <span>Explore Ready Collection →</span>
        </Link>
      </div>
      <Footer />
    </div>
  );
}