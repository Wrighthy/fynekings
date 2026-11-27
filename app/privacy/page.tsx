"use client";

import Nav from "@/components/sections/Nav";
import Footer from "@/components/sections/Footer";

export default function PrivacyPage() {
  return (
    <div style={{ background: "var(--black)", minHeight: "100vh", fontFamily: "Raleway, sans-serif" }}>
      <Nav />
      <div style={{ padding: "160px 24px 80px", maxWidth: "900px", margin: "0 auto" }}>
        <div style={{ fontSize: "14px", letterSpacing: ".12em", color: "var(--gold)", textTransform: "uppercase", marginBottom: "12px" }}>
          Legal & Compliance
        </div>
        <h1 style={{ fontFamily: "Playfair Display, serif", fontSize: "3rem", fontWeight: 300, color: "var(--white)", marginBottom: "32px" }}>
          Privacy Policy
        </h1>
        <div style={{ fontSize: "15px", lineHeight: 2.4, color: "var(--text)", display: "flex", flexDirection: "column", gap: "24px" }}>
          <p>Effective Date: August 20, 2026</p>
          <p>
            Fynekings International Ltd (&ldquo;Fynekings&rdquo;, &ldquo;we&rdquo;, &ldquo;our&rdquo;) is committed to protecting the privacy and security of our clients&rsquo; personal information. This Privacy Policy details how we collect, use, and protect data provided across our digital platforms and Victoria Island gallery.
          </p>
          <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: "1.6rem", color: "var(--white)", fontWeight: 300 }}>1. Information We Collect</h2>
          <p>
            We collect personal information necessary to process orders, fulfill bespoke watch customizations, and deliver concierge services, including: name, billing & shipping address, email address, phone number, and payment verification references.
          </p>
          <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: "1.6rem", color: "var(--white)", fontWeight: 300 }}>2. How We Use Your Data</h2>
          <p>
            Your information is used strictly to fulfill watch orders, issue 5-Year international warranty certificates, provide order tracking updates, and communicate exclusive limited edition timepiece drops when subscribed.
          </p>
          <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: "1.6rem", color: "var(--white)", fontWeight: 300 }}>3. Data Protection & Security</h2>
          <p>
            We deploy 256-bit SSL encryption, HTTP-only secure cookie authentication, and strict database access controls. Payment references are handled via PCI-DSS compliant gateways (Paystack).
          </p>
          <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: "1.6rem", color: "var(--white)", fontWeight: 300 }}>4. Your Rights</h2>
          <p>
            You have the right to inspect, update, or request the deletion of your account and personal records at any time by contacting privacy@fynekings.com.
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
