"use client";

import LuxuryWatch from "@/components/ui/LuxuryWatch";

export default function Hero() {
  return (
    <section id="hero">
      <div className="hero-bg"></div>
      <div className="hero-grid-lines"></div>
      <div className="hero-corner tl"></div>
      <div className="hero-corner tr"></div>
      <div className="hero-corner bl"></div>
      <div className="hero-corner br"></div>

      <div className="hero-inner">
        <div>
          <div className="hero-meta">
            <div className="hero-meta-line"></div>
            <span className="hero-meta-text">Est. 2024 · Lagos · Genève</span>
            <div className="hero-meta-line"></div>
          </div>
          <h1 className="h-title">Time is<br/>an <em>Art</em>.</h1>
          <p className="h-sub">
            <strong>Handcrafted timepieces for the African collector.</strong> Each Fynekings piece is hand-finished in our Lagos atelier, regulated to chronometer-grade precision, and signed by the watchmaker.
          </p>
          <div className="h-actions">
            <a href="#bestsellers" className="btn-primary">
              <span>Explore Collection</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 17L17 7M7 7h10v10"/></svg>
            </a>
            <a href="/collection" className="btn-outline">
              View All Watches
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 12h14"/></svg>
            </a>
          </div>
          <div className="hero-trust">
            <div className="trust-item"><div className="num">412</div><div className="label">Hand-finished components</div></div>
            <div className="trust-item"><div className="num">72hr</div><div className="label">Power reserve</div></div>
            <div className="trust-item"><div className="num">5yr</div><div className="label">International warranty</div></div>
          </div>
        </div>

        <div className="hero-watch-stage">
          <div className="hero-orbit-2"></div>
          <div className="hero-orbit"></div>
          <div className="hero-glow"></div>
          <div className="hero-spec s1"><div className="hero-spec-dot"></div><span>Cal. F-2401 · 25 Jewels</span></div>
          <div className="hero-spec s2"><span>316L Steel · 40mm</span><div className="hero-spec-dot"></div></div>
          <div className="hero-spec s3"><div className="hero-spec-line"></div><span>Sapphire Crystal</span></div>

          <div className="hero-watch">
            <LuxuryWatch showBezelGradient={true} />
          </div>
        </div>
      </div>

      <div className="scroll-hint">
        <span>Scroll</span>
        <div className="scroll-line"></div>
      </div>
    </section>
  );
}