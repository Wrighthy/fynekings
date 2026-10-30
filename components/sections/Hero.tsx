"use client";

import { useEffect, useRef } from "react";

export default function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.muted = true;
      video.defaultMuted = true;
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Fallback if browser requires interaction
        });
      }
    }
  }, []);

  return (
    <section id="hero">
      {/* Full-bleed Video Background */}
      <div className="hero-video-bg">
        <video
          ref={videoRef}
          className="hero-video"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          src="/watch-assembly.mp4"
        >
          <source src="/watch-assembly.mp4" type="video/mp4" />
        </video>
        <div className="hero-video-overlay"></div>
      </div>

      <div className="hero-bg"></div>
      <div className="hero-grid-lines"></div>
      <div className="hero-corner tl"></div>
      <div className="hero-corner tr"></div>
      <div className="hero-corner bl"></div>
      <div className="hero-corner br"></div>

      <div className="hero-inner">
        <div className="hero-content">
          <div className="hero-meta">
            <div className="hero-meta-line"></div>
            <span className="hero-meta-text">Est. 2014 · Lagos · Nigeria</span>
            <div className="hero-meta-line"></div>
          </div>
          <h1 className="h-title">Time is<br />an <em>Art</em>.</h1>
          <p className="h-sub">
            <strong>Distinctive timepieces for the ambitious collector.</strong> Fynekings presents a premier gallery of hand-curated, authentic wristwatches in Lagos, engineered for precision and styled for leadership.
          </p>
          <div className="h-actions">
            <a href="#bestsellers" className="btn-primary">
              <span>Explore Collection</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 17L17 7M7 7h10v10" /></svg>
            </a>
            <a href="/collection" className="btn-outline">
              View All Watches
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 12h14" /></svg>
            </a>
          </div>
          <div className="hero-trust">
            <div className="trust-item"><div className="num">412</div><div className="label">Hand-curated timepieces</div></div>
            <div className="trust-item"><div className="num">24hr</div><div className="label">Power reserve</div></div>
            <div className="trust-item"><div className="num">2yr</div><div className="label">National warranty</div></div>
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