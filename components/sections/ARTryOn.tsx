import Link from "next/link";

export default function ARTryOn() {
  return (
    <section id="tryon" style={{ background: "var(--black)" }}>
      <div className="sec-inner">
        <div className="ar-grid">
          <div className="reveal">
            <p className="sec-tag">Virtual Try-On · No. 04</p>
            <h2 className="sec-title">Virtual <em>Try-On</em></h2>
            <p className="sec-desc">See any Fynekings piece on your wrist before you buy. Powered by Google MediaPipe — no app needed, works directly in your browser on iOS Safari and Android Chrome.</p>
            <div className="divider"></div>
            <div className="ar-steps">
              <div className="ar-step">
                <div className="ar-step-num">i</div>
                <div><h4>Select Your Model</h4><p>Choose any watch from our signature collection to preview on your wrist.</p></div>
              </div>
              <div className="ar-step">
                <div className="ar-step-num">ii</div>
                <div><h4>Allow Camera Access</h4><p>Point your camera at your wrist. Our hand-tracking algorithm activates automatically — no markers needed.</p></div>
              </div>
              <div className="ar-step">
                <div className="ar-step-num">iii</div>
                <div><h4>See It Live</h4><p>The watch renders at true scale with accurate lighting. Rotate your wrist to see every angle, every reflection.</p></div>
              </div>
            </div>
            <Link href="/virtual-try-on" className="ar-launch-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>
              Launch AR Try-On <span className="ar-8w-badge">MediaPipe</span>
            </Link>
            <div className="ar-compat">
              <span>iOS Safari 13+</span>
              <span>Android Chrome 81+</span>
              <span>No app needed</span>
            </div>
          </div>

          <div className="reveal" style={{ transitionDelay: ".2s", position: "relative" }}>
            <div className="ar-phone">
              <div className="ar-phone-frame">
                <div className="ar-phone-screen">
                  <div className="ar-video-bg">
                    <div className="ar-skin"></div>
                    <div className="ar-wrist-shadow"></div>
                    <div className="ar-status-bar">
                      <span className="ar-rec"><span className="ar-rec-dot"></span>AR Live</span>
                      <span>Tracking 98%</span>
                    </div>
                    <div className="ar-tracking-corners">
                      <span className="tl"></span><span className="tr"></span>
                      <span className="bl"></span><span className="br"></span>
                    </div>
                    <div className="ar-scan-info">
                      <div className="ar-scan-ring"><div className="ar-scan-dot"></div></div>
                      <div className="ar-scan-label">Wrist Locked</div>
                    </div>
                    <div className="ar-wrist-line"></div>
                    <div className="ar-watch-overlay">
                      <svg viewBox="0 0 100 100" width="92" height="92" xmlns="http://www.w3.org/2000/svg" style={{ filter: "drop-shadow(0 6px 12px rgba(0,0,0,.6))" }}>
                        <rect x="40" y="6" width="20" height="22" rx="3" fill="#141414" stroke="#2a2a2a" strokeWidth=".5"/>
                        <rect x="40" y="72" width="20" height="22" rx="3" fill="#141414" stroke="#2a2a2a" strokeWidth=".5"/>
                        <circle cx="50" cy="50" r="32" fill="#0d0d0d" stroke="#C4A962" strokeWidth="1.2"/>
                        <circle cx="50" cy="50" r="27" fill="#080808"/>
                        <text x="50" y="44" textAnchor="middle" fill="#C4A962" fontFamily="Playfair Display,serif" fontSize="4.5" letterSpacing="1.5">FYNEKINGS</text>
                        <line x1="50" y1="50" x2="50" y2="30" stroke="#F4EFE4" strokeWidth="1.5" strokeLinecap="round"/>
                        <line x1="50" y1="50" x2="64" y2="42" stroke="#F4EFE4" strokeWidth="1.2" strokeLinecap="round"/>
                        <circle cx="50" cy="50" r="2.5" fill="#C4A962"/>
                      </svg>
                    </div>
                    <div className="ar-bottom-hud">
                      <span>Sovereign I · Midnight</span>
                      <span style={{ color: "var(--gold)" }}>₦485,000</span>
                    </div>
                  </div>
                </div>
                <div className="ar-notch"></div>
              </div>
            </div>
            <div className="phone-floating-tag t1">
              <div className="phone-floating-tag-line"></div>
              <span>Tracking · <span className="gold">98%</span></span>
            </div>
            <div className="phone-floating-tag t2">
              <span>Scale · <span className="gold">1:1</span></span>
              <div className="phone-floating-tag-line"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}