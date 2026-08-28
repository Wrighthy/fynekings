"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/lib/store";

type Edition = {
  id: string;
  name: string;
  reference: string;
  price: number;
  totalStock: number;
  soldCount: number;
  dropEndsAt: string;
  imageUrl?: string;
  description?: string;
};

const DEFAULT_EDITION_IMAGE = "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1200&auto=format&fit=crop";

export default function Countdown() {
  const [timer, setTimer] = useState({ d: "14", h: "00", m: "00", s: "00" });
  const [edition, setEdition] = useState<Edition | null>(null);
  const addToCart = useCart(s => s.addToCart);

  // Fetch edition from database
  useEffect(() => {
    fetch("/api/edition")
      .then(r => r.json())
      .then(data => setEdition(data))
      .catch(console.error);
  }, []);

  // Countdown timer — uses real drop date from database
  useEffect(() => {
    const tick = () => {
      const target = edition
        ? new Date(edition.dropEndsAt).getTime()
        : Date.now() + 14 * 24 * 60 * 60 * 1000;
      const diff = Math.max(0, target - Date.now());
      setTimer({
        d: String(Math.floor(diff / 86400000)).padStart(2, "0"),
        h: String(Math.floor((diff % 86400000) / 3600000)).padStart(2, "0"),
        m: String(Math.floor((diff % 3600000) / 60000)).padStart(2, "0"),
        s: String(Math.floor((diff % 60000) / 1000)).padStart(2, "0"),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [edition]);

  const remaining = edition ? edition.totalStock - edition.soldCount : 12;
  const total = edition ? edition.totalStock : 50;
  const stockPercent = Math.round((remaining / total) * 100);
  const claimedPercent = 100 - stockPercent;
  const price = edition ? edition.price : 850000;
  const editionName = edition ? edition.name : "Obsidian King";
  const reference = edition ? edition.reference : "F-OBK/24";

  return (
    <section id="countdown">
      <div className="countdown-inner reveal">
        <div className="edition-wrap">
          <div className="edition-dot"></div>
          <span className="edition-label">Live Drop · Limited to {total} Units</span>
          <div className="edition-dot"></div>
        </div>
        <h2 className="sec-title">The <em>{editionName}</em><br/>Limited Edition</h2>
        <div className="edition-mini-meta">
          <span><span className="dot"></span>Reference {reference}</span>
          <span><span className="dot"></span>Each piece numbered & signed</span>
          <span><span className="dot"></span>Ships in October</span>
        </div>

        {/* Real Luxury Watch Photo Presentation */}
        <div className="limited-watch-preview" style={{ maxWidth: "360px", margin: "0 auto 36px", position: "relative" }}>
          <div
            style={{
              position: "relative",
              borderRadius: "16px",
              overflow: "hidden",
              border: "1px solid var(--gold-dk)",
              boxShadow: "0 24px 60px -12px rgba(196,169,98,.2), 0 16px 32px -8px rgba(0,0,0,.9)",
              background: "radial-gradient(circle at center, #1a1a1a 0%, #080808 100%)",
              aspectRatio: "1 / 1",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <img
              src={edition?.imageUrl || DEFAULT_EDITION_IMAGE}
              alt={editionName}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                transition: "transform .6s ease",
              }}
              className="edition-img"
            />
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                background: "linear-gradient(to top, rgba(8,8,8,.92) 0%, rgba(8,8,8,0.4) 60%, transparent 100%)",
                padding: "28px 20px 14px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
              }}
            >
              <span style={{ fontSize: ".52rem", letterSpacing: ".25em", color: "var(--gold)", textTransform: "uppercase" }}>
                Ref. {reference}
              </span>
              <span style={{ fontSize: ".48rem", letterSpacing: ".2em", color: "var(--muted)", textTransform: "uppercase" }}>
                No. {edition?.soldCount ?? 38} / {total}
              </span>
            </div>
          </div>
        </div>

        <p style={{ fontSize: ".55rem", letterSpacing: ".3em", textTransform: "uppercase", color: "var(--gold)", marginBottom: "32px" }}>Drop Closes In</p>

        <div className="timer-grid">
          {[{ v: timer.d, l: "Days" }, { v: timer.h, l: "Hours" }, { v: timer.m, l: "Minutes" }, { v: timer.s, l: "Seconds" }].map(t => (
            <div key={t.l} className="timer-block">
              <div className="timer-num-wrap"><span className="timer-num">{t.v}</span></div>
              <span className="timer-label">{t.l}</span>
            </div>
          ))}
        </div>

        <div className="stock-bar-wrap">
          <div className="stock-label">
            <span>Stock Remaining</span>
            <span>{remaining} of {total} left</span>
          </div>
          <div className="stock-bar"><div className="stock-fill" style={{ width: `${stockPercent}%` }}></div></div>
          <div className="stock-tick">
            <span>0</span>
            <span style={{ color: "var(--gold)" }}>{claimedPercent}% Claimed · Going Fast</span>
            <span>{total}</span>
          </div>
        </div>

        <div className="limited-price-wrap">
          <p className="limited-price">₦{price.toLocaleString("en-NG")} <em>+ ₦{Math.min(Math.round(price * 0.015 + 100), 2000).toLocaleString("en-NG")} fee</em></p>
          <p className="limited-price-meta">Paystack processing fee (1.5% + ₦100) · shown transparently</p>
          <button className="btn-primary" onClick={() => addToCart(editionName, `Limited Edition · No. ${(edition?.soldCount ?? 38) + 1}/${total}`, price)}>
            <span>Reserve Yours Now</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 17L17 7M7 7h10v10"/></svg>
          </button>
          <div className="payment-icons">
            <span className="payment-icon gold">Paystack</span>
            <span className="payment-icon">Flutterwave</span>
            <span className="payment-icon">Bank Transfer</span>
            <span className="payment-icon">USSD</span>
          </div>
        </div>
      </div>
    </section>
  );
}