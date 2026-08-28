"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useCart, fmt } from "@/lib/store";
import { useClockHands } from "@/lib/useClockHands";

type Product = {
    id: string;
    name: string;
    slug: string;
    series: string;
    price: number;
    tag: string;
    badge: string | null;
    badgeNew: string | null;
    description: string | null;
    specs: Record<string, string> | null;
    images: string[];
    strapColor: string;
    strapStroke: string;
    caseColor: string;
    caseStroke: string;
    markerColor: string;
    handColor: string;
    secColor: string;
    textColor: string;
    innerCase: string;
    innerStroke: string;
    strokeWidth: string;
};

function WatchSVG({ p }: { p: Product }) {
    const hands = useClockHands(210, 210);
    return (
        <svg viewBox="0 0 420 420" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
            <defs>
                <radialGradient id="pdg" cx="50%" cy="42%" r="55%">
                    <stop offset="0%" stopColor="#222" />
                    <stop offset="60%" stopColor="#0d0d0d" />
                    <stop offset="100%" stopColor="#040404" />
                </radialGradient>
            </defs>
            <rect x="170" y="20" width="80" height="100" rx="12" fill={p.strapColor} stroke={p.strapStroke} strokeWidth="1" />
            <line x1="186" y1="40" x2="234" y2="40" stroke="#1f1f1f" strokeWidth="1" />
            <line x1="186" y1="56" x2="234" y2="56" stroke="#1f1f1f" strokeWidth="1" />
            <line x1="186" y1="72" x2="234" y2="72" stroke="#1f1f1f" strokeWidth="1" />
            <line x1="186" y1="88" x2="234" y2="88" stroke="#1f1f1f" strokeWidth="1" />
            <path d="M 178 30 L 178 110" stroke="#C4A962" strokeWidth=".5" strokeDasharray="2 3" opacity=".6" />
            <path d="M 242 30 L 242 110" stroke="#C4A962" strokeWidth=".5" strokeDasharray="2 3" opacity=".6" />
            <rect x="170" y="300" width="80" height="100" rx="12" fill={p.strapColor} stroke={p.strapStroke} strokeWidth="1" />
            <line x1="186" y1="318" x2="234" y2="318" stroke="#1f1f1f" strokeWidth="1" />
            <line x1="186" y1="334" x2="234" y2="334" stroke="#1f1f1f" strokeWidth="1" />
            <line x1="186" y1="350" x2="234" y2="350" stroke="#1f1f1f" strokeWidth="1" />
            <line x1="186" y1="366" x2="234" y2="366" stroke="#1f1f1f" strokeWidth="1" />
            <path d="M 178 310 L 178 388" stroke="#C4A962" strokeWidth=".5" strokeDasharray="2 3" opacity=".6" />
            <path d="M 242 310 L 242 388" stroke="#C4A962" strokeWidth=".5" strokeDasharray="2 3" opacity=".6" />
            <rect x="320" y="200" width="22" height="20" rx="4" fill="#1a1a1a" stroke="#C4A962" strokeWidth="1" />
            <circle cx="210" cy="210" r="125" fill="#1a1a1a" stroke={p.caseStroke} strokeWidth="2.5" />
            <circle cx="210" cy="210" r="118" fill="url(#pdg)" stroke="#1e1e1e" strokeWidth=".5" />
            <g stroke={p.caseStroke} strokeWidth="2.5" strokeLinecap="round">
                <line x1="210" y1="98" x2="210" y2="112" />
                <line x1="210" y1="308" x2="210" y2="322" />
                <line x1="98" y1="210" x2="112" y2="210" />
                <line x1="308" y1="210" x2="322" y2="210" />
            </g>
            <text x="210" y="170" textAnchor="middle" fill="#C4A962" fontFamily="Playfair Display,serif" fontSize="13" letterSpacing="4" fontStyle="italic">Fynekings</text>
            <text x="210" y="185" textAnchor="middle" fill="#5A5550" fontFamily="Raleway,sans-serif" fontSize="6" letterSpacing="3">INTERNATIONAL · LAGOS</text>
            <circle cx="210" cy="252" r="22" fill="none" stroke="#3a3a3a" strokeWidth=".8" />
            <text x="210" y="251" textAnchor="middle" fill="#5A5550" fontFamily="Raleway,sans-serif" fontSize="5" letterSpacing="2">AUTOMATIC</text>
            <text x="210" y="261" textAnchor="middle" fill="#7A6535" fontFamily="Raleway,sans-serif" fontSize="4" letterSpacing="2">25 JEWELS</text>
            <line x1="210" y1="210" x2={hands.hr.x} y2={hands.hr.y} stroke="#F4EFE4" strokeWidth="4.5" strokeLinecap="round" />
            <line x1="210" y1="210" x2={hands.min.x} y2={hands.min.y} stroke="#F4EFE4" strokeWidth="3.5" strokeLinecap="round" />
            <line x1="210" y1="210" x2={hands.sec.x} y2={hands.sec.y} stroke="#C4A962" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="210" cy="210" r="6.5" fill="#C4A962" />
            <circle cx="210" cy="210" r="2.5" fill="#080808" />
        </svg>
    );
}

