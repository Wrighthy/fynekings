"use client";

import Nav from "@/components/sections/Nav";
import Footer from "@/components/sections/Footer";

export default function ReturnPolicyPage() {
  return (
    <div style={{ background: "var(--black)", minHeight: "100vh", fontFamily: "Raleway, sans-serif" }}>
      <Nav />
      <div style={{ padding: "160px 24px 80px", maxWidth: "900px", margin: "0 auto" }}>
        <div style={{ fontSize: ".52rem", letterSpacing: ".4em", color: "var(--gold)", textTransform: "uppercase", marginBottom: "12px" }}>
          Returns & Exchanges
        </div>
        <h1 style={{ fontFamily: "Playfair Display, serif", fontSize: "3rem", fontWeight: 300, color: "var(--white)", marginBottom: "32px" }}>
          30-Day Return & Exchange Policy
        </h1>
        <div style={{ fontSize: ".7rem", lineHeight: 2.4, color: "var(--text)", display: "flex", flexDirection: "column", gap: "24px" }}>
          <p>
            We take immense pride in our craftsmanship. If for any reason you are not completely satisfied with your standard collection timepiece, we offer a 30-day return policy.
          </p>
          <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: "1.6rem", color: "var(--white)", fontWeight: 300 }}>1. Return Eligibility</h2>
          <p>
            To be eligible for a return or exchange, the watch must be in pristine, unworn condition with all protective plastic seals intact, accompanied by original box, serial tag, and NFC certificate of authenticity.
          </p>
          <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: "1.6rem", color: "var(--white)", fontWeight: 300 }}>2. Exclusions</h2>
          <p>
            Custom built 3D timepieces, engraved serial pieces, and worn/resized straps are non-returnable unless a mechanical defect is verified by our horological house.
          </p>
          <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: "1.6rem", color: "var(--white)", fontWeight: 300 }}>3. Refund Process</h2>
          <p>
            Once received and inspected by our master horologist, approved refunds are issued within 3–5 business days to the original payment source.
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
