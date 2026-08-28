"use client";

import { use } from "react";
import Link from "next/link";
import Nav from "@/components/sections/Nav";
import Footer from "@/components/sections/Footer";

export default function CheckoutSuccessPage({ searchParams }: { searchParams: Promise<{ orderId?: string }> }) {
  const { orderId } = use(searchParams);

  return (
    <div style={{ background: "var(--black)", minHeight: "100vh", fontFamily: "Raleway, sans-serif" }}>
      <Nav />

      <div style={{ padding: "180px 24px 100px", maxWidth: "700px", margin: "0 auto", textAlign: "center" }}>
        <div style={{ width: "64px", height: "64px", border: "1px solid var(--gold)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", color: "var(--gold)", fontSize: "1.8rem" }}>
          ✓
        </div>
        <div style={{ fontSize: ".5rem", letterSpacing: ".4em", color: "var(--gold)", textTransform: "uppercase", marginBottom: "12px" }}>
          Payment Authorized & Verified
        </div>
        <h1 style={{ fontFamily: "Playfair Display, serif", fontSize: "clamp(2.5rem, 5vw, 4rem)", color: "var(--white)", fontWeight: 300, marginBottom: "20px" }}>
          Acquisition Confirmed
        </h1>
        <p style={{ fontSize: ".72rem", lineHeight: 2.2, color: "var(--text)", marginBottom: "32px" }}>
          Thank you for acquiring a Fynekings timepiece. Your order reference is{" "}
          <strong style={{ color: "var(--gold)", letterSpacing: ".1em" }}>#{orderId?.slice(-8).toUpperCase() || "CONFIRMED"}</strong>. Our master watchmaker is preparing your timepiece for dispatch from our Victoria Island horological gallery.
        </p>

        <div style={{ background: "var(--dark2)", border: "1px solid var(--dark3)", padding: "32px", marginBottom: "40px", textAlign: "left" }}>
          <div style={{ fontSize: ".5rem", letterSpacing: ".3em", color: "var(--gold)", textTransform: "uppercase", marginBottom: "16px" }}>Next Steps</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: ".68rem", color: "var(--text)", lineHeight: 1.8 }}>
            <div><strong>1. Order Inspection:</strong> Final timing calibration & 5ATM pressure testing.</div>
            <div><strong>2. Signature Packaging:</strong> Sealed in luxury presentation case with 5-Year NFC warranty.</div>
            <div><strong>3. Insured Dispatch:</strong> Armed courier tracking details will be sent via SMS & email.</div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
          <Link href={`/orders/track?id=${orderId || ""}`} className="btn-primary">
            <span>Track Order Timeline →</span>
          </Link>
          <Link href="/collection" className="btn-outline">
            <span>Return to Collection</span>
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