export default function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeImage, setActiveImage] = useState(0);
    const [zoomed, setZoomed] = useState(false);
    const [related, setRelated] = useState<Product[]>([]);
    const addToCart = useCart(s => s.addToCart);
    const [isPaused, setIsPaused] = useState(false);

    useEffect(() => {
        fetch(`/api/products/${slug}`)
            .then(r => {
                if (!r.ok) return null;
                return r.json();
            })
            .then(data => {
                if (data && !data.error && data.id) {
                    setProduct(data);
                } else {
                    setProduct(null);
                }
                setLoading(false);
            })
            .catch(() => {
                setProduct(null);
                setLoading(false);
            });

        fetch("/api/products")
            .then(r => r.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setRelated(data.filter((p: Product) => p.slug !== slug).slice(0, 4));
                }
            })
            .catch(() => { });
    }, [slug]);
    useEffect(() => {
        if (!product) return;
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "ArrowLeft") setActiveImage(i => (i - 1 + product.images.length) % product.images.length);
            if (e.key === "ArrowRight") setActiveImage(i => (i + 1) % product.images.length);
            if (e.key === "Escape") setZoomed(false);
        };
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [product, zoomed]);
    useEffect(() => {
        if (!product || product.images.length <= 1 || isPaused) return;
        const interval = setInterval(() => {
            setActiveImage(i => (i + 1) % product.images.length);
        }, 4000);
        return () => clearInterval(interval);
    }, [product, isPaused]);

    if (loading) return (
        <div style={{ background: "var(--black)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ fontFamily: "Playfair Display, serif", fontSize: "1.4rem", color: "var(--gold)", fontStyle: "italic" }}>Loading...</div>
        </div>
    );

    if (!product) return (
        <div style={{ background: "var(--black)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "24px" }}>
            <p style={{ fontFamily: "Playfair Display, serif", fontSize: "1.4rem", color: "var(--white)" }}>Watch not found</p>
            <Link href="/collection" style={{ fontSize: ".55rem", letterSpacing: ".3em", color: "var(--gold)", textTransform: "uppercase", textDecoration: "none" }}>← Back to Collection</Link>
        </div>
    );

    return (
        <div style={{ background: "var(--black)", minHeight: "100vh", fontFamily: "Raleway, sans-serif" }}>

            {/* Breadcrumb */}
            <div style={{ padding: "100px 24px 0" }}>
                <div style={{ maxWidth: "1300px", margin: "0 auto", display: "flex", alignItems: "center", gap: "14px", marginBottom: "48px" }}>
                    <Link href="/" style={{ fontSize: ".52rem", letterSpacing: ".3em", color: "var(--muted)", textDecoration: "none", textTransform: "uppercase" }}>Home</Link>
                    <span style={{ color: "var(--dark4)" }}>→</span>
                    <Link href="/collection" style={{ fontSize: ".52rem", letterSpacing: ".3em", color: "var(--muted)", textDecoration: "none", textTransform: "uppercase" }}>Collection</Link>
                    <span style={{ color: "var(--dark4)" }}>→</span>
                    <span style={{ fontSize: ".52rem", letterSpacing: ".3em", color: "var(--gold)", textTransform: "uppercase" }}>{product.name}</span>
                </div>
            </div>

            {/* Main product section */}
            <div style={{ maxWidth: "1300px", margin: "0 auto", padding: "0 24px 100px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 400px), 1fr))", gap: "40px", alignItems: "start" }} className="product-grid">

                {/* Left — Image gallery */}
                {/* Left — Image gallery */}
                <div className="product-image-col">

                    {/* Main image viewer */}
                    <div
                        style={{ height: "min(520px, 70vw)", background: "var(--dark2)", border: "1px solid var(--dark3)", position: "relative", overflow: "hidden", marginBottom: "12px", cursor: "zoom-in" }}
                        onClick={() => setZoomed(true)}
                        onMouseEnter={() => setIsPaused(true)}
                        onMouseLeave={() => setIsPaused(false)}
                    >
                        {product.images && product.images.length > 0 ? (
                            <img
                                key={activeImage}
                                src={product.images[activeImage]}
                                alt={`${product.name} — view ${activeImage + 1}`}
                                style={{ width: "100%", height: "100%", objectFit: "contain", objectPosition: "center", animation: "fadeIn .35s ease" }}
                            />
                        ) : (
                            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <WatchSVG p={product} />
                            </div>
                        )}

                        {/* Corner brackets */}
                        <div style={{ position: "absolute", top: "16px", left: "16px", width: "20px", height: "20px", borderTop: "1px solid var(--gold-dk)", borderLeft: "1px solid var(--gold-dk)", pointerEvents: "none" }}></div>
                        <div style={{ position: "absolute", top: "16px", right: "16px", width: "20px", height: "20px", borderTop: "1px solid var(--gold-dk)", borderRight: "1px solid var(--gold-dk)", pointerEvents: "none" }}></div>
                        <div style={{ position: "absolute", bottom: "16px", left: "16px", width: "20px", height: "20px", borderBottom: "1px solid var(--gold-dk)", borderLeft: "1px solid var(--gold-dk)", pointerEvents: "none" }}></div>
                        <div style={{ position: "absolute", bottom: "16px", right: "16px", width: "20px", height: "20px", borderBottom: "1px solid var(--gold-dk)", borderRight: "1px solid var(--gold-dk)", pointerEvents: "none" }}></div>

                        {/* Image counter */}
                        {product.images && product.images.length > 1 && (
                            <div style={{ position: "absolute", bottom: "16px", left: "50%", transform: "translateX(-50%)", background: "rgba(0,0,0,.6)", backdropFilter: "blur(4px)", padding: "6px 14px", fontSize: ".45rem", letterSpacing: ".25em", color: "var(--gold)", textTransform: "uppercase" }}>
                                {activeImage + 1} / {product.images.length}
                            </div>
                        )}

                        {/* Ref number */}
                        <div style={{ position: "absolute", top: "16px", left: "50%", transform: "translateX(-50%)", fontSize: ".42rem", letterSpacing: ".28em", color: "var(--gold-dk)", textTransform: "uppercase", pointerEvents: "none" }}>
                            REF. FYN-{slug.toUpperCase().replace(/-/g, "")}
                        </div>

                        {/* Prev / Next arrows */}
                        {product.images && product.images.length > 1 && (
                            <>
                                <button
                                    onClick={e => { e.stopPropagation(); setActiveImage(i => (i - 1 + product.images.length) % product.images.length); }}
                                    style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", background: "rgba(0,0,0,.5)", border: "1px solid var(--gold-dk)", color: "var(--gold)", width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", backdropFilter: "blur(4px)", transition: "all .3s" }}
                                    onMouseEnter={e => { e.currentTarget.style.background = "var(--gold)"; e.currentTarget.style.color = "var(--black)"; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = "rgba(0,0,0,.5)"; e.currentTarget.style.color = "var(--gold)"; }}
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
                                </button>
                                <button
                                    onClick={e => { e.stopPropagation(); setActiveImage(i => (i + 1) % product.images.length); }}
                                    style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "rgba(0,0,0,.5)", border: "1px solid var(--gold-dk)", color: "var(--gold)", width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", backdropFilter: "blur(4px)", transition: "all .3s" }}
                                    onMouseEnter={e => { e.currentTarget.style.background = "var(--gold)"; e.currentTarget.style.color = "var(--black)"; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = "rgba(0,0,0,.5)"; e.currentTarget.style.color = "var(--gold)"; }}
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
                                </button>
                            </>
                        )}
                    </div>

                    {/* Thumbnail strip */}
                    {product.images && product.images.length > 1 && (
                        <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "4px", marginBottom: "8px", WebkitOverflowScrolling: "touch" }}>
                            {product.images.map((img, i) => (
                                <button
                                    key={i}
                                    onClick={() => setActiveImage(i)}
                                    style={{
                                        flexShrink: 0,
                                        width: "clamp(48px, 12vw, 64px)",
                                        height: "clamp(60px, 15vw, 80px)",
                                        border: i === activeImage ? "1px solid var(--gold)" : "1px solid var(--dark3)",
                                        background: "var(--dark2)",
                                        padding: 0,
                                        cursor: "pointer",
                                        overflow: "hidden",
                                        transition: "border-color .3s, opacity .3s",
                                        opacity: i === activeImage ? 1 : 0.6,
                                    }}
                                    onMouseEnter={e => (e.currentTarget.style.opacity = "1")}
                                    onMouseLeave={e => (e.currentTarget.style.opacity = i === activeImage ? "1" : "0.6")}
                                >
                                    <img src={img} alt={`${product.name} view ${i + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Fullscreen zoom overlay */}
                {zoomed && (
                    <div
                        onClick={() => setZoomed(false)}
                        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.95)", zIndex: 9000, display: "flex", alignItems: "center", justifyContent: "center", cursor: "zoom-out" }}
                    >
                        <img
                            src={product.images[activeImage]}
                            alt={product.name}
                            style={{ maxWidth: "90vw", maxHeight: "90vh", objectFit: "contain" }}
                        />
                        <button
                            onClick={() => setZoomed(false)}
                            style={{ position: "absolute", top: "24px", right: "24px", background: "none", border: "1px solid var(--gold-dk)", color: "var(--gold)", width: "40px", height: "40px", fontSize: "1rem", cursor: "pointer" }}
                        >✕</button>
                        <div style={{ position: "absolute", bottom: "24px", left: "50%", transform: "translateX(-50%)", fontSize: ".45rem", letterSpacing: ".3em", color: "var(--gold-dk)", textTransform: "uppercase" }}>
                            Click anywhere to close
                        </div>
                    </div>
                )}

                {/* Right — Product info */}
                <div style={{ paddingTop: "16px" }}>
                    {(product.badge || product.badgeNew) && (
                        <div style={{ display: "inline-block", padding: "5px 14px", background: product.badge ? "var(--gold)" : "transparent", border: product.badgeNew ? "1px solid var(--gold)" : "none", color: product.badge ? "var(--black)" : "var(--gold)", fontSize: ".45rem", letterSpacing: ".25em", textTransform: "uppercase", fontWeight: 600, marginBottom: "20px" }}>
                            {product.badge || product.badgeNew}
                        </div>
                    )}
                    <div style={{ fontSize: ".52rem", letterSpacing: ".4em", color: "var(--gold-dk)", textTransform: "uppercase", marginBottom: "12px" }}>{product.series}</div>
                    <h1 style={{ fontFamily: "Playfair Display, serif", fontSize: "clamp(2.5rem, 5vw, 4rem)", fontWeight: 300, color: "var(--white)", marginBottom: "8px", letterSpacing: "-.02em", lineHeight: 1 }}>
                        {product.name}
                    </h1>
                    <p style={{ fontSize: ".6rem", letterSpacing: ".2em", color: "var(--muted)", textTransform: "uppercase", marginBottom: "32px" }}>{product.tag}</p>
                    <div style={{ width: "48px", height: "1px", background: "linear-gradient(to right, var(--gold), transparent)", marginBottom: "32px" }}></div>
                    <p style={{ fontSize: ".7rem", letterSpacing: ".1em", lineHeight: 2.4, color: "var(--text)", marginBottom: "40px" }}>
                        {product.description || "A masterpiece of horological craft, hand-finished in our Victoria Island gallery."}
                    </p>

                    {/* Price */}
                    <div style={{ marginBottom: "32px", paddingBottom: "32px", borderBottom: "1px solid var(--dark3)" }}>
                        <div style={{ fontSize: ".5rem", letterSpacing: ".3em", color: "var(--gold-dk)", textTransform: "uppercase", marginBottom: "8px" }}>Price</div>
                        <div style={{ fontFamily: "Playfair Display, serif", fontSize: "2.8rem", color: "var(--white)", fontWeight: 300, letterSpacing: "-.02em" }}>
                            {fmt(product.price)}
                        </div>
                        <div style={{ fontSize: ".5rem", letterSpacing: ".2em", color: "var(--muted)", marginTop: "6px", textTransform: "uppercase" }}>
                            + {fmt(Math.min(Math.round(product.price * 0.015 + 100), 2000))} Paystack fee
                        </div>
                    </div>

                    {/* Buttons */}
                    <button onClick={() => addToCart(product.name, product.series, product.price)}
                        style={{ width: "100%", padding: "20px", background: "var(--gold)", color: "var(--black)", border: "none", fontSize: ".6rem", letterSpacing: ".32em", textTransform: "uppercase", fontWeight: 600, fontFamily: "Raleway, sans-serif", cursor: "pointer", marginBottom: "16px", transition: "background .3s", display: "flex", alignItems: "center", justifyContent: "center", gap: "14px" }}
                        onMouseEnter={e => (e.currentTarget.style.background = "var(--gold-lt)")}
                        onMouseLeave={e => (e.currentTarget.style.background = "var(--gold)")}>
                        Add to Cart
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
                    </button>

                    {/* Specs */}
                    {product.specs && (
                        <div style={{ marginTop: "48px" }}>
                            <div style={{ fontSize: ".55rem", letterSpacing: ".35em", color: "var(--gold)", textTransform: "uppercase", marginBottom: "24px" }}>Specifications</div>
                            <div>
                                {Object.entries(product.specs).map(([key, value]) => (
                                    <div key={key} style={{ display: "flex", justifyContent: "space-between", padding: "14px 0", borderBottom: "1px solid var(--dark3)" }}>
                                        <span style={{ fontSize: ".55rem", letterSpacing: ".18em", color: "var(--muted)", textTransform: "uppercase" }}>{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                        <span style={{ fontSize: ".6rem", letterSpacing: ".1em", color: "var(--white)", textAlign: "right", maxWidth: "60%" }}>{value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Guarantees */}
                    <div style={{ marginTop: "40px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                        {[
                            { icon: "🛡", title: "5-Year Warranty", sub: "International coverage" },
                            { icon: "✈", title: "Free Shipping", sub: "Insured worldwide" },
                            { icon: "🔐", title: "Authenticated", sub: "Signed & numbered" },
                            { icon: "↩", title: "30-Day Returns", sub: "No questions asked" },
                        ].map(g => (
                            <div key={g.title} style={{ padding: "16px", border: "1px solid var(--dark3)", background: "var(--dark2)" }}>
                                <div style={{ fontSize: "1.2rem", marginBottom: "6px" }}>{g.icon}</div>
                                <div style={{ fontSize: ".55rem", letterSpacing: ".15em", color: "var(--white)", textTransform: "uppercase", marginBottom: "4px" }}>{g.title}</div>
                                <div style={{ fontSize: ".5rem", letterSpacing: ".12em", color: "var(--muted)", textTransform: "uppercase" }}>{g.sub}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Related watches */}
            {related.length > 0 && (
                <div style={{ borderTop: "1px solid var(--dark3)", background: "var(--dark)", padding: "80px 24px" }} className="related-section">
                    <div style={{ maxWidth: "1300px", margin: "0 auto" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "48px" }}>
                            <span style={{ width: "24px", height: "1px", background: "var(--gold-dk)", display: "inline-block" }}></span>
                            <span style={{ fontSize: ".52rem", letterSpacing: ".4em", color: "var(--gold-dk)", textTransform: "uppercase" }}>You May Also Like</span>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 250px), 1fr))", gap: "1px", background: "var(--dark3)" }} className="related-grid">
                            {related.map(p => (
                                <Link key={p.id} href={`/watches/${p.slug}`} style={{ textDecoration: "none", background: "var(--dark)", display: "block" }}
                                    onMouseEnter={e => (e.currentTarget.style.background = "var(--dark2)")}
                                    onMouseLeave={e => (e.currentTarget.style.background = "var(--dark)")}>
                                    <div style={{ aspectRatio: "1", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", background: "linear-gradient(135deg, var(--dark2) 0%, var(--dark) 100%)", position: "relative", overflow: "hidden" }}>
                                        {p.images && p.images.length > 0 ? (
                                            <img src={p.images[0]} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0 }} />
                                        ) : (
                                            <svg viewBox="0 0 160 160" width="100" height="100" xmlns="http://www.w3.org/2000/svg">
                                                <rect x="63" y="8" width="34" height="40" rx="6" fill={p.strapColor} stroke={p.strapStroke} strokeWidth=".8" />
                                                <rect x="63" y="112" width="34" height="40" rx="6" fill={p.strapColor} stroke={p.strapStroke} strokeWidth=".8" />
                                                <circle cx="80" cy="80" r="50" fill={p.caseColor} stroke={p.caseStroke} strokeWidth={p.strokeWidth} />
                                                <circle cx="80" cy="80" r="44" fill={p.innerCase} stroke={p.innerStroke} strokeWidth=".5" />
                                                <line x1="80" y1="80" x2="80" y2="50" stroke={p.handColor} strokeWidth="2" strokeLinecap="round" />
                                                <line x1="80" y1="80" x2="98" y2="70" stroke={p.handColor} strokeWidth="1.6" strokeLinecap="round" />
                                                <circle cx="80" cy="80" r="3" fill={p.markerColor} />
                                            </svg>
                                        )}
                                    </div>
                                    <div style={{ padding: "20px 22px", borderTop: "1px solid var(--dark3)" }}>
                                        <p style={{ fontFamily: "Playfair Display, serif", fontSize: "1rem", color: "var(--white)", marginBottom: "4px" }}>{p.name}</p>
                                        <p style={{ fontSize: ".7rem", color: "var(--gold)", fontFamily: "Playfair Display, serif" }}>{fmt(p.price)}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}