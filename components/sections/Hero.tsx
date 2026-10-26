"use client";


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

        <div className="hero-watch-stage">
          <div className="hero-glow"></div>

          <div className="hero-watch-video-portal">
            <video
              className="hero-watch-video"
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
            >
              <source src="/watch-assembly.mp4" type="video/mp4" />
            </video>
            <div className="hero-watch-glass"></div>
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