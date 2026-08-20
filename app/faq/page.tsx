"use client";

import { useState } from "react";
import Link from "next/link";
import Nav from "@/components/sections/Nav";
import Footer from "@/components/sections/Footer";

type FAQItem = {
  q: string;
  a: string;
  category: "Ordering & Payment" | "Shipping & Delivery" | "Warranty & Servicing" | "Customization & Bespoke";
};

const FAQS: FAQItem[] = [
  {
    category: "Ordering & Payment",
    q: "What payment methods do you accept?",
    a: "We accept all major debit & credit cards, bank transfers, USSD, and Paystack payments in Nigerian Naira (NGN) and USD equivalent. High-value bespoke orders can also be settled via direct bank transfer to our corporate account.",
  },
  {
    category: "Ordering & Payment",
    q: "Can I modify or cancel my order after placing it?",
    a: "Standard collection orders can be modified or cancelled within 2 hours of payment by contacting our concierge desk. Custom build and engraved timepieces enter atelier production immediately and cannot be cancelled once assembly has begun.",
  },
  {
    category: "Shipping & Delivery",
    q: "How long does shipping take within Nigeria and internationally?",
    a: "Orders in Lagos are delivered via insured courier within 24–48 hours. Nationwide deliveries take 2–4 business days. International shipments via DHL Express take 3–5 business days, fully insured from door to door.",
  },
  {
    category: "Shipping & Delivery",
    q: "Is my shipment insured against loss or damage?",
    a: "Yes. Every Fynekings shipment is 100% transit-insured from our Victoria Island atelier until signed for at your delivery address.",
  },
  {
    category: "Warranty & Servicing",
    q: "What does the 5-Year Fynekings International Warranty cover?",
    a: "Our 5-Year Guarantee covers mechanical movement accuracy, internal component defects, and water resistance seal integrity. It includes one complimentary movement overhaul at year 3.",
  },
  {
    category: "Warranty & Servicing",
    q: "How do I send my watch for routine servicing?",
    a: "You may drop off your watch directly at our Victoria Island atelier or request a complimentary insured pickup box through our concierge service.",
  },
  {
    category: "Customization & Bespoke",
    q: "Can I request custom case engraving or custom strap colors?",
    a: "Yes. Our 3D Customizer allows you to select custom PVD case finishes, strap materials, and dial accents. For personalized laser-engraved family crests or monograms, select the custom option during checkout.",
  },
];

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const categories = ["All", "Ordering & Payment", "Shipping & Delivery", "Warranty & Servicing", "Customization & Bespoke"];

  const filteredFaqs = activeCategory === "All" ? FAQS : FAQS.filter((f) => f.category === activeCategory);

  return (
    <div style={{ background: "var(--black)", minHeight: "100vh", fontFamily: "Raleway, sans-serif" }}>
      <Nav />

      {/* Header */}
      <div style={{ padding: "160px 24px 60px", maxWidth: "1200px", margin: "0 auto", textAlign: "center" }}>
        <div style={{ fontSize: ".52rem", letterSpacing: ".45em", color: "var(--gold)", textTransform: "uppercase", marginBottom: "16px" }}>
          Knowledge Base & Client Guide
        </div>
        <h1 style={{ fontFamily: "Playfair Display, serif", fontSize: "clamp(2.8rem, 6vw, 4.5rem)", fontWeight: 300, color: "var(--white)", marginBottom: "20px" }}>
          Frequently Asked <em style={{ fontStyle: "italic", color: "var(--gold)" }}>Questions</em>
        </h1>
        <p style={{ fontSize: ".7rem", letterSpacing: ".1em", lineHeight: 2.2, color: "var(--text)", maxWidth: "600px", margin: "0 auto" }}>
          Find answers to common questions about purchasing, shipping, horological warranties, and custom atelier builds.
        </p>
      </div>

      {/* Main Section */}
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "0 24px 100px" }}>
        {/* Category Tabs */}
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "center", marginBottom: "48px" }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => { setActiveCategory(cat); setOpenIdx(0); }}
              style={{
                padding: "10px 20px",
                background: activeCategory === cat ? "var(--gold)" : "var(--dark2)",
                border: activeCategory === cat ? "1px solid var(--gold)" : "1px solid var(--dark3)",
                color: activeCategory === cat ? "var(--black)" : "var(--text)",
                fontSize: ".55rem",
                letterSpacing: ".2em",
                textTransform: "uppercase",
                fontWeight: activeCategory === cat ? 600 : 400,
                cursor: "pointer",
                transition: "all .3s",
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Accordion */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {filteredFaqs.map((faq, i) => (
            <div key={faq.q} style={{ background: "var(--dark2)", border: "1px solid var(--dark3)", transition: "border-color .3s" }}>
              <button
                onClick={() => setOpenIdx(openIdx === i ? null : i)}
                style={{
                  width: "100%",
                  padding: "24px",
                  background: "none",
                  border: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  textAlign: "left",
                  cursor: "pointer",
                }}
              >
                <span style={{ fontFamily: "Playfair Display, serif", fontSize: "1.2rem", color: "var(--white)", fontWeight: 300, paddingRight: "16px" }}>
                  {faq.q}
                </span>
                <span style={{ color: "var(--gold)", fontSize: "1.2rem", flexShrink: 0 }}>
                  {openIdx === i ? "−" : "+"}
                </span>
              </button>

              {openIdx === i && (
                <div style={{ padding: "0 24px 24px", borderTop: "1px solid var(--dark4)", paddingTop: "16px" }}>
                  <p style={{ fontSize: ".7rem", lineHeight: 2.2, color: "var(--text)" }}>{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Still have questions banner */}
        <div style={{ marginTop: "64px", padding: "40px", background: "var(--dark)", border: "1px solid var(--dark3)", textAlign: "center" }}>
          <h3 style={{ fontFamily: "Playfair Display, serif", fontSize: "1.6rem", color: "var(--white)", marginBottom: "12px", fontWeight: 300 }}>
            Have a Specific Horological Inquiry?
          </h3>
          <p style={{ fontSize: ".65rem", color: "var(--muted)", marginBottom: "24px" }}>
            Our concierge team is standing by to answer custom requests or technical watch specifications.
          </p>
          <Link href="/contact" className="btn-primary">
            <span>Contact Concierge Desk</span>
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
