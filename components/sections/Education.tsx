const ARTICLES = [
  { vol: "I", title: "Movement Types", body: "Quartz, automatic, manual, tourbillon — understanding the engine inside your watch and what each means for performance and prestige." },
  { vol: "II", title: "Case Materials", body: "316L steel, titanium, gold PVD, ceramic, DLC coating — how material choice affects durability, weight, aesthetics and long-term value." },
  { vol: "III", title: "Strap Guide", body: "Leather, rubber, NATO, mesh bracelet — choosing the right strap for your lifestyle, occasion, and personal style." },
  { vol: "IV", title: "Complications", body: "Chronograph, moonphase, GMT, annual calendar — what watch complications are, how they work, and which ones are worth the investment." },
  { vol: "V", title: "Watch Care", body: "Servicing intervals, water resistance ratings, proper storage, and cleaning. Keep your Fynekings piece performing for generations." },
  { vol: "VI", title: "Investment Value", body: "How limited editions, complications, and provenance affect resale value. Building a collection that appreciates over time." },
];

export default function Education() {
  return (
    <section id="education" style={{ background: "var(--black)" }}>
      <div className="sec-inner">
        <div className="reveal">
          <p className="sec-tag">The Craft · No. 06</p>
          <h2 className="sec-title">Watch <em>Education</em></h2>
          <p className="sec-desc">Understanding what you wear. The knowledge behind every piece in our collection — written by our master watchmakers.</p>
        </div>
        <div className="edu-grid reveal" style={{ transitionDelay: ".2s" }}>
          {ARTICLES.map(e => (
            <div key={e.vol} className="edu-card">
              <p className="edu-num">Vol. {e.vol}</p>
              <svg className="edu-icon" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth="1">
                <circle cx="24" cy="24" r="20" />
                <circle cx="24" cy="24" r="3" fill="currentColor" />
                <line x1="24" y1="24" x2="24" y2="9" strokeLinecap="round" strokeWidth="1.4" />
                <line x1="24" y1="24" x2="34" y2="17" strokeLinecap="round" strokeWidth="1.2" />
              </svg>
              <h3>{e.title}</h3>
              <p>{e.body}</p>
              <button className="edu-link" style={{ background: "none", border: "none", cursor: "pointer" }}>
                Read Article →
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}