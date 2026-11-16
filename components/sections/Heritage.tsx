export default function Heritage() {
  const stats = [
    { n: "2024", l: "Founded" },
    { n: "248+", l: "Pieces Sold" },
    { n: "14", l: "Countries" },
  ];

  return (
    <section id="heritage">
      <div className="sec-inner">
        <div className="heritage-grid">
          <div className="reveal">
            <div className="heritage-img-wrap">
              <div className="heritage-img-decoration"></div>
              <div className="heritage-img-illustration">
                <svg viewBox="0 0 200 200" width="200" height="200" xmlns="http://www.w3.org/2000/svg" style={{ opacity: .7 }}>
                  <circle cx="100" cy="100" r="90" fill="none" stroke="#C4A962" strokeWidth="1" strokeDasharray="4 4"/>
                  <circle cx="100" cy="100" r="70" fill="none" stroke="#C4A962" strokeWidth=".6"/>
                  <circle cx="100" cy="100" r="50" fill="none" stroke="#C4A962" strokeWidth=".6"/>
                  <circle cx="100" cy="100" r="30" fill="none" stroke="#C4A962" strokeWidth="1"/>
                  <circle cx="100" cy="100" r="20" fill="none" stroke="#F4EFE4" strokeWidth=".8"/>
                  <circle cx="100" cy="100" r="4" fill="#C4A962"/>
                  <line x1="100" y1="100" x2="100" y2="80" stroke="#F4EFE4" strokeWidth=".5"/>
                  <line x1="100" y1="100" x2="100" y2="120" stroke="#F4EFE4" strokeWidth=".5"/>
                  <line x1="100" y1="100" x2="80" y2="100" stroke="#F4EFE4" strokeWidth=".5"/>
                  <line x1="100" y1="100" x2="120" y2="100" stroke="#F4EFE4" strokeWidth=".5"/>
                </svg>
                <p style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: "15px", color: "var(--muted)", textAlign: "center", marginTop: "20px" }}>
                  Caliber F-2401 · 25 Jewels · Hand-finished
                </p>
              </div>
              <div className="heritage-stat s1">
                <div className="heritage-stat-num">412</div>
                <div className="heritage-stat-label">Components</div>
              </div>
              <div className="heritage-stat s2">
                <div className="heritage-stat-num">14</div>
                <div className="heritage-stat-label">Watchmakers</div>
              </div>
            </div>
          </div>

          <div className="reveal" style={{ transitionDelay: ".2s" }}>
            <p className="sec-tag">The Heritage · No. 03</p>
            <h2 className="sec-title">Lagos Made.<br/><em>World Class.</em></h2>
            <p className="sec-desc">Within our Victoria Island horological gallery and archive, fourteen master watchmakers curate, inspect, and calibrate each Fynekings piece by hand. Every escapement is regulated to chronometer-grade accuracy. Every bevel is mirror-polished under 10× magnification.</p>
            <div className="heritage-quote">
              &ldquo;We don&apos;t make watches that compete with Geneva. We make watches that <em>stand alongside</em> them — and tell a story Geneva can&apos;t.&rdquo;
            </div>
            <p className="heritage-author"><strong>Adebayo Okafor</strong> · Master Watchmaker, Founder</p>
            <div style={{ marginTop: "40px", display: "flex", gap: "24px", flexWrap: "wrap" }}>
              {stats.map(s => (
                <div key={s.l} style={{ borderLeft: "1px solid var(--gold-dk)", paddingLeft: "16px" }}>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.4rem", color: "var(--gold)", fontWeight: 300 }}>{s.n}</div>
                  <div style={{ fontSize: "14px", letterSpacing: ".12em", textTransform: "uppercase", color: "var(--muted)", marginTop: "4px" }}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}