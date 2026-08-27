import Link from "next/link";
import { ARTICLES } from "@/lib/articles";


export default function Education() {
  return (
    <section id="education" style={{ background: "var(--black)" }}>
      <div className="sec-inner">
        <div className="reveal" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "24px" }}>
          <div>
            <p className="sec-tag">The Craft · No. 06</p>
            <h2 className="sec-title">Watch <em>Education</em></h2>
            <p className="sec-desc">Understanding what you wear. The knowledge behind every piece in our collection — written by our master watchmakers.</p>
          </div>
          <Link
            href="/journal"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              padding: "12px 24px",
              border: "1px solid var(--gold-dk)",
              color: "var(--gold)",
              textDecoration: "none",
              fontSize: ".52rem",
              letterSpacing: ".25em",
              textTransform: "uppercase",
              transition: "all .3s ease",
              marginBottom: "8px",
            }}
          >
            Explore Full Journal
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M13 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        <div className="edu-grid reveal" style={{ transitionDelay: ".2s" }}>
          {ARTICLES.map(e => (
            <Link
              key={e.vol}
              href={`/journal/${e.slug}`}
              className="edu-card"
              style={{ textDecoration: "none", display: "block" }}
            >
              <p className="edu-num">Vol. {e.vol}</p>
              <svg className="edu-icon" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth="1">
                <circle cx="24" cy="24" r="20" />
                <circle cx="24" cy="24" r="3" fill="currentColor" />
                <line x1="24" y1="24" x2="24" y2="9" strokeLinecap="round" strokeWidth="1.4" />
                <line x1="24" y1="24" x2="34" y2="17" strokeLinecap="round" strokeWidth="1.2" />
              </svg>
              <h3>{e.title}</h3>
              <p>{e.subtitle}</p>
              <span className="edu-link">Read Article →</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}