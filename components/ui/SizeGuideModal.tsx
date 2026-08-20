"use client";

import { useState } from "react";

export default function SizeGuideModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [wristCircumference, setWristCircumference] = useState<number>(16.5);

  if (!open) return null;

  const getRecommendedSize = (cm: number) => {
    if (cm < 15) return { caseSize: "36mm - 38mm", fit: "Compact / Vintage Fit", note: "Ideal for slimmer wrists. Elegant classic proportions." };
    if (cm <= 17.5) return { caseSize: "39mm - 41mm", fit: "Standard / Universal Fit", note: "Most versatile proportion for luxury dress & sports timepieces." };
    return { caseSize: "42mm - 45mm", fit: "Grand / Statement Fit", note: "Bold wrist presence with substantial horological weight." };
  };

  const rec = getRecommendedSize(wristCircumference);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(5, 5, 5, 0.92)",
        backdropFilter: "blur(16px)",
        zIndex: 9990,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        animation: "fadeIn .25s ease",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "680px",
          width: "100%",
          background: "var(--dark)",
          border: "1px solid var(--gold-dk)",
          padding: "36px 32px",
          display: "flex",
          flexDirection: "column",
          gap: "24px",
          position: "relative",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            background: "none",
            border: "1px solid var(--gold-dk)",
            color: "var(--gold)",
            width: "36px",
            height: "36px",
            cursor: "none",
          }}
        >
          ✕
        </button>

        <div>
          <div style={{ fontSize: ".5rem", letterSpacing: ".4em", color: "var(--gold-dk)", textTransform: "uppercase", marginBottom: "8px" }}>
            Horological Fit Guide
          </div>
          <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: "2rem", color: "var(--white)", fontWeight: 300 }}>
            Watch Case & Wrist Sizing Calculator
          </h2>
        </div>

        {/* Wrist slider */}
        <div style={{ padding: "20px", background: "var(--dark2)", border: "1px solid var(--dark3)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", alignItems: "baseline" }}>
            <span style={{ fontSize: ".55rem", letterSpacing: ".2em", color: "var(--muted)", textTransform: "uppercase" }}>Your Wrist Circumference</span>
            <span style={{ fontFamily: "Playfair Display, serif", fontSize: "1.4rem", color: "var(--gold)" }}>{wristCircumference} cm</span>
          </div>
          <input
            type="range"
            min="13"
            max="22"
            step="0.5"
            value={wristCircumference}
            onChange={(e) => setWristCircumference(parseFloat(e.target.value))}
            style={{ width: "100%", accentColor: "var(--gold)", cursor: "pointer" }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: ".45rem", color: "var(--muted)", marginTop: "6px" }}>
            <span>13 cm (5.1 in)</span>
            <span>17.5 cm (6.9 in)</span>
            <span>22 cm (8.7 in)</span>
          </div>
        </div>

        {/* Dynamic Recommendation Card */}
        <div style={{ padding: "20px", background: "var(--dark3)", borderLeft: "3px solid var(--gold)" }}>
          <div style={{ fontSize: ".5rem", letterSpacing: ".3em", color: "var(--gold)", textTransform: "uppercase", marginBottom: "4px" }}>
            Recommended Case Diameter
          </div>
          <div style={{ fontFamily: "Playfair Display, serif", fontSize: "1.8rem", color: "var(--white)", marginBottom: "4px" }}>
            {rec.caseSize}
          </div>
          <div style={{ fontSize: ".6rem", letterSpacing: ".15em", color: "var(--text)", textTransform: "uppercase", marginBottom: "8px" }}>
            {rec.fit}
          </div>
          <p style={{ fontSize: ".65rem", lineHeight: 1.8, color: "var(--muted)" }}>{rec.note}</p>
        </div>

        {/* Reference Table */}
        <div style={{ marginTop: "12px" }}>
          <div style={{ fontSize: ".52rem", letterSpacing: ".3em", color: "var(--gold-dk)", textTransform: "uppercase", marginBottom: "16px" }}>
            Watch Diameter Reference Chart
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: ".6rem" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--dark4)", textAlign: "left", color: "var(--gold-dk)" }}>
                <th style={{ padding: "10px 0", letterSpacing: ".15em" }}>Case Size</th>
                <th style={{ padding: "10px 0", letterSpacing: ".15em" }}>Wrist Size</th>
                <th style={{ padding: "10px 0", letterSpacing: ".15em" }}>Style Category</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: "1px solid var(--dark3)" }}>
                <td style={{ padding: "12px 0", color: "var(--white)" }}>36mm - 38mm</td>
                <td style={{ padding: "12px 0", color: "var(--text)" }}>Under 15 cm</td>
                <td style={{ padding: "12px 0", color: "var(--gold)" }}>Classic Dress</td>
              </tr>
              <tr style={{ borderBottom: "1px solid var(--dark3)" }}>
                <td style={{ padding: "12px 0", color: "var(--white)" }}>39mm - 41mm</td>
                <td style={{ padding: "12px 0", color: "var(--text)" }}>15 cm - 17.5 cm</td>
                <td style={{ padding: "12px 0", color: "var(--gold)" }}>Everyday / Executive</td>
              </tr>
              <tr>
                <td style={{ padding: "12px 0", color: "var(--white)" }}>42mm - 45mm</td>
                <td style={{ padding: "12px 0", color: "var(--text)" }}>Above 17.5 cm</td>
                <td style={{ padding: "12px 0", color: "var(--gold)" }}>Sports / Chronograph</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
