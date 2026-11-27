"use client";

import Nav from "@/components/sections/Nav";
import Footer from "@/components/sections/Footer";

export default function ShippingPolicyPage() {
  return (
    <div style={{ background: "var(--black)", minHeight: "100vh", fontFamily: "Raleway, sans-serif" }}>
      <Nav />
      <div style={{ padding: "160px 24px 80px", maxWidth: "900px", margin: "0 auto" }}>
        <div style={{ fontSize: "14px", letterSpacing: ".12em", color: "var(--gold)", textTransform: "uppercase", marginBottom: "12px" }}>
          Logistics & Delivery
        </div>
        <h1 style={{ fontFamily: "Playfair Display, serif", fontSize: "3rem", fontWeight: 300, color: "var(--white)", marginBottom: "32px" }}>
          Shipping & Logistics Policy
        </h1>
        <div style={{ fontSize: "15px", lineHeight: 2.4, color: "var(--text)", display: "flex", flexDirection: "column", gap: "24px" }}>
          <p>
            At Fynekings International, we understand that acquiring a luxury timepiece is a momentous occasion. We ensure that every watch is packed in our signature box and delivered with total security.
          </p>
          <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: "1.6rem", color: "var(--white)", fontWeight: 300 }}>1. Shipping Timelines</h2>
          <ul style={{ paddingLeft: "20px" }}>
            <li><strong>Lagos Express Delivery:</strong> 24 to 48 hours via trusted courier.</li>
            <li><strong>Nationwide Nigeria:</strong> 2 to 4 business days via insured logistics partners.</li>
            <li><strong>Worldwide International:</strong> 3 to 5 business days and fully insured transit within Africa.</li>
          </ul>
          <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: "1.6rem", color: "var(--white)", fontWeight: 300 }}>2. Transit Insurance</h2>
          <p>
            All shipments are 100% insured against theft, damage, or loss during transit until signed for at your designated delivery address. A valid physical signature is required upon delivery.
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
