"use client";

import Link from "next/link";
import Nav from "@/components/sections/Nav";
import Footer from "@/components/sections/Footer";
import { useAuth } from "@/lib/authStore";

function ExclusiveContent() {
  const { user } = useAuth();
  const isEnlisted = Boolean(user?.isInnerCircle);

  return (
    <div style={{ background: "var(--black)", minHeight: "100vh", fontFamily: "Raleway, sans-serif" }}>
      <Nav />

      <section style={{ padding: "160px 24px 100px", maxWidth: "1200px", margin: "0 auto", textAlign: "center" }}>
        <div style={{ fontSize: "14px", letterSpacing: ".12em", color: "var(--gold)", textTransform: "uppercase", marginBottom: "16px" }}>
          PRIVATE VAULT
        </div>
        <h1
          style={{
            fontFamily: "Playfair Display, serif",
            fontSize: "clamp(2.6rem, 6vw, 4.5rem)",
            fontWeight: 300,
            color: "var(--white)",
            marginBottom: "20px",
          }}
        >
          Exclusive <em style={{ fontStyle: "italic", color: "var(--gold)" }}>Atelier</em>
        </h1>
        <p style={{ fontSize: "15px", letterSpacing: ".08em", color: "var(--muted)", maxWidth: "600px", margin: "0 auto 40px", lineHeight: 2 }}>
          Unreleased references, rare dials, and private collector commissions.
        </p>

        {!isEnlisted ? (
          <div
            style={{
              background: "var(--dark2)",
              border: "1px solid var(--dark3)",
              padding: "48px 24px",
              maxWidth: "600px",
              margin: "0 auto",
            }}
          >
            <div style={{ color: "var(--gold)", fontSize: "1.8rem", marginBottom: "12px" }}>🔒</div>
            <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: "1.4rem", color: "var(--white)", marginBottom: "16px" }}>
              Inner Circle Enlistment Required
            </h2>
            <p style={{ fontSize: "15px", color: "var(--muted)", lineHeight: 1.8, marginBottom: "28px" }}>
              To view private vault pieces and reserve limited releases, please complete your complimentary enlistment.
            </p>
            <Link href="/inner-circle" className="btn-primary" style={{ display: "inline-flex" }}>
              ENLIST IN INNER CIRCLE
            </Link>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "32px", textAlign: "left" }}>
            <div style={{ background: "var(--dark2)", border: "1px solid var(--gold-border)", padding: "32px" }}>
              <div style={{ fontSize: "14px", letterSpacing: ".2em", color: "var(--gold)", textTransform: "uppercase", marginBottom: "8px" }}>
                Vault Piece 001
              </div>
              <h3 style={{ fontFamily: "Playfair Display, serif", fontSize: "1.4rem", color: "var(--white)", marginBottom: "12px" }}>
                The Obsidian Tourbillon Concept
              </h3>
              <p style={{ fontSize: "15px", color: "var(--muted)", lineHeight: 1.8, marginBottom: "24px" }}>
                Hand-finished forged carbon case with 24k gold leaf rotor. Strictly limited to 5 bespoke allocations.
              </p>
              <Link href="/customize" className="btn-primary" style={{ display: "inline-flex", fontSize: "14px" }}>
                REQUEST COMMISSION
              </Link>
            </div>

            <div style={{ background: "var(--dark2)", border: "1px solid var(--gold-border)", padding: "32px" }}>
              <div style={{ fontSize: "14px", letterSpacing: ".2em", color: "var(--gold)", textTransform: "uppercase", marginBottom: "8px" }}>
                Vault Piece 002
              </div>
              <h3 style={{ fontFamily: "Playfair Display, serif", fontSize: "1.4rem", color: "var(--white)", marginBottom: "12px" }}>
                Royal Damascus Heritage Edition
              </h3>
              <p style={{ fontSize: "15px", color: "var(--muted)", lineHeight: 1.8, marginBottom: "24px" }}>
                Pattern-welded steel dial paired with hand-stitched Nigerian ostrich leather strap.
              </p>
              <Link href="/collection" className="btn-primary" style={{ display: "inline-flex", fontSize: "14px" }}>
                VIEW ALLOCATIONS
              </Link>
            </div>
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}

export default function ExclusivePage() {
  return <ExclusiveContent />;
}
