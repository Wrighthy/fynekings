"use client";

import Nav from "@/components/sections/Nav";
import Footer from "@/components/sections/Footer";

export default function TermsPage() {
  return (
    <div style={{ background: "var(--black)", minHeight: "100vh", fontFamily: "Raleway, sans-serif" }}>
      <Nav />
      <div style={{ padding: "160px 24px 80px", maxWidth: "900px", margin: "0 auto" }}>
        <div style={{ fontSize: "14px", letterSpacing: ".12em", color: "var(--gold)", textTransform: "uppercase", marginBottom: "12px" }}>
          Terms & Conditions
        </div>
        <h1 style={{ fontFamily: "Playfair Display, serif", fontSize: "3rem", fontWeight: 300, color: "var(--white)", marginBottom: "32px" }}>
          Terms of Sale & Service
        </h1>
        <div style={{ fontSize: "15px", lineHeight: 2.4, color: "var(--text)", display: "flex", flexDirection: "column", gap: "24px" }}>
          <p>Last Updated: August 20, 2026</p>
          <p>
            Welcome to Fynekings International Ltd. By placing an order or using our platforms, you agree to the following terms governing the acquisition, warranty, and servicing of our luxury timepieces.
          </p>
          <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: "1.6rem", color: "var(--white)", fontWeight: 300 }}>1. Orders & Pricing</h2>
          <p>
            All prices are listed in Nigerian Naira (NGN) and include applicable taxes. Orders are binding once payment is verified by our bank or gateway. We reserve the right to decline or cancel orders in cases of pricing error or stock unavailability.
          </p>
          <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: "1.6rem", color: "var(--white)", fontWeight: 300 }}>2. Bespoke Customizations</h2>
          <p>
            Custom built or custom engraved timepieces are made specifically to client specifications. Once assembly begins in our Victoria Island horological house, bespoke orders cannot be refunded or exchanged.
          </p>
          <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: "1.6rem", color: "var(--white)", fontWeight: 300 }}>3. International Warranty</h2>
          <p>
            Every watch comes with a 5-Year International Warranty covering internal movement defects and seals. The warranty is rendered void in cases of unauthorized third-party opening, water damage beyond rated 5ATM depth, or severe physical abuse.
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
