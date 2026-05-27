"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/lib/store";

export default function Countdown() {
  const [timer, setTimer] = useState({ d: "14", h: "00", m: "00", s: "00" });
  const addToCart = useCart(s => s.addToCart);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const target = new Date(now);
      target.setDate(target.getDate() + 14);
      target.setHours(23, 59, 59, 0);
      const diff = Math.max(0, target.getTime() - now.getTime());
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
  }, []);

  return (
    <section id="countdown">
      <div className="countdown-inner reveal">
        <div className="edition-wrap">
          <div className="edition-dot"></div>
          <span className="edition-label">Live Drop · Limited to 50 Units</span>
          <div className="edition-dot"></div>
        </div>
        <h2 className="sec-title">The <em>Obsidian King</em><br/>Limited Edition</h2>
        <div className="edition-mini-meta">
          <span><span className="dot"></span>Reference F-OBK/24</span>
          <span><span className="dot"></span>Each piece numbered & signed</span>
          <span><span className="dot"></span>Ships in October</span>
        </div>

        <div className="limited-watch-preview">
          <svg viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%", animation: "floatWatch 5s ease-in-out infinite", filter: "drop-shadow(0 20px 40px rgba(139,32,32,.3))" }}>
            <defs>
              <radialGradient id="lfg" cx="50%" cy="42%" r="55%">
                <stop offset="0%" stopColor="#1a0a0a"/>
                <stop offset="100%" stopColor="#040000"/>
              </radialGradient>
            </defs>
            <rect x="98" y="14" width="44" height="48" rx="8" fill="#0a0606" stroke="#2a1010" strokeWidth=".8"/>
            <rect x="98" y="178" width="44" height="48" rx="8" fill="#0a0606" stroke="#2a1010" strokeWidth=".8"/>
            <circle cx="120" cy="120" r="68" fill="#0a0606" stroke="#C4A962" strokeWidth="2"/>
            <circle cx="120" cy="120" r="60" fill="url(#lfg)" stroke="#1a0a0a" strokeWidth=".5"/>
            <line x1="120" y1="58" x2="120" y2="68" stroke="#C4A962" strokeWidth="1.8"/>
            <line x1="120" y1="172" x2="120" y2="182" stroke="#C4A962" strokeWidth="1.8"/>
            <line x1="58" y1="120" x2="68" y2="120" stroke="#C4A962" strokeWidth="1.8"/>
            <line x1="172" y1="120" x2="182" y2="120" stroke="#C4A962" strokeWidth="1.8"/>
            <text x="120" y="100" textAnchor="middle" fill="#C4A962" fontFamily="Playfair Display,serif" fontSize="7.5" letterSpacing="3" fontStyle="italic">Obsidian King</text>
            <text x="120" y="112" textAnchor="middle" fill="#5A5550" fontFamily="Raleway,sans-serif" fontSize="4.5" letterSpacing="2">No. 38 / 50</text>
            <line x1="120" y1="120" x2="120" y2="80" stroke="#F4EFE4" strokeWidth="2.5" strokeLinecap="round"/>
            <line x1="120" y1="120" x2="146" y2="100" stroke="#F4EFE4" strokeWidth="2" strokeLinecap="round"/>
            <line x1="120" y1="120" x2="100" y2="142" stroke="#C4A962" strokeWidth="1.2" strokeLinecap="round"/>
            <circle cx="120" cy="120" r="4" fill="#C4A962"/>
            <circle cx="120" cy="120" r="1.5" fill="#080808"/>
          </svg>
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
          <div className="stock-label"><span>Stock Remaining</span><span>12 of 50 left</span></div>
          <div className="stock-bar"><div className="stock-fill"></div></div>
          <div className="stock-tick">
            <span>0</span>
            <span style={{ color: "var(--gold)" }}>76% Claimed · Going Fast</span>
            <span>50</span>
          </div>
        </div>

        <div className="limited-price-wrap">
          <p className="limited-price">₦850,000 <em>+ ₦12,850 fee</em></p>
          <p className="limited-price-meta">Paystack processing fee (1.5% + ₦100) · shown transparently</p>
          <button className="btn-primary" onClick={() => addToCart("Obsidian King", `Limited Edition · No. ${Math.floor(Math.random() * 38 + 1)}/50`, 850000)}>
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