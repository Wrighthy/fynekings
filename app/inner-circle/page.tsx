"use client";

import { useState } from "react";
import Link from "next/link";
import Nav from "@/components/sections/Nav";
import Footer from "@/components/sections/Footer";
import { useAuth } from "@/lib/authStore";

function InnerCircleContent() {
  const { user, joinInnerCircle } = useAuth();
  const [enlisting, setEnlisting] = useState(false);
  const [error, setError] = useState("");
  const [successToast, setSuccessToast] = useState("");

  const handleJoin = async () => {
    setEnlisting(true);
    setError("");
    const res = await joinInnerCircle();
    setEnlisting(false);
    if (res.success) {
      setSuccessToast("Welcome to the Inner Circle. Your collector credentials have been officially registered.");
    } else {
      setError(res.error || "Failed to enlist in the Inner Circle.");
    }
  };

  const isEnlisted = Boolean(user?.isInnerCircle);

  return (
    <div style={{ background: "var(--black)", minHeight: "100vh", fontFamily: "Raleway, sans-serif" }}>
      <Nav />

      {/* Hero Section */}
      <section
        style={{
          padding: "160px 24px 80px",
          maxWidth: "1200px",
          margin: "0 auto",
          textAlign: "center",
          position: "relative",
        }}
      >
        <div
          style={{
            fontSize: "14px",
            letterSpacing: ".12em",
            color: "var(--gold)",
            textTransform: "uppercase",
            marginBottom: "16px",
          }}
        >
          {isEnlisted ? "★ PRIVATE ATELIER ACCESS ACTIVE ★" : "THE PRIVATE COLLECTOR’S SANCTUARY"}
        </div>

        <h1
          style={{
            fontFamily: "Playfair Display, serif",
            fontSize: "clamp(2.6rem, 6vw, 4.5rem)",
            fontWeight: 300,
            color: "var(--white)",
            marginBottom: "24px",
            lineHeight: 1.15,
          }}
        >
          The FYNEKINGS <br />
          <em style={{ fontStyle: "italic", color: "var(--gold)" }}>Inner Circle</em>
        </h1>

        <p
          style={{
            fontSize: "clamp(.75rem, 1.5vw, .85rem)",
            letterSpacing: ".08em",
            color: "var(--muted)",
            maxWidth: "680px",
            margin: "0 auto 40px",
            lineHeight: 2,
          }}
        >
          An exclusive guild reserved for true connoisseurs of fine Nigerian-crafted luxury horology.
          Experience private allocations, custom engravings, and advance releases before global presentation.
        </p>

        {successToast && (
          <div
            style={{
              background: "rgba(201, 168, 76, 0.15)",
              border: "1px solid var(--gold)",
              color: "var(--gold)",
              padding: "16px 24px",
              maxWidth: "600px",
              margin: "0 auto 36px",
              fontSize: "15px",
              letterSpacing: ".06em",
              textAlign: "center",
            }}
          >
            ✓ {successToast}
          </div>
        )}

        {error && (
          <div
            style={{
              background: "rgba(220, 53, 69, 0.12)",
              border: "1px solid rgba(220, 53, 69, 0.4)",
              color: "#ff6b6b",
              padding: "14px 18px",
              maxWidth: "600px",
              margin: "0 auto 36px",
              fontSize: "15px",
              textAlign: "center",
            }}
          >
            {error}
          </div>
        )}

        {/* Dynamic Enlisted Status vs Join CTA */}
        {isEnlisted ? (
          <div
            style={{
              background: "linear-gradient(145deg, var(--dark2), rgba(20, 20, 20, 0.95))",
              border: "1px solid var(--gold)",
              padding: "48px 32px",
              maxWidth: "720px",
              margin: "0 auto 60px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.8), 0 0 30px rgba(201, 168, 76, 0.15)",
              textAlign: "center",
            }}
          >
            <div
              style={{
                display: "inline-block",
                background: "var(--gold)",
                color: "var(--black)",
                fontSize: "14px",
                letterSpacing: ".12em",
                fontWeight: 700,
                textTransform: "uppercase",
                padding: "6px 16px",
                marginBottom: "20px",
              }}
            >
              ENLISTED MEMBER
            </div>
            <h2
              style={{
                fontFamily: "Playfair Display, serif",
                fontSize: "1.8rem",
                color: "var(--white)",
                fontWeight: 300,
                marginBottom: "12px",
              }}
            >
              Welcome, {user?.name}
            </h2>
            <p
              style={{
                fontSize: "15px",
                color: "var(--gold)",
                letterSpacing: ".1em",
                marginBottom: "24px",
              }}
            >
              Your VIP Collector Credentials are Fully Active.
            </p>
            <p
              style={{
                fontSize: "15px",
                color: "var(--muted)",
                lineHeight: 2,
                maxWidth: "520px",
                margin: "0 auto 32px",
              }}
            >
              You have priority access to unreleased masterworks, custom bezel consultations, and personal concierge fulfillment.
            </p>
            <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/collection" className="btn-primary">
                EXPLORE PRIVATE ALLOCATIONS
              </Link>
              <Link
                href="/customize"
                className="btn-outline"
                style={{
                  border: "1px solid var(--dark3)",
                  color: "var(--white)",
                  padding: "14px 28px",
                  fontSize: "14px",
                  letterSpacing: ".2em",
                  textTransform: "uppercase",
                }}
              >
                BESPOKE TIMEPIECE ATELIER
              </Link>
            </div>
          </div>
        ) : (
          <div
            style={{
              background: "var(--dark2)",
              border: "1px solid var(--dark3)",
              padding: "48px 32px",
              maxWidth: "640px",
              margin: "0 auto 60px",
              boxShadow: "0 20px 50px rgba(0,0,0,0.6)",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: "14px",
                letterSpacing: ".12em",
                color: "var(--gold)",
                textTransform: "uppercase",
                marginBottom: "12px",
              }}
            >
              Complimentary Atelier Enlistment
            </div>
            <h2
              style={{
                fontFamily: "Playfair Display, serif",
                fontSize: "1.8rem",
                color: "var(--white)",
                fontWeight: 300,
                marginBottom: "16px",
              }}
            >
              Claim Your Private Seat
            </h2>
            <p
              style={{
                fontSize: "15px",
                color: "var(--muted)",
                lineHeight: 1.9,
                marginBottom: "32px",
              }}
            >
              Join your fellow collectors today. Enlistment grants immediate recognition across the FYNEKINGS boutique network.
            </p>
            {!user ? (
              <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
                <Link
                  href="/signup?redirect=/inner-circle"
                  className="btn-primary"
                  style={{
                    padding: "16px 36px",
                    fontSize: "15px",
                    letterSpacing: ".2em",
                    textDecoration: "none",
                    display: "inline-block",
                  }}
                >
                  CREATE ACCOUNT TO ENLIST
                </Link>
                <Link
                  href="/login?redirect=/inner-circle"
                  style={{
                    border: "1px solid var(--gold-dk)",
                    color: "var(--gold)",
                    padding: "16px 36px",
                    fontSize: "15px",
                    letterSpacing: ".2em",
                    textTransform: "uppercase",
                    textDecoration: "none",
                    display: "inline-block",
                  }}
                >
                  SIGN IN
                </Link>
              </div>
            ) : (
              <button
                onClick={handleJoin}
                disabled={enlisting}
                className="btn-primary"
                style={{
                  padding: "18px 48px",
                  fontSize: "15px",
                  letterSpacing: ".12em",
                  cursor: enlisting ? "not-allowed" : "pointer",
                  opacity: enlisting ? 0.7 : 1,
                }}
              >
                {enlisting ? "ENLISTING CLIENT..." : "ENLIST IN THE INNER CIRCLE"}
              </button>
            )}
          </div>
        )}
      </section>

      {/* Privileges Matrix */}
      <section style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 24px 100px" }}>
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <div style={{ fontSize: "14px", letterSpacing: ".12em", color: "var(--gold)", textTransform: "uppercase", marginBottom: "10px" }}>
            MEMBER PRIVILEGES
          </div>
          <h3 style={{ fontFamily: "Playfair Display, serif", fontSize: "1.9rem", color: "var(--white)", fontWeight: 300 }}>
            Curated For The Discerning
          </h3>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" }}>
          <div style={{ background: "var(--dark2)", border: "1px solid var(--dark3)", padding: "32px 24px" }}>
            <div style={{ color: "var(--gold)", fontSize: "1.4rem", marginBottom: "16px" }}>01</div>
            <h4 style={{ fontFamily: "Playfair Display, serif", color: "var(--white)", fontSize: "1.1rem", marginBottom: "10px" }}>
              Private Allocations
            </h4>
            <p style={{ fontSize: "15px", color: "var(--muted)", lineHeight: 1.8 }}>
              Guaranteed priority reservation on ultra-limited 25-piece batch drops before general public release.
            </p>
          </div>

          <div style={{ background: "var(--dark2)", border: "1px solid var(--dark3)", padding: "32px 24px" }}>
            <div style={{ color: "var(--gold)", fontSize: "1.4rem", marginBottom: "16px" }}>02</div>
            <h4 style={{ fontFamily: "Playfair Display, serif", color: "var(--white)", fontSize: "1.1rem", marginBottom: "10px" }}>
              Complimentary Caseback Engraving
            </h4>
            <p style={{ fontSize: "15px", color: "var(--muted)", lineHeight: 1.8 }}>
              Personalize every timepiece order with custom royal monogramming crafted in our Lagos workshop.
            </p>
          </div>

          <div style={{ background: "var(--dark2)", border: "1px solid var(--dark3)", padding: "32px 24px" }}>
            <div style={{ color: "var(--gold)", fontSize: "1.4rem", marginBottom: "16px" }}>03</div>
            <h4 style={{ fontFamily: "Playfair Display, serif", color: "var(--white)", fontSize: "1.1rem", marginBottom: "10px" }}>
              White-Glove Concierge
            </h4>
            <p style={{ fontSize: "15px", color: "var(--muted)", lineHeight: 1.8 }}>
              Direct line to our master watchmakers for strap adjustments, servicing, and bespoke design consultation.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default function InnerCirclePage() {
  return <InnerCircleContent />;
}
