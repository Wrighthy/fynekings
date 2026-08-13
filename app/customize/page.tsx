"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useCart, fmt, BASE_PRICE } from "@/lib/store";
import { useCustomizer } from "@/lib/store";

type Product = {
    id: string;
    name: string;
    slug: string;
    series: string;
    price: number;
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

const STRAPS = [
    { color: "#141414", name: "Midnight Black", extra: 0 },
    { color: "#3D2B1F", name: "Cognac Brown", extra: 15000, premium: true },
    { color: "#1a1a3a", name: "Navy Blue", extra: 15000, premium: true },
    { color: "#2a1515", name: "Oxblood", extra: 15000, premium: true },
    { color: "#C4A962", name: "Gold Croc", extra: 35000, premium: true },
    { color: "#E8E4DC", name: "Ivory White", extra: 20000, premium: true },
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

export default function CustomizePage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [step, setStep] = useState<"pick" | "configure" | "submit">("pick");
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [customerName, setCustomerName] = useState("");
    const [customerEmail, setCustomerEmail] = useState("");
    const [customerPhone, setCustomerPhone] = useState("");
    const [notes, setNotes] = useState("");

    const c = useCustomizer();
    const { addCustomToCart, showToast } = useCart();
    const cfgExtra = c.strapExtra + c.caseExtra + c.dialExtra;
    const totalPrice = (selectedProduct?.price || BASE_PRICE) + cfgExtra;

    useEffect(() => {
        fetch("/api/products", { cache: "no-store" })
            .then(r => r.json())
            .then(setProducts);
    }, []);

    const handleSubmit = async () => {
        if (!selectedProduct) return;
        setSubmitting(true);
        try {
            const res = await fetch("/api/customizations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    baseWatchId: selectedProduct.id,
                    baseWatchName: selectedProduct.name,
                    strapName: c.strapName,
                    caseName: c.caseName,
                    dialName: c.dialName,
                    strapExtra: c.strapExtra,
                    caseExtra: c.caseExtra,
                    dialExtra: c.dialExtra,
                    totalPrice,
                    customerName,
                    customerEmail,
                    customerPhone,
                    notes,
                }),
            });

            if (res.ok) {
                // Add to cart
                addCustomToCart(
                    { strapName: c.strapName, caseName: c.caseName, dialName: c.dialName },
                    cfgExtra + ((selectedProduct?.price || BASE_PRICE) - BASE_PRICE)
                );
                setSubmitted(true);
                showToast("Configuration submitted successfully!");
            }
        } catch {
            showToast("Something went wrong. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    // Success screen
    if (submitted) return (
        <div style={{ background: "var(--black)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "24px", padding: "40px", textAlign: "center" }}>
            <div style={{ width: "64px", height: "64px", border: "1px solid var(--gold)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem" }}>✓</div>
            <h1 style={{ fontFamily: "Playfair Display, serif", fontSize: "2.5rem", color: "var(--white)", fontWeight: 300 }}>Configuration Submitted</h1>
            <p style={{ fontSize: ".7rem", letterSpacing: ".12em", color: "var(--text)", lineHeight: 2, maxWidth: "480px" }}>
                Your custom watch configuration has been saved and emailed to our atelier team. We&apos;ll be in touch within 24 hours to confirm your order.
            </p>
            <div style={{ display: "flex", gap: "16px", marginTop: "16px" }}>
                <Link href="/collection" style={{ padding: "16px 32px", background: "var(--gold)", color: "var(--black)", textDecoration: "none", fontSize: ".55rem", letterSpacing: ".3em", textTransform: "uppercase", fontWeight: 600 }}>
                    Back to Collection
                </Link>
                <button onClick={() => { setSubmitted(false); setStep("pick"); setSelectedProduct(null); }}
                    style={{ padding: "16px 32px", background: "transparent", color: "var(--gold)", border: "1px solid var(--gold-dk)", fontSize: ".55rem", letterSpacing: ".3em", textTransform: "uppercase", cursor: "none", fontFamily: "Raleway, sans-serif" }}>
                    Configure Another
                </button>
            </div>
        </div>
    );

    return (
        <div style={{ background: "var(--black)", minHeight: "100vh", fontFamily: "Raleway, sans-serif" }}>

            {/* Header */}
            <div style={{ background: "var(--dark)", borderBottom: "1px solid var(--dark3)", padding: "100px 64px 40px" }}>
                <div style={{ maxWidth: "1300px", margin: "0 auto" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "24px" }}>
                        <Link href="/" style={{ fontSize: ".52rem", letterSpacing: ".3em", color: "var(--muted)", textDecoration: "none", textTransform: "uppercase" }}>Home</Link>
                        <span style={{ color: "var(--dark4)" }}>→</span>
                        <span style={{ fontSize: ".52rem", letterSpacing: ".3em", color: "var(--gold)", textTransform: "uppercase" }}>Customize</span>
                    </div>
                    <h1 style={{ fontFamily: "Playfair Display, serif", fontSize: "clamp(2.5rem, 6vw, 5rem)", fontWeight: 300, color: "var(--white)", marginBottom: "16px" }}>
                        Build Your <em style={{ fontStyle: "italic", color: "var(--gold)" }}>Watch</em>
                    </h1>
                    <p style={{ fontSize: ".7rem", letterSpacing: ".12em", color: "var(--text)", lineHeight: 2.4, maxWidth: "500px" }}>
                        Choose a base model, then configure every detail. Your configuration is saved and sent to our atelier team.
                    </p>

                    {/* Step indicator */}
                    <div style={{ display: "flex", gap: "0", marginTop: "40px" }}>
                        {[
                            { num: "01", label: "Choose Base", key: "pick" },
                            { num: "02", label: "Configure", key: "configure" },
                            { num: "03", label: "Submit", key: "submit" },
                        ].map((s, i) => (
                            <div key={s.key} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                    <div style={{ width: "28px", height: "28px", border: `1px solid ${step === s.key ? "var(--gold)" : "var(--dark4)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: ".45rem", color: step === s.key ? "var(--gold)" : "var(--muted)", letterSpacing: ".2em" }}>{s.num}</div>
                                    <span style={{ fontSize: ".52rem", letterSpacing: ".25em", textTransform: "uppercase", color: step === s.key ? "var(--gold)" : "var(--muted)" }}>{s.label}</span>
                                </div>
                                {i < 2 && <div style={{ width: "40px", height: "1px", background: "var(--dark4)", margin: "0 12px" }}></div>}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div style={{ maxWidth: "1300px", margin: "0 auto", padding: "60px 64px" }}>

                {/* STEP 1 — Pick base watch */}
                {step === "pick" && (
                    <div>
                        <p style={{ fontSize: ".55rem", letterSpacing: ".35em", color: "var(--gold-dk)", textTransform: "uppercase", marginBottom: "40px" }}>Select your base model</p>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "1px", background: "var(--dark3)" }}>
                            {products.map(p => (
                                <div
                                    key={p.id}
                                    onClick={() => { setSelectedProduct(p); setStep("configure"); }}
                                    style={{ background: "var(--dark)", cursor: "none", transition: "background .3s", position: "relative" }}
                                    onMouseEnter={e => (e.currentTarget.style.background = "var(--dark2)")}
                                    onMouseLeave={e => (e.currentTarget.style.background = "var(--dark)")}
                                >
                                    <div style={{ aspectRatio: "1", overflow: "hidden", position: "relative" }}>
                                        {p.images && p.images.length > 0 ? (
                                            <img src={p.images[0]} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                        ) : (
                                            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--dark2)", padding: "30px" }}>
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
                                            </div>
                                        )}
                                        <div style={{ position: "absolute", inset: 0, background: "rgba(196,169,98,.08)", opacity: 0, transition: "opacity .3s", display: "flex", alignItems: "center", justifyContent: "center" }}
                                            onMouseEnter={e => (e.currentTarget.style.opacity = "1")}
                                            onMouseLeave={e => (e.currentTarget.style.opacity = "0")}>
                                            <span style={{ fontSize: ".52rem", letterSpacing: ".3em", color: "var(--gold)", textTransform: "uppercase", background: "var(--black)", padding: "10px 20px", border: "1px solid var(--gold)" }}>Select This</span>
                                        </div>
                                    </div>
                                    <div style={{ padding: "20px 24px", borderTop: "1px solid var(--dark3)" }}>
                                        <p style={{ fontFamily: "Playfair Display, serif", fontSize: "1.1rem", color: "var(--white)", marginBottom: "4px" }}>{p.name}</p>
                                        <p style={{ fontSize: ".52rem", letterSpacing: ".2em", color: "var(--muted)", textTransform: "uppercase", marginBottom: "8px" }}>{p.series}</p>
                                        <p style={{ fontSize: ".75rem", color: "var(--gold)", fontFamily: "Playfair Display, serif" }}>from {fmt(p.price)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* STEP 2 — Configure */}
                {step === "configure" && selectedProduct && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "80px", alignItems: "start" }}>

                        {/* Left — Watch preview */}
                        <div style={{ position: "sticky", top: "100px" }}>
                            <div style={{ aspectRatio: "1", background: "var(--dark2)", border: "1px solid var(--dark3)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden", marginBottom: "16px" }}>
                                {selectedProduct.images && selectedProduct.images.length > 0 ? (
                                    <img src={selectedProduct.images[0]} alt={selectedProduct.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                ) : (
                                    <svg viewBox="0 0 420 420" xmlns="http://www.w3.org/2000/svg" style={{ width: "80%", height: "80%" }}>
                                        <defs>
                                            <radialGradient id="cfg" cx="50%" cy="42%" r="55%">
                                                <stop offset="0%" stopColor="#222" />
                                                <stop offset="100%" stopColor="#040404" />
                                            </radialGradient>
                                        </defs>
                                        <rect x="170" y="20" width="80" height="100" rx="12" fill={c.strapColor} stroke="#2a2a2a" strokeWidth="1" />
                                        <rect x="170" y="300" width="80" height="100" rx="12" fill={c.strapColor} stroke="#2a2a2a" strokeWidth="1" />
                                        <circle cx="210" cy="210" r="125" fill="#1a1a1a" stroke={c.caseStroke} strokeWidth="2.5" />
                                        <circle cx="210" cy="210" r="118" fill="url(#cfg)" stroke="#1e1e1e" strokeWidth=".5" />
                                        <g stroke={c.caseStroke} strokeWidth="2.5" strokeLinecap="round">
                                            <line x1="210" y1="98" x2="210" y2="112" />
                                            <line x1="210" y1="308" x2="210" y2="322" />
                                            <line x1="98" y1="210" x2="112" y2="210" />
                                            <line x1="308" y1="210" x2="322" y2="210" />
                                        </g>
                                        <text x="210" y="170" textAnchor="middle" fill="#C4A962" fontFamily="Playfair Display,serif" fontSize="13" letterSpacing="4" fontStyle="italic">Fynekings</text>
                                        <circle cx="210" cy="210" r="6.5" fill="#C4A962" />
                                        <circle cx="210" cy="210" r="2.5" fill="#080808" />
                                    </svg>
                                )}
                                <div style={{ position: "absolute", top: "16px", left: "16px", width: "20px", height: "20px", borderTop: "1px solid var(--gold-dk)", borderLeft: "1px solid var(--gold-dk)" }}></div>
                                <div style={{ position: "absolute", top: "16px", right: "16px", width: "20px", height: "20px", borderTop: "1px solid var(--gold-dk)", borderRight: "1px solid var(--gold-dk)" }}></div>
                                <div style={{ position: "absolute", bottom: "16px", left: "16px", width: "20px", height: "20px", borderBottom: "1px solid var(--gold-dk)", borderLeft: "1px solid var(--gold-dk)" }}></div>
                                <div style={{ position: "absolute", bottom: "16px", right: "16px", width: "20px", height: "20px", borderBottom: "1px solid var(--gold-dk)", borderRight: "1px solid var(--gold-dk)" }}></div>
                                <div style={{ position: "absolute", bottom: "16px", left: "50%", transform: "translateX(-50%)", fontSize: ".42rem", letterSpacing: ".28em", color: "var(--gold-dk)", textTransform: "uppercase" }}>
                                    BASE · {selectedProduct.name.toUpperCase()}
                                </div>
                            </div>

                            {/* Config summary card */}
                            <div style={{ background: "var(--dark2)", border: "1px solid var(--dark3)", padding: "24px" }}>
                                <div style={{ fontSize: ".5rem", letterSpacing: ".35em", color: "var(--gold-dk)", textTransform: "uppercase", marginBottom: "16px" }}>Your Configuration</div>
                                {[
                                    { k: "Base", v: selectedProduct.name },
                                    { k: "Strap", v: c.strapName },
                                    { k: "Case", v: c.caseName },
                                    { k: "Dial", v: c.dialName },
                                ].map(row => (
                                    <div key={row.k} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--dark3)" }}>
                                        <span style={{ fontSize: ".52rem", letterSpacing: ".18em", color: "var(--muted)", textTransform: "uppercase" }}>{row.k}</span>
                                        <span style={{ fontSize: ".6rem", color: "var(--white)" }}>{row.v}</span>
                                    </div>
                                ))}
                                <div style={{ display: "flex", justifyContent: "space-between", padding: "16px 0 0" }}>
                                    <span style={{ fontSize: ".52rem", letterSpacing: ".18em", color: "var(--gold)", textTransform: "uppercase" }}>Total</span>
                                    <span style={{ fontFamily: "Playfair Display, serif", fontSize: "1.1rem", color: "var(--gold)" }}>{fmt(totalPrice)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Right — Options */}
                        <div>
                            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "40px" }}>
                                <button onClick={() => setStep("pick")} style={{ background: "none", border: "none", color: "var(--muted)", fontSize: ".52rem", letterSpacing: ".25em", textTransform: "uppercase", cursor: "none", fontFamily: "Raleway, sans-serif", display: "flex", alignItems: "center", gap: "8px" }}>
                                    ← Change Base
                                </button>
                                <span style={{ color: "var(--dark4)" }}>·</span>
                                <span style={{ fontSize: ".52rem", letterSpacing: ".25em", color: "var(--gold)", textTransform: "uppercase" }}>{selectedProduct.name}</span>
                            </div>

                            {/* Strap */}
                            <div style={{ marginBottom: "36px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
                                    <span style={{ fontSize: ".55rem", letterSpacing: ".35em", color: "var(--gold)", textTransform: "uppercase" }}>① Strap Colour</span>
                                    <span style={{ fontSize: ".5rem", color: "var(--muted)" }}>{c.strapName}</span>
                                </div>
                                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                                    {STRAPS.map(s => (
                                        <button key={s.name} onClick={() => c.setStrap(s.color, s.name, s.extra)}
                                            title={s.name + (s.extra ? ` +${fmt(s.extra)}` : "")}
                                            style={{ width: "38px", height: "38px", borderRadius: "50%", background: s.color, border: c.strapColor === s.color ? "3px solid var(--gold)" : "1px solid var(--dark4)", cursor: "none", position: "relative", transition: "all .3s", outline: c.strapColor === s.color ? "2px solid rgba(196,169,98,.3)" : "none", outlineOffset: "3px" }}>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Case */}
                            <div style={{ marginBottom: "36px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
                                    <span style={{ fontSize: ".55rem", letterSpacing: ".35em", color: "var(--gold)", textTransform: "uppercase" }}>② Case Finish</span>
                                    <span style={{ fontSize: ".5rem", color: "var(--muted)" }}>{c.caseName}</span>
                                </div>
                                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                                    {CASES.map(cs => (
                                        <button key={cs.name} onClick={() => c.setCase(cs.name, cs.stroke, cs.extra)}
                                            style={{ padding: "12px 20px", border: c.caseName === cs.name ? "1px solid var(--gold)" : "1px solid var(--dark4)", color: c.caseName === cs.name ? "var(--gold)" : "var(--muted)", background: c.caseName === cs.name ? "var(--gold-dim)" : "transparent", cursor: "none", fontSize: ".55rem", letterSpacing: ".22em", textTransform: "uppercase", fontFamily: "Raleway, sans-serif", transition: "all .3s" }}>
                                            {cs.name} {cs.extra > 0 && <small style={{ color: "var(--gold-dk)", fontSize: ".45rem" }}>+{cs.extra / 1000}k</small>}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Dial */}
                            <div style={{ marginBottom: "48px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
                                    <span style={{ fontSize: ".55rem", letterSpacing: ".35em", color: "var(--gold)", textTransform: "uppercase" }}>③ Dial Style</span>
                                    <span style={{ fontSize: ".5rem", color: "var(--muted)" }}>{c.dialName}</span>
                                </div>
                                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                                    {DIALS.map(d => (
                                        <button key={d.name} onClick={() => c.setDial(d.name, d.extra)}
                                            style={{ padding: "12px 20px", border: c.dialName === d.name ? "1px solid var(--gold)" : "1px solid var(--dark4)", color: c.dialName === d.name ? "var(--gold)" : "var(--muted)", background: c.dialName === d.name ? "var(--gold-dim)" : "transparent", cursor: "none", fontSize: ".55rem", letterSpacing: ".22em", textTransform: "uppercase", fontFamily: "Raleway, sans-serif", transition: "all .3s" }}>
                                            {d.name} {d.extra > 0 && <small style={{ color: "var(--gold-dk)", fontSize: ".45rem" }}>+{d.extra / 1000}k</small>}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button onClick={() => setStep("submit")}
                                style={{ width: "100%", padding: "20px", background: "var(--gold)", color: "var(--black)", border: "none", fontSize: ".6rem", letterSpacing: ".32em", textTransform: "uppercase", fontWeight: 600, fontFamily: "Raleway, sans-serif", cursor: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: "14px", transition: "background .3s" }}
                                onMouseEnter={e => (e.currentTarget.style.background = "var(--gold-lt)")}
                                onMouseLeave={e => (e.currentTarget.style.background = "var(--gold)")}>
                                Continue to Submit
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 3 — Submit */}
                {step === "submit" && selectedProduct && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "80px", alignItems: "start" }}>

                        {/* Left — Summary */}
                        <div>
                            <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: "2rem", color: "var(--white)", fontWeight: 300, marginBottom: "32px" }}>
                                Your <em style={{ fontStyle: "italic", color: "var(--gold)" }}>Configuration</em>
                            </h2>

                            {selectedProduct.images && selectedProduct.images.length > 0 && (
                                <div style={{ aspectRatio: "1", background: "var(--dark2)", border: "1px solid var(--dark3)", overflow: "hidden", marginBottom: "24px", maxWidth: "320px" }}>
                                    <img src={selectedProduct.images[0]} alt={selectedProduct.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                </div>
                            )}

                            <div style={{ background: "var(--dark2)", border: "1px solid var(--dark3)", padding: "28px" }}>
                                {[
                                    { k: "Base Watch", v: selectedProduct.name },
                                    { k: "Series", v: selectedProduct.series },
                                    { k: "Strap", v: c.strapName },
                                    { k: "Case Finish", v: c.caseName },
                                    { k: "Dial Style", v: c.dialName },
                                    { k: "Base Price", v: fmt(selectedProduct.price) },
                                    { k: "Customisation", v: `+ ${fmt(cfgExtra)}` },
                                ].map(row => (
                                    <div key={row.k} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid var(--dark3)" }}>
                                        <span style={{ fontSize: ".52rem", letterSpacing: ".18em", color: "var(--muted)", textTransform: "uppercase" }}>{row.k}</span>
                                        <span style={{ fontSize: ".6rem", color: "var(--white)" }}>{row.v}</span>
                                    </div>
                                ))}
                                <div style={{ display: "flex", justifyContent: "space-between", padding: "16px 0 0" }}>
                                    <span style={{ fontSize: ".55rem", letterSpacing: ".18em", color: "var(--gold)", textTransform: "uppercase", fontWeight: 600 }}>Total</span>
                                    <span style={{ fontFamily: "Playfair Display, serif", fontSize: "1.4rem", color: "var(--gold)" }}>{fmt(totalPrice)}</span>
                                </div>
                            </div>

                            <button onClick={() => setStep("configure")}
                                style={{ marginTop: "16px", background: "none", border: "none", color: "var(--muted)", fontSize: ".52rem", letterSpacing: ".25em", textTransform: "uppercase", cursor: "none", fontFamily: "Raleway, sans-serif" }}>
                                ← Edit Configuration
                            </button>
                        </div>

                        {/* Right — Contact form */}
                        <div>
                            <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: "2rem", color: "var(--white)", fontWeight: 300, marginBottom: "8px" }}>
                                Your <em style={{ fontStyle: "italic", color: "var(--gold)" }}>Details</em>
                            </h2>
                            <p style={{ fontSize: ".6rem", letterSpacing: ".1em", color: "var(--text)", lineHeight: 2, marginBottom: "32px" }}>
                                We&apos;ll confirm your configuration within 24 hours and arrange payment.
                            </p>

                            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                                {[
                                    { label: "Full Name", value: customerName, setter: setCustomerName, placeholder: "Adebayo Okafor", required: true },
                                    { label: "Email Address", value: customerEmail, setter: setCustomerEmail, placeholder: "you@email.com", required: true },
                                    { label: "Phone / WhatsApp", value: customerPhone, setter: setCustomerPhone, placeholder: "+234 800 000 0000", required: false },
                                ].map(field => (
                                    <div key={field.label}>
                                        <label style={{ fontSize: ".5rem", letterSpacing: ".3em", color: "var(--gold-dk)", textTransform: "uppercase", display: "block", marginBottom: "8px" }}>
                                            {field.label} {field.required && <span style={{ color: "var(--gold)" }}>*</span>}
                                        </label>
                                        <input
                                            value={field.value}
                                            onChange={e => field.setter(e.target.value)}
                                            placeholder={field.placeholder}
                                            style={{ width: "100%", padding: "14px 16px", background: "var(--dark2)", border: "1px solid var(--dark4)", color: "var(--white)", fontFamily: "Raleway, sans-serif", fontSize: ".65rem", letterSpacing: ".08em", outline: "none", transition: "border-color .3s", boxSizing: "border-box" }}
                                            onFocus={e => (e.target.style.borderColor = "var(--gold-dk)")}
                                            onBlur={e => (e.target.style.borderColor = "var(--dark4)")}
                                        />
                                    </div>
                                ))}

                                <div>
                                    <label style={{ fontSize: ".5rem", letterSpacing: ".3em", color: "var(--gold-dk)", textTransform: "uppercase", display: "block", marginBottom: "8px" }}>
                                        Additional Notes
                                    </label>
                                    <textarea
                                        value={notes}
                                        onChange={e => setNotes(e.target.value)}
                                        placeholder="Any special requests, engraving text, or delivery notes..."
                                        rows={4}
                                        style={{ width: "100%", padding: "14px 16px", background: "var(--dark2)", border: "1px solid var(--dark4)", color: "var(--white)", fontFamily: "Raleway, sans-serif", fontSize: ".65rem", letterSpacing: ".08em", outline: "none", resize: "vertical", boxSizing: "border-box" }}
                                        onFocus={e => (e.target.style.borderColor = "var(--gold-dk)")}
                                        onBlur={e => (e.target.style.borderColor = "var(--dark4)")}
                                    />
                                </div>

                                <button
                                    onClick={handleSubmit}
                                    disabled={submitting || !customerName || !customerEmail}
                                    style={{ width: "100%", padding: "20px", background: submitting || !customerName || !customerEmail ? "var(--dark4)" : "var(--gold)", color: submitting || !customerName || !customerEmail ? "var(--muted)" : "var(--black)", border: "none", fontSize: ".6rem", letterSpacing: ".32em", textTransform: "uppercase", fontWeight: 600, fontFamily: "Raleway, sans-serif", cursor: submitting ? "wait" : "none", transition: "all .3s", display: "flex", alignItems: "center", justifyContent: "center", gap: "14px" }}
                                    onMouseEnter={e => { if (!submitting && customerName && customerEmail) e.currentTarget.style.background = "var(--gold-lt)"; }}
                                    onMouseLeave={e => { if (!submitting && customerName && customerEmail) e.currentTarget.style.background = "var(--gold)"; }}
                                >
                                    {submitting ? "Submitting..." : "Submit Configuration"}
                                    {!submitting && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 5l7 7-7 7" /></svg>}
                                </button>

                                <p style={{ fontSize: ".5rem", letterSpacing: ".15em", color: "var(--muted)", textAlign: "center", textTransform: "uppercase" }}>
                                    No payment required now · We&apos;ll contact you to confirm
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}