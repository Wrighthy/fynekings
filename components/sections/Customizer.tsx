"use client";

import LuxuryWatch from "@/components/ui/LuxuryWatch";
import { useCart, useCustomizer, fmt, BASE_PRICE } from "@/lib/store";

const STRAPS = [
  { color: "#141414", name: "Midnight Black", extra: 0 },
  { color: "#3D2B1F", name: "Cognac Brown", extra: 15000, premium: true },
  { color: "#1a1a3a", name: "Navy Blue", extra: 15000, premium: true },
  { color: "#2a1515", name: "Oxblood", extra: 15000, premium: true },
  { color: "#C4A962", name: "Gold Croc", extra: 35000, premium: true },
  { color: "#E8E4DC", name: "Ivory White", extra: 20000, premium: true, border: true },
];

const CASES = [
  { name: "Gold PVD", stroke: "#C4A962", extra: 0 },
  { name: "Steel", stroke: "#888", extra: 0 },
  { name: "Rose Gold", stroke: "#C47070", extra: 25000 },
  { name: "Black DLC", stroke: "#444", extra: 20000 },
];

const DIALS = [
  { name: "Sunray Black", extra: 0 },
  { name: "Guilloche Gold", extra: 30000 },
  { name: "Deep Blue", extra: 20000 },
  { name: "Skeleton", extra: 50000 },
];

export default function Customizer() {
  const c = useCustomizer();
  const addCustomToCart = useCart(s => s.addCustomToCart);
  const cfgExtra = c.strapExtra + c.caseExtra + c.dialExtra;

  const handleAddToCart = () => {
    addCustomToCart(
      { strapName: c.strapName, caseName: c.caseName, dialName: c.dialName },
      cfgExtra
    );
  };

  return (
    <section id="customizer" style={{ background: "var(--dark)", borderTop: "1px solid var(--dark3)", borderBottom: "1px solid var(--dark3)" }}>
      <div className="sec-inner">
        <div className="customizer-grid">
          <div className="watch-stage reveal">
            <div className="stage-spec top">REF. F-ATLR · 1:1 PREVIEW</div>
            <div className="stage-spec bottom">LIVE RENDER · WEBGL DISABLED</div>
            <div className="stage-corners"><span className="tl"></span><span className="tr"></span><span className="bl"></span><span className="br"></span></div>
            <div className="watch-viewport">
              <div className="stage-glow"></div>
              <div className="stage-orbit"></div>
              <div className="stage-orbit-inner"></div>
              <LuxuryWatch strapColor={c.strapColor} caseStroke={c.caseStroke} showBezelGradient={false} />
            </div>
          </div>

          <div className="cust-controls reveal" style={{ transitionDelay: ".2s" }}>
            <p className="sec-tag">Build Your Watch · No. 02</p>
            <h2 className="sec-title">3D <em>Customizer</em></h2>
            <p className="sec-desc">Every detail tailored to you. Configure strap, case, and dial — see it update in real-time. Lead time: 4 weeks from order.</p>
            <div className="divider"></div>

            <div className="ctrl-group">
              <div className="ctrl-label"><span>① Strap Colour</span><span>{STRAPS.length} Options</span></div>
              <div className="swatches">
                {STRAPS.map(s => (
                  <div
                    key={s.name}
                    className={`swatch ${c.strapColor === s.color ? "active" : ""} ${s.premium ? "premium" : ""}`}
                    style={{ background: s.color, border: s.border ? "1px solid #444" : undefined }}
                    title={s.name + (s.extra ? ` +${fmt(s.extra)}` : "")}
                    onClick={() => c.setStrap(s.color, s.name, s.extra)}
                  ></div>
                ))}
              </div>
            </div>

            <div className="ctrl-group">
              <div className="ctrl-label"><span>② Case Finish</span><span>{CASES.length} Options</span></div>
              <div className="style-btns">
                {CASES.map(cs => (
                  <button key={cs.name} className={`style-btn ${c.caseName === cs.name ? "active" : ""}`} onClick={() => c.setCase(cs.name, cs.stroke, cs.extra)}>
                    {cs.name} {cs.extra > 0 && <small>+{cs.extra/1000}k</small>}
                  </button>
                ))}
              </div>
            </div>

            <div className="ctrl-group">
              <div className="ctrl-label"><span>③ Dial Style</span><span>{DIALS.length} Options</span></div>
              <div className="style-btns">
                {DIALS.map(d => (
                  <button key={d.name} className={`style-btn ${c.dialName === d.name ? "active" : ""}`} onClick={() => c.setDial(d.name, d.extra)}>
                    {d.name} {d.extra > 0 && <small>+{d.extra/1000}k</small>}
                  </button>
                ))}
              </div>
            </div>

            <div className="config-summary">
              <div className="config-row"><span className="config-key">Strap</span><span className="config-val">{c.strapName}</span></div>
              <div className="config-row"><span className="config-key">Case</span><span className="config-val">{c.caseName}</span></div>
              <div className="config-row"><span className="config-key">Dial</span><span className="config-val">{c.dialName}</span></div>
              <div className="config-row"><span className="config-key">Base Price</span><span className="config-val">₦420,000</span></div>
              <div className="config-row"><span className="config-key">Customisation</span><span className="config-val">+ {fmt(cfgExtra)}</span></div>
              <div className="config-row"><span className="config-key">Total</span><span className="config-price">{fmt(BASE_PRICE + cfgExtra)}</span></div>
            </div>
            <button className="add-cart-btn" onClick={handleAddToCart}>
              <span>Add Custom Watch to Cart</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}