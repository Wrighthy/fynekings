"use client";

import Link from "next/link";
import Nav from "@/components/sections/Nav";
import Footer from "@/components/sections/Footer";

export default function AboutPage() {
  return (
    <div style={{ background: "var(--black)", minHeight: "100vh", fontFamily: "Raleway, sans-serif" }}>
      <Nav />

      {/* Hero Header */}
      <div style={{ padding: "160px 24px 80px", maxWidth: "1200px", margin: "0 auto", textAlign: "center" }}>
        <div style={{ fontSize: ".52rem", letterSpacing: ".45em", color: "var(--gold)", textTransform: "uppercase", marginBottom: "16px" }}>
          Horological Heritage & Craft
        </div>
        <h1 style={{ fontFamily: "Playfair Display, serif", fontSize: "clamp(2.8rem, 6vw, 5rem)", fontWeight: 300, color: "var(--white)", marginBottom: "24px" }}>
          The House of <em style={{ fontStyle: "italic", color: "var(--gold)" }}>Fynekings</em>
        </h1>
        <p style={{ fontSize: ".75rem", letterSpacing: ".12em", lineHeight: 2.4, color: "var(--text)", maxWidth: "680px", margin: "0 auto 40px" }}>
          Engineered in Victoria Island, Lagos. Fusing Swiss mechanical precision with African royalty aesthetics to redefine haute horlogerie for discerning global collectors.
        </p>
      </div>

      {/* Narrative Section 1 */}
      <section style={{ borderTop: "1px solid var(--dark3)", background: "var(--dark)", padding: "100px 24px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 480px), 1fr))", gap: "60px", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: ".5rem", letterSpacing: ".35em", color: "var(--gold-dk)", textTransform: "uppercase", marginBottom: "12px" }}>
              Our Atelier Story
            </div>
            <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: "2.4rem", color: "var(--white)", fontWeight: 300, marginBottom: "20px" }}>
              Born from a Pursuit of Absolute Prestige
            </h2>
            <p style={{ fontSize: ".7rem", lineHeight: 2.2, color: "var(--text)", marginBottom: "20px" }}>
              Fynekings International was founded with a singular vision: to craft luxury timepieces that carry the weight of African heritage while competing on the grandest horological stages of Geneva and Tokyo.
            </p>
            <p style={{ fontSize: ".7rem", lineHeight: 2.2, color: "var(--text)" }}>
              Every watch face features our signature hand-beveled hour indices, surgical-grade 316L stainless steel or 18k PVD gold casing, and high-frequency automatic movements calibrated by master watchmakers in our Victoria Island atelier.
            </p>
          </div>

          <div style={{ background: "var(--dark2)", border: "1px solid var(--dark3)", padding: "40px", display: "flex", flexDirection: "column", gap: "24px" }}>
            {[
              { num: "25", label: "Jewels Automatic Movements", desc: "Self-winding mechanical hearts with 42-hour power reserves." },
              { num: "316L", label: "Surgical Stainless Steel", desc: "Hypoallergenic, corrosion-resistant cases polished to mirror finish." },
              { num: "5ATM", label: "Water Resistance Standard", desc: "Tested under rigorous pressure chambers to withstand 50 meters depth." },
            ].map((stat) => (
              <div key={stat.label} style={{ borderBottom: "1px solid var(--dark3)", paddingBottom: "20px" }}>
                <div style={{ fontFamily: "Playfair Display, serif", fontSize: "2.2rem", color: "var(--gold)" }}>{stat.num}</div>
                <div style={{ fontSize: ".55rem", letterSpacing: ".2em", color: "var(--white)", textTransform: "uppercase", margin: "4px 0" }}>{stat.label}</div>
                <div style={{ fontSize: ".6rem", color: "var(--muted)", lineHeight: 1.8 }}>{stat.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Craft Values */}
      <section style={{ padding: "100px 24px", maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "60px" }}>
          <div style={{ fontSize: ".5rem", letterSpacing: ".4em", color: "var(--gold)", textTransform: "uppercase", marginBottom: "12px" }}>Pillars of Excellence</div>
          <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: "2.8rem", color: "var(--white)", fontWeight: 300 }}>Handcrafted Uncompromising Luxury</h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))", gap: "32px" }}>
          {[
            { title: "Bespoke Engraving", desc: "Personalized crests, initials, and numbered limited edition case backs hand-etched by artisan engravers." },
            { title: "Guaranteed Authenticity", desc: "Each timepiece comes signed with a physical certificate of authenticity and NFC-verified digital passport." },
            { title: "5-Year International Guarantee", desc: "Comprehensive coverage covering mechanical movement precision, seals, and atelier servicing." },
          ].map((pillar) => (
            <div key={pillar.title} style={{ background: "var(--dark2)", border: "1px solid var(--dark3)", padding: "36px 28px" }}>
              <div style={{ width: "32px", height: "1px", background: "var(--gold)", marginBottom: "20px" }}></div>
              <h3 style={{ fontFamily: "Playfair Display, serif", fontSize: "1.4rem", color: "var(--white)", marginBottom: "12px", fontWeight: 300 }}>{pillar.title}</h3>
              <p style={{ fontSize: ".65rem", lineHeight: 2, color: "var(--text)" }}>{pillar.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Call to action */}
      <div style={{ borderTop: "1px solid var(--dark3)", background: "var(--dark2)", padding: "80px 24px", textAlign: "center" }}>
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
          <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: "2.2rem", color: "var(--white)", marginBottom: "16px", fontWeight: 300 }}>Explore the Collection</h2>
          <p style={{ fontSize: ".68rem", color: "var(--muted)", marginBottom: "32px", letterSpacing: ".1em" }}>Discover our signature automatic timepieces or customize your own build.</p>
          <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/collection" className="btn-primary">
              <span>View Collection</span>
            </Link>
            <Link href="/customize" className="btn-outline">
              <span>Build Custom Watch</span>
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
