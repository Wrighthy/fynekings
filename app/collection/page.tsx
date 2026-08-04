"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useCart, fmt } from "@/lib/store";

type Product = {
    id: string;
    name: string;
    slug: string;
    series: string;
    price: number;
    tag: string;
    badge: string | null;
    badgeNew: string | null;
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

const FILTERS = ["All", "Midnight Series", "Gold Edition", "Steel Series", "Rose Gold", "Platinum Series", "Dress Collection", "Sport Collection", "Blue Water Series"];
const SORTS = ["Default", "Price: Low to High", "Price: High to Low", "Name A-Z"];

export default function CollectionPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState("All");
    const [activeSort, setActiveSort] = useState("Default");
    const [search, setSearch] = useState("");
    const addToCart = useCart(s => s.addToCart);

    useEffect(() => {
        fetch("/api/products", { cache: "no-store" })
            .then(r => r.json())
            .then(data => { setProducts(data); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    const filtered = products
        .filter(p => activeFilter === "All" || p.series === activeFilter)
        .filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.series.toLowerCase().includes(search.toLowerCase()))
        .sort((a, b) => {
            if (activeSort === "Price: Low to High") return a.price - b.price;
            if (activeSort === "Price: High to Low") return b.price - a.price;
            if (activeSort === "Name A-Z") return a.name.localeCompare(b.name);
            return 0;
        });

    return (
        <div style={{ background: "var(--black)", minHeight: "100vh", fontFamily: "Raleway, sans-serif" }}>

            {/* Header */}
            <div style={{ background: "var(--dark)", borderBottom: "1px solid var(--dark3)", padding: "140px 64px 60px" }}>
                <div style={{ maxWidth: "1300px", margin: "0 auto" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "24px" }}>
                        <Link href="/" style={{ fontSize: ".52rem", letterSpacing: ".3em", color: "var(--muted)", textDecoration: "none", textTransform: "uppercase" }}>Home</Link>
                        <span style={{ color: "var(--dark4)" }}>→</span>
                        <span style={{ fontSize: ".52rem", letterSpacing: ".3em", color: "var(--gold)", textTransform: "uppercase" }}>Collection</span>
                    </div>
                    <h1 style={{ fontFamily: "Playfair Display, serif", fontSize: "clamp(2.5rem, 6vw, 5rem)", fontWeight: 300, color: "var(--white)", marginBottom: "16px", letterSpacing: "-.02em" }}>
                        The Full <em style={{ fontStyle: "italic", color: "var(--gold)" }}>Collection</em>
                    </h1>
                    <p style={{ fontSize: ".7rem", letterSpacing: ".12em", color: "var(--text)", lineHeight: 2.4, maxWidth: "500px" }}>
                        Every Fynekings timepiece, hand-finished in Lagos. Each piece signed, numbered, and shipped insured worldwide.
                    </p>
                </div>
            </div>

            {/* Filters + Search */}
            <div style={{ borderBottom: "1px solid var(--dark3)", background: "var(--dark2)", position: "sticky", top: 0, zIndex: 100 }}>
                <div style={{ maxWidth: "1300px", margin: "0 auto", padding: "0 64px", display: "flex", gap: "24px", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" }}>
                    {/* Search */}
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "16px 0", borderBottom: "1px solid transparent", flex: "0 0 240px" }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="1.5"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
                        <input
                            type="text"
                            placeholder="Search watches..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            style={{ background: "none", border: "none", outline: "none", color: "var(--white)", fontFamily: "Raleway, sans-serif", fontSize: ".65rem", letterSpacing: ".1em", width: "100%" }}
                        />
                    </div>

                    {/* Series filters */}
                    <div style={{ display: "flex", gap: "0", overflowX: "auto", flex: 1 }}>
                        {["All", "Midnight Series", "Gold Edition", "Steel Series", "Rose Gold", "Platinum Series", "Sport Collection", "Blue Water Series"].map(f => (
                            <button
                                key={f}
                                onClick={() => setActiveFilter(f)}
                                style={{
                                    padding: "20px 20px",
                                    fontSize: ".5rem",
                                    letterSpacing: ".22em",
                                    textTransform: "uppercase",
                                    color: activeFilter === f ? "var(--gold)" : "var(--muted)",
                                    background: "none",
                                    border: "none",
                                    borderBottom: activeFilter === f ? "2px solid var(--gold)" : "2px solid transparent",
                                    cursor: "none",
                                    fontFamily: "Raleway, sans-serif",
                                    whiteSpace: "nowrap",
                                    transition: "all .3s",
                                }}
                            >
                                {f}
                            </button>
                        ))}
                    </div>

                    {/* Sort */}
                    <select
                        value={activeSort}
                        onChange={e => setActiveSort(e.target.value)}
                        style={{ background: "var(--dark3)", border: "1px solid var(--dark4)", color: "var(--text)", fontFamily: "Raleway, sans-serif", fontSize: ".55rem", letterSpacing: ".15em", padding: "10px 14px", outline: "none", cursor: "none" }}
                    >
                        {SORTS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
            </div>

            {/* Results count */}
            <div style={{ maxWidth: "1300px", margin: "0 auto", padding: "32px 64px 0" }}>
                <p style={{ fontSize: ".52rem", letterSpacing: ".3em", color: "var(--muted)", textTransform: "uppercase" }}>
                    {loading ? "Loading..." : `${filtered.length} piece${filtered.length !== 1 ? "s" : ""} found`}
                </p>
            </div>

            {/* Grid */}
            <div style={{ maxWidth: "1300px", margin: "0 auto", padding: "32px 64px 120px" }}>
                {loading ? (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1px", background: "var(--dark3)" }}>
                        {[...Array(8)].map((_, i) => (
                            <div key={i} style={{ background: "var(--dark)", aspectRatio: "1", opacity: 0.4 }}></div>
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "80px 0", color: "var(--muted)", fontSize: ".6rem", letterSpacing: ".3em", textTransform: "uppercase" }}>
                        No watches found matching your search.
                    </div>
                ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1px", background: "var(--dark3)" }}>
                        {filtered.map(p => (
                            <div key={p.id} style={{ background: "var(--dark)", position: "relative", cursor: "none", transition: "background .4s" }}
                                onMouseEnter={e => (e.currentTarget.style.background = "var(--dark2)")}
                                onMouseLeave={e => (e.currentTarget.style.background = "var(--dark)")}>
                                {p.badge && <div className="badge-sold">{p.badge}</div>}
                                {p.badgeNew && <div className="badge-new">{p.badgeNew}</div>}

                                {/* Image / SVG */}
                                <Link href={`/watches/${p.slug}`} style={{ display: "block", textDecoration: "none" }}>
                                    <div style={{ aspectRatio: "1", display: "flex", alignItems: "center", justifyContent: "center", padding: "30px", background: "linear-gradient(135deg, var(--dark2) 0%, var(--dark) 100%)", position: "relative", overflow: "hidden" }}>
                                        {p.images && p.images.length > 0 ? (
                                            <img src={p.images[0]} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0 }} />
                                        ) : (
                                            <svg viewBox="0 0 160 160" width="120" height="120" xmlns="http://www.w3.org/2000/svg">
                                                <rect x="63" y="8" width="34" height="40" rx="6" fill={p.strapColor} stroke={p.strapStroke} strokeWidth=".8" />
                                                <rect x="63" y="112" width="34" height="40" rx="6" fill={p.strapColor} stroke={p.strapStroke} strokeWidth=".8" />
                                                <circle cx="80" cy="80" r="50" fill={p.caseColor} stroke={p.caseStroke} strokeWidth={p.strokeWidth} />
                                                <circle cx="80" cy="80" r="44" fill={p.innerCase} stroke={p.innerStroke} strokeWidth=".5" />
                                                <line x1="80" y1="40" x2="80" y2="48" stroke={p.markerColor} strokeWidth="1.6" />
                                                <line x1="80" y1="112" x2="80" y2="120" stroke={p.markerColor} strokeWidth="1.6" />
                                                <line x1="40" y1="80" x2="48" y2="80" stroke={p.markerColor} strokeWidth="1.6" />
                                                <line x1="112" y1="80" x2="120" y2="80" stroke={p.markerColor} strokeWidth="1.6" />
                                                <text x="80" y="68" textAnchor="middle" fill={p.textColor} fontFamily="Playfair Display,serif" fontSize="6" letterSpacing="2">FYNEKINGS</text>
                                                <line x1="80" y1="80" x2="80" y2="50" stroke={p.handColor} strokeWidth="2" strokeLinecap="round" />
                                                <line x1="80" y1="80" x2="98" y2="70" stroke={p.handColor} strokeWidth="1.6" strokeLinecap="round" />
                                                <line x1="80" y1="80" x2="64" y2="92" stroke={p.secColor} strokeWidth="1" strokeLinecap="round" />
                                                <circle cx="80" cy="80" r="3" fill={p.markerColor} />
                                            </svg>
                                        )}
                                    </div>
                                </Link>

                                {/* Info */}
                                <div style={{ padding: "24px 26px", borderTop: "1px solid var(--dark3)" }}>
                                    <p style={{ fontSize: ".45rem", letterSpacing: ".35em", textTransform: "uppercase", color: "var(--gold-dk)", marginBottom: "8px" }}>{p.tag}</p>
                                    <Link href={`/watches/${p.slug}`} style={{ textDecoration: "none" }}>
                                        <p style={{ fontFamily: "Playfair Display, serif", fontSize: "1.15rem", fontWeight: 400, color: "var(--white)", marginBottom: "4px", letterSpacing: ".01em", transition: "color .3s" }}
                                            onMouseEnter={e => (e.currentTarget.style.color = "var(--gold)")}
                                            onMouseLeave={e => (e.currentTarget.style.color = "var(--white)")}
                                        >{p.name}</p>
                                    </Link>
                                    <p style={{ fontSize: ".55rem", letterSpacing: ".22em", textTransform: "uppercase", color: "var(--muted)", marginBottom: "18px" }}>{p.series}</p>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <p style={{ fontSize: ".85rem", color: "var(--gold)", fontFamily: "Playfair Display, serif" }}>
                                            {fmt(p.price)} <small style={{ fontSize: ".5rem", color: "var(--muted)", fontFamily: "Raleway, sans-serif", letterSpacing: ".15em" }}>+ fees</small>
                                        </p>
                                        <button
                                            onClick={() => addToCart(p.name, p.series, p.price)}
                                            style={{ fontSize: ".48rem", letterSpacing: ".3em", textTransform: "uppercase", color: "var(--muted)", background: "none", border: "none", cursor: "none", fontFamily: "Raleway, sans-serif", transition: "color .3s" }}
                                            onMouseEnter={e => (e.currentTarget.style.color = "var(--gold)")}
                                            onMouseLeave={e => (e.currentTarget.style.color = "var(--muted)")}
                                        >Add →</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}