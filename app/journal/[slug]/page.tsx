import Link from "next/link";
import { ARTICLES } from "@/lib/articles";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
    return ARTICLES.map(a => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const article = ARTICLES.find(a => a.slug === slug);
    if (!article) return {};
    return {
        title: `${article.title} — Fynekings Journal`,
        description: article.subtitle,
    };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const article = ARTICLES.find(a => a.slug === slug);
    if (!article) notFound();

    const currentIndex = ARTICLES.findIndex(a => a.slug === slug);
    const prevArticle = currentIndex > 0 ? ARTICLES[currentIndex - 1] : null;
    const nextArticle = currentIndex < ARTICLES.length - 1 ? ARTICLES[currentIndex + 1] : null;

    return (
        <div style={{ background: "var(--black)", minHeight: "100vh", fontFamily: "Raleway, sans-serif" }}>

            {/* Header */}
            <div style={{ background: "var(--dark)", borderBottom: "1px solid var(--dark3)", padding: "140px 64px 60px", position: "relative", overflow: "hidden" }}>
                {/* Vol watermark */}
                <div style={{ position: "absolute", top: "50%", right: "64px", transform: "translateY(-50%)", fontFamily: "Playfair Display, serif", fontSize: "clamp(8rem, 20vw, 18rem)", color: "rgba(196,169,98,.04)", fontWeight: 300, lineHeight: 1, pointerEvents: "none", userSelect: "none" }}>
                    {article.vol}
                </div>

                <div style={{ maxWidth: "860px", margin: "0 auto", position: "relative", zIndex: 1 }}>
                    {/* Breadcrumb */}
                    <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "32px" }}>
                        <Link href="/" style={{ fontSize: "14px", letterSpacing: ".12em", color: "var(--muted)", textDecoration: "none", textTransform: "uppercase" }}>Home</Link>
                        <span style={{ color: "var(--dark4)" }}>→</span>
                        <Link href="/journal" style={{ fontSize: "14px", letterSpacing: ".12em", color: "var(--muted)", textDecoration: "none", textTransform: "uppercase" }}>Journal</Link>
                        <span style={{ color: "var(--dark4)" }}>→</span>
                        <span style={{ fontSize: "14px", letterSpacing: ".12em", color: "var(--gold)", textTransform: "uppercase" }}>{article.title}</span>
                    </div>

                    {/* Meta */}
                    <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px", flexWrap: "wrap" }}>
                        <span style={{ padding: "5px 14px", border: "1px solid var(--gold-dk)", fontSize: "14px", letterSpacing: ".12em", color: "var(--gold-dk)", textTransform: "uppercase" }}>Vol. {article.vol}</span>
                        <span style={{ fontSize: "14px", letterSpacing: ".12em", color: "var(--muted)", textTransform: "uppercase" }}>{article.category}</span>
                        <span style={{ width: "3px", height: "3px", borderRadius: "50%", background: "var(--dark4)", display: "inline-block" }}></span>
                        <span style={{ fontSize: "14px", letterSpacing: ".12em", color: "var(--muted)", textTransform: "uppercase" }}>{article.readTime}</span>
                    </div>

                    {/* Title */}
                    <h1 style={{ fontFamily: "Playfair Display, serif", fontSize: "clamp(2.8rem, 7vw, 5.5rem)", fontWeight: 300, color: "var(--white)", marginBottom: "24px", letterSpacing: "-.02em", lineHeight: .95 }}>
                        {article.title}
                    </h1>

                    {/* Subtitle */}
                    <p style={{ fontSize: "15px", letterSpacing: ".1em", lineHeight: 2.2, color: "var(--text)", maxWidth: "680px" }}>
                        {article.subtitle}
                    </p>
                </div>
            </div>

            {/* Article body */}
            <div style={{ maxWidth: "860px", margin: "0 auto", padding: "80px 64px" }}>
                {article.content.map((section, i) => (
                    <div key={i} style={{ marginBottom: "56px" }}>
                        {section.heading && (
                            <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: "clamp(1.4rem, 3vw, 2rem)", fontWeight: 300, color: "var(--white)", marginBottom: "24px", letterSpacing: "-.01em", paddingTop: i > 0 ? "8px" : 0, borderTop: i > 0 ? "1px solid var(--dark3)" : "none", paddingLeft: "0" }}>
                                <em style={{ color: "var(--gold)", fontStyle: "italic" }}>{section.heading}</em>
                            </h2>
                        )}

                        <p style={{ fontSize: "15px", letterSpacing: ".08em", lineHeight: 2.6, color: "var(--text)", marginBottom: section.list || section.tip ? "24px" : 0 }}>
                            {section.body}
                        </p>

                        {section.list && (
                            <ul style={{ listStyle: "none", padding: 0, marginBottom: section.tip ? "24px" : 0 }}>
                                {section.list.map((item, j) => (
                                    <li key={j} style={{ display: "flex", gap: "16px", padding: "14px 0", borderBottom: "1px solid var(--dark3)", fontSize: "14px", letterSpacing: ".08em", color: "var(--text)", lineHeight: 1.8 }}>
                                        <span style={{ color: "var(--gold)", flexShrink: 0, marginTop: "2px" }}>—</span>
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        )}

                        {section.tip && (
                            <div style={{ margin: "24px 0 0", padding: "20px 24px", borderLeft: "2px solid var(--gold)", background: "var(--dark2)" }}>
                                <div style={{ fontSize: "14px", letterSpacing: ".12em", color: "var(--gold)", textTransform: "uppercase", marginBottom: "8px" }}>Horological Note</div>
                                <p style={{ fontSize: "14px", letterSpacing: ".06em", lineHeight: 2, color: "var(--text)", fontStyle: "italic" }}>{section.tip}</p>
                            </div>
                        )}
                    </div>
                ))}

                {/* Author note */}
                <div style={{ marginTop: "80px", padding: "40px", border: "1px solid var(--dark3)", background: "var(--dark2)", display: "flex", gap: "24px", alignItems: "flex-start" }}>
                    <div style={{ width: "48px", height: "48px", border: "1px solid var(--gold-dk)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontFamily: "Playfair Display, serif", fontSize: "1.2rem", color: "var(--gold)", fontStyle: "italic" }}>A</div>
                    <div>
                        <div style={{ fontSize: "14px", letterSpacing: ".12em", color: "var(--white)", textTransform: "uppercase", marginBottom: "6px" }}>Onukwuri Kingsley</div>
                        <div style={{ fontSize: "14px", letterSpacing: ".22em", color: "var(--gold-dk)", textTransform: "uppercase", marginBottom: "12px" }}>Master Curator · Founder, Fynekings International</div>
                        <p style={{ fontSize: "14px", letterSpacing: ".06em", lineHeight: 2, color: "var(--muted)" }}>
                            With over two decades of curating experience across Lagos, China, and Dubai, Mr Kingsley founded Fynekings International to bring world-class curating craftsmanship to the African collector.
                        </p>
                    </div>
                </div>

                {/* Prev / Next navigation */}
                <div style={{ marginTop: "60px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    {prevArticle ? (
                        <Link href={`/journal/${prevArticle.slug}`} className="journal-nav-card">
                            <div style={{ fontSize: "14px", letterSpacing: ".12em", color: "var(--muted)", textTransform: "uppercase", marginBottom: "8px" }}>← Previous</div>
                            <div style={{ fontFamily: "Playfair Display, serif", fontSize: "1.1rem", color: "var(--white)" }}>Vol. {prevArticle.vol} · {prevArticle.title}</div>
                        </Link>
                    ) : <div></div>}

                    {nextArticle ? (
                        <Link href={`/journal/${nextArticle.slug}`} className="journal-nav-card" style={{ textAlign: "right" }}>
                            <div style={{ fontSize: "14px", letterSpacing: ".12em", color: "var(--muted)", textTransform: "uppercase", marginBottom: "8px" }}>Next →</div>
                            <div style={{ fontFamily: "Playfair Display, serif", fontSize: "1.1rem", color: "var(--white)" }}>Vol. {nextArticle.vol} · {nextArticle.title}</div>
                        </Link>
                    ) : <div></div>}
                </div>

                {/* Back to journal */}
                <div style={{ marginTop: "40px", textAlign: "center" }}>
                    <Link href="/journal" style={{ fontSize: "14px", letterSpacing: ".12em", color: "var(--gold)", textTransform: "uppercase", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "10px", paddingBottom: "4px", borderBottom: "1px solid var(--gold-dk)" }}>
                        ← Back to Journal
                    </Link>
                </div>
            </div>

            {/* Related watches CTA */}
            <div style={{ borderTop: "1px solid var(--dark3)", background: "var(--dark)", padding: "60px 64px", textAlign: "center" }}>
                <div style={{ maxWidth: "600px", margin: "0 auto" }}>
                    <p style={{ fontSize: "14px", letterSpacing: ".12em", color: "var(--gold-dk)", textTransform: "uppercase", marginBottom: "16px" }}>Apply What You've Learned</p>
                    <h3 style={{ fontFamily: "Playfair Display, serif", fontSize: "2rem", color: "var(--white)", fontWeight: 300, marginBottom: "24px" }}>
                        Explore the <em style={{ fontStyle: "italic", color: "var(--gold)" }}>Collection</em>
                    </h3>
                    <p style={{ fontSize: "14px", letterSpacing: ".08em", lineHeight: 2, color: "var(--text)", marginBottom: "32px" }}>
                        Every Fynekings piece embodies the principles discussed in this article. See them in detail.
                    </p>
                    <Link href="/collection" style={{ display: "inline-flex", alignItems: "center", gap: "12px", padding: "16px 40px", background: "var(--gold)", color: "var(--black)", textDecoration: "none", fontSize: "14px", letterSpacing: ".12em", textTransform: "uppercase", fontWeight: 600, transition: "background .3s" }}>
                        View Collection
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
                    </Link>
                </div>
            </div>
        </div>
    );
}