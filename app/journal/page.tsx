import Link from "next/link";
import { ARTICLES } from "@/lib/articles";

export const metadata = {
    title: "Watch Education — Fynekings Journal",
    description: "The knowledge behind every piece in our collection — written by our master watchmakers.",
};

export default function JournalPage() {
    return (
        <div style={{ background: "var(--black)", minHeight: "100vh", fontFamily: "Raleway, sans-serif" }}>

            {/* Header */}
            <div style={{ background: "var(--dark)", borderBottom: "1px solid var(--dark3)", padding: "140px 64px 60px" }}>
                <div style={{ maxWidth: "1300px", margin: "0 auto" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "24px" }}>
                        <Link href="/" style={{ fontSize: "14px", letterSpacing: ".12em", color: "var(--muted)", textDecoration: "none", textTransform: "uppercase" }}>Home</Link>
                        <span style={{ color: "var(--dark4)" }}>→</span>
                        <span style={{ fontSize: "14px", letterSpacing: ".12em", color: "var(--gold)", textTransform: "uppercase" }}>Journal</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "20px" }}>
                        <span style={{ width: "24px", height: "1px", background: "var(--gold-dk)", display: "inline-block" }}></span>
                        <span style={{ fontSize: "14px", letterSpacing: ".12em", color: "var(--gold-dk)", textTransform: "uppercase" }}>The Craft · Watch Education</span>
                    </div>
                    <h1 style={{ fontFamily: "Playfair Display, serif", fontSize: "clamp(2.5rem, 6vw, 5rem)", fontWeight: 300, color: "var(--white)", marginBottom: "24px", letterSpacing: "-.02em" }}>
                        The Fynekings <em style={{ fontStyle: "italic", color: "var(--gold)" }}>Journal</em>
                    </h1>
                    <p style={{ fontSize: "15px", letterSpacing: ".12em", color: "var(--text)", lineHeight: 2.4, maxWidth: "600px" }}>
                        Six volumes of horological knowledge written by our master curators in Lagos, Nigeria. Understanding what you wear transforms how you wear it.
                    </p>
                </div>
            </div>

            {/* Articles grid */}
            <div style={{ maxWidth: "1300px", margin: "0 auto", padding: "80px 64px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))", gap: "1px", background: "var(--dark3)" }}>
                    {ARTICLES.map((article, i) => (
                        <Link
                            key={article.slug}
                            href={`/journal/${article.slug}`}
                            className="journal-card"
                        >
                            {/* Volume number watermark */}
                            <div style={{ position: "absolute", top: "-10px", right: "20px", fontFamily: "Playfair Display, serif", fontSize: "8rem", color: "rgba(196,169,98,.04)", fontWeight: 300, lineHeight: 1, pointerEvents: "none", userSelect: "none" }}>
                                {article.vol}
                            </div>

                            <div style={{ position: "relative", zIndex: 1 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
                                    <span style={{ fontSize: "14px", letterSpacing: ".12em", color: "var(--gold-dk)", textTransform: "uppercase" }}>Vol. {article.vol}</span>
                                    <span style={{ width: "20px", height: "1px", background: "var(--dark4)", display: "inline-block" }}></span>
                                    <span style={{ fontSize: "14px", letterSpacing: ".12em", color: "var(--muted)", textTransform: "uppercase" }}>{article.category}</span>
                                </div>

                                <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: "1.8rem", fontWeight: 300, color: "var(--white)", marginBottom: "16px", letterSpacing: "-.01em", lineHeight: 1.1 }}>
                                    {article.title}
                                </h2>

                                <p style={{ fontSize: "14px", letterSpacing: ".06em", lineHeight: 2.2, color: "var(--text)", marginBottom: "32px" }}>
                                    {article.subtitle}
                                </p>

                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                    <span style={{ fontSize: "14px", letterSpacing: ".12em", color: "var(--muted)", textTransform: "uppercase" }}>{article.readTime}</span>
                                    <span className="journal-read-link" style={{ fontSize: "14px", letterSpacing: ".12em", color: "var(--gold)", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "8px" }}>
                                        Read
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ transition: "transform .3s ease" }}><path d="M5 12h14M13 5l7 7-7 7" /></svg>
                                    </span>
                                </div>

                                {/* Bottom accent line */}
                                <div style={{ position: "absolute", bottom: 0, left: 0, width: "0", height: "2px", background: "var(--gold)", transition: "width .4s ease" }} className="journal-accent-line"></div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}