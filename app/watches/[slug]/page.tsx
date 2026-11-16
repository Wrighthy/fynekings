"use client";

import { useState, useEffect, use, Suspense } from "react";
import Link from "next/link";
import { useCart, fmt, paystackFee } from "@/lib/store";
import { useWishlistAction } from "@/lib/wishlistAction";
import { useCompare } from "@/lib/compareStore";
import { useClockHands } from "@/lib/useClockHands";
import ProductComments from "@/components/sections/ProductComments";
import ProductCard from "@/components/ui/ProductCard";
import QuickViewModal from "@/components/ui/QuickViewModal";
import type { Product } from "@/components/catalog/WatchCatalog";

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
            <rect x="170" y="20" width="80" height="100" rx="12" fill={p.strapColor || "#141414"} stroke={p.strapStroke || "#2e2e2e"} strokeWidth="1" />
            <line x1="186" y1="40" x2="234" y2="40" stroke="#1f1f1f" strokeWidth="1" />
            <line x1="186" y1="56" x2="234" y2="56" stroke="#1f1f1f" strokeWidth="1" />
            <line x1="186" y1="72" x2="234" y2="72" stroke="#1f1f1f" strokeWidth="1" />
            <line x1="186" y1="88" x2="234" y2="88" stroke="#1f1f1f" strokeWidth="1" />
            <path d="M 178 30 L 178 110" stroke="#C4A962" strokeWidth=".5" strokeDasharray="2 3" opacity=".6" />
            <path d="M 242 30 L 242 110" stroke="#C4A962" strokeWidth=".5" strokeDasharray="2 3" opacity=".6" />
            <rect x="170" y="300" width="80" height="100" rx="12" fill={p.strapColor || "#141414"} stroke={p.strapStroke || "#2e2e2e"} strokeWidth="1" />
            <line x1="186" y1="318" x2="234" y2="318" stroke="#1f1f1f" strokeWidth="1" />
            <line x1="186" y1="334" x2="234" y2="334" stroke="#1f1f1f" strokeWidth="1" />
            <line x1="186" y1="350" x2="234" y2="350" stroke="#1f1f1f" strokeWidth="1" />
            <line x1="186" y1="366" x2="234" y2="366" stroke="#1f1f1f" strokeWidth="1" />
            <path d="M 178 310 L 178 388" stroke="#C4A962" strokeWidth=".5" strokeDasharray="2 3" opacity=".6" />
            <path d="M 242 310 L 242 388" stroke="#C4A962" strokeWidth=".5" strokeDasharray="2 3" opacity=".6" />
            <rect x="320" y="200" width="22" height="20" rx="4" fill="#1a1a1a" stroke="#C4A962" strokeWidth="1" />
            <circle cx="210" cy="210" r="125" fill="#1a1a1a" stroke={p.caseStroke || "#C4A962"} strokeWidth="2.5" />
            <circle cx="210" cy="210" r="118" fill="url(#pdg)" stroke="#1e1e1e" strokeWidth=".5" />
            <g stroke={p.caseStroke || "#C4A962"} strokeWidth="2.5" strokeLinecap="round">
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

function ProductContent({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeImage, setActiveImage] = useState(0);
    const [zoomed, setZoomed] = useState(false);
    const [related, setRelated] = useState<Product[]>([]);
    const [quantity, setQuantity] = useState(1);
    const [addedToCart, setAddedToCart] = useState(false);
    const [activeTab, setActiveTab] = useState<"specs" | "shipping" | "authenticity">("specs");
    const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
    const [isPaused, setIsPaused] = useState(false);

    const addToCart = useCart((s) => s.addToCart);
    const { handleWishlistClick, isInWishlist } = useWishlistAction();
    const { toggleCompare, isInCompare } = useCompare();

    useEffect(() => {
        fetch(`/api/products/${slug}`)
            .then((r) => {
                if (!r.ok) return null;
                return r.json();
            })
            .then((data) => {
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
            .then((r) => r.json())
            .then((data) => {
                if (Array.isArray(data)) {
                    setRelated(data.filter((p: Product) => p.slug !== slug).slice(0, 4));
                }
            })
            .catch(() => { });
    }, [slug]);

    useEffect(() => {
        if (!product) return;
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "ArrowLeft") setActiveImage((i) => (i - 1 + product.images.length) % product.images.length);
            if (e.key === "ArrowRight") setActiveImage((i) => (i + 1) % product.images.length);
            if (e.key === "Escape") setZoomed(false);
        };
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [product, zoomed]);

    useEffect(() => {
        if (!product || !product.images || product.images.length <= 1 || isPaused) return;
        const interval = setInterval(() => {
            setActiveImage((i) => (i + 1) % product.images.length);
        }, 4000);
        return () => clearInterval(interval);
    }, [product, isPaused]);

    if (loading) {
        return (
            <div style={{ background: "var(--black)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ fontFamily: "Playfair Display, serif", fontSize: "1.4rem", color: "var(--gold)", fontStyle: "italic" }}>
                    Loading timepiece details...
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div style={{ background: "var(--black)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "24px" }}>
                <p style={{ fontFamily: "Playfair Display, serif", fontSize: "1.8rem", color: "var(--white)" }}>Timepiece not found</p>
                <Link
                    href="/collection"
                    style={{
                        fontSize: "15px",
                        letterSpacing: ".12em",
                        color: "var(--gold)",
                        textTransform: "uppercase",
                        textDecoration: "none",
                        padding: "12px 24px",
                        border: "1px solid var(--gold)",
                    }}
                >
                    ← Return to Collection
                </Link>
            </div>
        );
    }

    const inWishlist = isInWishlist(product.slug || product.id);
    const inCompare = isInCompare(product.id);
    const isSoldOut = product.stockCount === 0 || product.inStock === false;
    const isLowStock = !isSoldOut && typeof product.stockCount === "number" && product.stockCount <= 3;
    const maxQty = isSoldOut ? 0 : Math.min(product.stockCount || 10, 10);
    const calculatedFee = paystackFee(product.price);

    const handleAddToCart = () => {
        if (isSoldOut) return;
        for (let i = 0; i < quantity; i++) {
            addToCart(product.name, product.series, product.price);
        }
        setAddedToCart(true);
        setTimeout(() => setAddedToCart(false), 2400);
    };

    return (
        <div style={{ background: "var(--black)", minHeight: "100vh", fontFamily: "Raleway, sans-serif", color: "var(--text)" }}>

            {/* Breadcrumb Navigation */}
            <div style={{ padding: "100px 24px 24px", borderBottom: "1px solid var(--dark3)" }}>
                <div style={{ maxWidth: "1300px", margin: "0 auto", display: "flex", alignItems: "center", flexWrap: "wrap", gap: "10px", fontSize: "15px", letterSpacing: ".12em" }}>
                    <Link href="/" style={{ color: "var(--muted)", textDecoration: "none", textTransform: "uppercase" }}>Home</Link>
                    <span style={{ color: "var(--dark4)" }}>/</span>
                    <Link href="/collection" style={{ color: "var(--muted)", textDecoration: "none", textTransform: "uppercase" }}>Collection</Link>
                    {product.series && (
                        <>
                            <span style={{ color: "var(--dark4)" }}>/</span>
                            <span style={{ color: "var(--muted)", textTransform: "uppercase" }}>{product.series}</span>
                        </>
                    )}
                    <span style={{ color: "var(--dark4)" }}>/</span>
                    <span style={{ color: "var(--gold)", textTransform: "uppercase", fontWeight: 600 }}>{product.name}</span>
                </div>
            </div>

            {/* Main Product Showcase */}
            <div style={{ maxWidth: "1300px", margin: "0 auto", padding: "48px 24px 80px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 460px), 1fr))", gap: "48px", alignItems: "start" }}>

                    {/* Left Column: Interactive Image Gallery */}
                    <div style={{ position: "sticky", top: "100px" }}>
                        {/* Main Stage */}
                        <div
                            style={{
                                height: "min(540px, 75vw)",
                                background: "var(--dark2)",
                                border: "1px solid var(--dark3)",
                                position: "relative",
                                overflow: "hidden",
                                marginBottom: "16px",
                                cursor: "zoom-in",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                            onClick={() => setZoomed(true)}
                            onMouseEnter={() => setIsPaused(true)}
                            onMouseLeave={() => setIsPaused(false)}
                        >
                            {product.images && product.images.length > 0 ? (
                                <img
                                    key={activeImage}
                                    src={product.images[activeImage]}
                                    alt={`${product.name} — view ${activeImage + 1}`}
                                    style={{
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "contain",
                                        objectPosition: "center",
                                        animation: "fadeIn .35s ease",
                                        padding: "16px",
                                    }}
                                />
                            ) : (
                                <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <WatchSVG p={product} />
                                </div>
                            )}

                            {/* Luxury Corner Accents */}
                            <div style={{ position: "absolute", top: "16px", left: "16px", width: "24px", height: "24px", borderTop: "1px solid var(--gold-dk)", borderLeft: "1px solid var(--gold-dk)", pointerEvents: "none" }} />
                            <div style={{ position: "absolute", top: "16px", right: "16px", width: "24px", height: "24px", borderTop: "1px solid var(--gold-dk)", borderRight: "1px solid var(--gold-dk)", pointerEvents: "none" }} />
                            <div style={{ position: "absolute", bottom: "16px", left: "16px", width: "24px", height: "24px", borderBottom: "1px solid var(--gold-dk)", borderLeft: "1px solid var(--gold-dk)", pointerEvents: "none" }} />
                            <div style={{ position: "absolute", bottom: "16px", right: "16px", width: "24px", height: "24px", borderBottom: "1px solid var(--gold-dk)", borderRight: "1px solid var(--gold-dk)", pointerEvents: "none" }} />

                            {/* Reference Badge */}
                            <div style={{ position: "absolute", top: "18px", left: "50%", transform: "translateX(-50%)", fontSize: "15px", letterSpacing: ".2em", color: "var(--gold-dk)", textTransform: "uppercase", pointerEvents: "none", background: "rgba(10,10,10,0.8)", padding: "4px 12px", border: "1px solid rgba(196,169,98,0.2)" }}>
                                REF. FYN-{slug.toUpperCase().replace(/-/g, "")}
                            </div>

                            {/* Image Counter & Zoom Hint */}
                            {product.images && product.images.length > 1 && (
                                <div style={{ position: "absolute", bottom: "18px", left: "50%", transform: "translateX(-50%)", background: "rgba(0,0,0,.75)", backdropFilter: "blur(6px)", border: "1px solid var(--dark4)", padding: "6px 16px", fontSize: "15px", letterSpacing: ".2em", color: "var(--gold)", textTransform: "uppercase" }}>
                                    {activeImage + 1} / {product.images.length} · Click to Zoom
                                </div>
                            )}

                            {/* Left/Right Carousel Nav */}
                            {product.images && product.images.length > 1 && (
                                <>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setActiveImage((i) => (i - 1 + product.images.length) % product.images.length);
                                        }}
                                        aria-label="Previous image"
                                        style={{
                                            position: "absolute",
                                            left: "14px",
                                            top: "50%",
                                            transform: "translateY(-50%)",
                                            background: "rgba(8,8,8,.75)",
                                            border: "1px solid var(--gold-dk)",
                                            color: "var(--gold)",
                                            width: "44px",
                                            height: "44px",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            cursor: "pointer",
                                            backdropFilter: "blur(4px)",
                                            transition: "all .25s",
                                        }}
                                        onMouseEnter={(e) => { e.currentTarget.style.background = "var(--gold)"; e.currentTarget.style.color = "var(--black)"; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(8,8,8,.75)"; e.currentTarget.style.color = "var(--gold)"; }}
                                    >
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setActiveImage((i) => (i + 1) % product.images.length);
                                        }}
                                        aria-label="Next image"
                                        style={{
                                            position: "absolute",
                                            right: "14px",
                                            top: "50%",
                                            transform: "translateY(-50%)",
                                            background: "rgba(8,8,8,.75)",
                                            border: "1px solid var(--gold-dk)",
                                            color: "var(--gold)",
                                            width: "44px",
                                            height: "44px",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            cursor: "pointer",
                                            backdropFilter: "blur(4px)",
                                            transition: "all .25s",
                                        }}
                                        onMouseEnter={(e) => { e.currentTarget.style.background = "var(--gold)"; e.currentTarget.style.color = "var(--black)"; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(8,8,8,.75)"; e.currentTarget.style.color = "var(--gold)"; }}
                                    >
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Thumbnails */}
                        {product.images && product.images.length > 1 && (
                            <div style={{ display: "flex", gap: "10px", overflowX: "auto", paddingBottom: "6px", WebkitOverflowScrolling: "touch" }}>
                                {product.images.map((img, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setActiveImage(i)}
                                        aria-label={`View angle ${i + 1}`}
                                        style={{
                                            flexShrink: 0,
                                            width: "72px",
                                            height: "88px",
                                            border: i === activeImage ? "2px solid var(--gold)" : "1px solid var(--dark3)",
                                            background: "var(--dark2)",
                                            padding: "4px",
                                            cursor: "pointer",
                                            overflow: "hidden",
                                            opacity: i === activeImage ? 1 : 0.6,
                                            transition: "all .25s",
                                        }}
                                        onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                                        onMouseLeave={(e) => (e.currentTarget.style.opacity = i === activeImage ? "1" : "0.6")}
                                    >
                                        <img src={img} alt={`${product.name} view ${i + 1}`} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right Column: Product Details & Purchase Actions */}
                    <div>
                        {/* Status Badges */}
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", marginBottom: "16px" }}>
                            {isSoldOut ? (
                                <span style={{ padding: "6px 14px", background: "rgba(224, 75, 75, 0.15)", border: "1px solid #e04b4b", color: "#ff7b7b", fontSize: "15px", letterSpacing: ".2em", textTransform: "uppercase", fontWeight: 700 }}>
                                    ● Sold Out
                                </span>
                            ) : isLowStock ? (
                                <span style={{ padding: "6px 14px", background: "rgba(240, 165, 0, 0.15)", border: "1px solid #f0a500", color: "#f0a500", fontSize: "15px", letterSpacing: ".2em", textTransform: "uppercase", fontWeight: 700 }}>
                                    ● Only {product.stockCount} Left in Vault
                                </span>
                            ) : (
                                <span style={{ padding: "6px 14px", background: "rgba(74, 189, 126, 0.12)", border: "1px solid #4abd7e", color: "#4abd7e", fontSize: "15px", letterSpacing: ".2em", textTransform: "uppercase", fontWeight: 700 }}>
                                    ● In Stock · Ready to Dispatch
                                </span>
                            )}

                            {(product.badge || product.badgeNew) && (
                                <span style={{ padding: "6px 14px", background: product.badge ? "var(--gold)" : "transparent", border: product.badgeNew ? "1px solid var(--gold)" : "none", color: product.badge ? "var(--black)" : "var(--gold)", fontSize: "15px", letterSpacing: ".2em", textTransform: "uppercase", fontWeight: 700 }}>
                                    {product.badge || product.badgeNew}
                                </span>
                            )}
                        </div>

                        {/* Series & Name */}
                        <div style={{ fontSize: "15px", letterSpacing: ".12em", color: "var(--gold)", textTransform: "uppercase", marginBottom: "10px", fontWeight: 600 }}>
                            {product.series}
                        </div>
                        <h1 style={{ fontFamily: "Playfair Display, serif", fontSize: "clamp(2.2rem, 4vw, 3.2rem)", fontWeight: 400, color: "var(--white)", marginBottom: "8px", letterSpacing: "-.02em", lineHeight: 1.15 }}>
                            {product.name}
                        </h1>
                        <p style={{ fontSize: "15px", letterSpacing: ".18em", color: "var(--muted)", textTransform: "uppercase", marginBottom: "24px" }}>
                            {product.tag}
                        </p>

                        <div style={{ width: "64px", height: "1px", background: "linear-gradient(to right, var(--gold), transparent)", marginBottom: "28px" }} />

                        {/* Price Presentation */}
                        <div style={{ marginBottom: "32px", padding: "24px", background: "var(--dark2)", border: "1px solid var(--dark3)" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "12px" }}>
                                <div>
                                    <div style={{ fontSize: "15px", letterSpacing: ".12em", color: "var(--gold-dk)", textTransform: "uppercase", marginBottom: "6px" }}>
                                        Price
                                    </div>
                                    <div style={{ fontFamily: "Playfair Display, serif", fontSize: "clamp(2rem, 3.5vw, 2.8rem)", color: "var(--white)", fontWeight: 400, letterSpacing: "-.02em" }}>
                                        {fmt(product.price)}
                                    </div>
                                </div>
                                <div style={{ textAlign: "right" }}>
                                    <div style={{ fontSize: "15px", color: "var(--muted)", letterSpacing: ".08em" }}>
                                        Transparent Checkout:
                                    </div>
                                    <div style={{ fontSize: "15px", color: "var(--gold)", letterSpacing: ".08em", fontWeight: 500, marginTop: "2px" }}>
                                        + {fmt(calculatedFee)} Paystack Processing Fee
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div style={{ fontSize: "15px", lineHeight: 1.85, color: "#ded9ce", marginBottom: "36px" }}>
                            <p>
                                {product.description ||
                                    "A masterpiece of contemporary horological craft. Every detail is individually inspected, timed, and calibrated in our Victoria Island private salon for exceptional accuracy, comfort, and enduring luxury."}
                            </p>
                        </div>

                        {/* Quantity & CTA Block */}
                        <div style={{ marginBottom: "32px", paddingBottom: "32px", borderBottom: "1px solid var(--dark3)" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "16px", flexWrap: "wrap" }}>

                                {/* Stepper */}
                                {!isSoldOut && (
                                    <div style={{ display: "flex", alignItems: "center", border: "1px solid var(--dark4)", background: "var(--dark2)", height: "52px" }}>
                                        <button
                                            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                                            aria-label="Decrease quantity"
                                            style={{
                                                width: "48px",
                                                height: "100%",
                                                background: "none",
                                                border: "none",
                                                color: quantity > 1 ? "var(--gold)" : "var(--dark4)",
                                                cursor: quantity > 1 ? "pointer" : "not-allowed",
                                                fontSize: "1.2rem",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                            }}
                                        >
                                            −
                                        </button>
                                        <span style={{ width: "44px", textAlign: "center", fontSize: "15px", color: "var(--white)", fontWeight: 600, fontFamily: "Raleway, sans-serif" }}>
                                            {quantity}
                                        </span>
                                        <button
                                            onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
                                            aria-label="Increase quantity"
                                            style={{
                                                width: "48px",
                                                height: "100%",
                                                background: "none",
                                                border: "none",
                                                color: quantity < maxQty ? "var(--gold)" : "var(--dark4)",
                                                cursor: quantity < maxQty ? "pointer" : "not-allowed",
                                                fontSize: "1.2rem",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                            }}
                                        >
                                            +
                                        </button>
                                    </div>
                                )}

                                {/* Main Add to Cart Button */}
                                <button
                                    onClick={handleAddToCart}
                                    disabled={isSoldOut}
                                    style={{
                                        flex: "1 1 220px",
                                        height: "52px",
                                        background: isSoldOut ? "var(--dark3)" : addedToCart ? "#4abd7e" : "var(--gold)",
                                        color: isSoldOut ? "var(--muted)" : addedToCart ? "#ffffff" : "var(--black)",
                                        border: "none",
                                        fontSize: "15px",
                                        letterSpacing: ".12em",
                                        textTransform: "uppercase",
                                        fontWeight: 700,
                                        fontFamily: "Raleway, sans-serif",
                                        cursor: isSoldOut ? "not-allowed" : "pointer",
                                        transition: "all .3s ease",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: "12px",
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!isSoldOut && !addedToCart) e.currentTarget.style.background = "var(--gold-lt)";
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!isSoldOut && !addedToCart) e.currentTarget.style.background = "var(--gold)";
                                    }}
                                >
                                    {isSoldOut ? (
                                        "Sold Out"
                                    ) : addedToCart ? (
                                        <>
                                            <span>✓ Added to Cart</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Add to Cart</span>
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                <path d="M5 12h14M13 5l7 7-7 7" />
                                            </svg>
                                        </>
                                    )}
                                </button>

                                {/* Wishlist Action */}
                                <button
                                    onClick={(e) => handleWishlistClick(e, product.slug || product.id)}
                                    aria-label={inWishlist ? "Remove from Wishlist" : "Save to Wishlist"}
                                    style={{
                                        width: "52px",
                                        height: "52px",
                                        background: "var(--dark2)",
                                        border: inWishlist ? "1px solid var(--gold)" : "1px solid var(--dark4)",
                                        color: inWishlist ? "var(--gold)" : "var(--muted)",
                                        fontSize: "1.4rem",
                                        cursor: "pointer",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        transition: "all .25s",
                                    }}
                                    title={inWishlist ? "Saved in Wishlist" : "Save to Wishlist"}
                                >
                                    {inWishlist ? "♥" : "♡"}
                                </button>

                                {/* Compare Action */}
                                <button
                                    onClick={() =>
                                        toggleCompare({
                                            id: product.id,
                                            name: product.name,
                                            slug: product.slug,
                                            series: product.series,
                                            price: product.price,
                                            strapColor: product.strapColor || "#111",
                                            caseColor: product.caseColor || "#222",
                                            caseStroke: product.caseStroke || "#C4A962",
                                            images: product.images,
                                            specs: product.specs || null,
                                        })
                                    }
                                    style={{
                                        width: "52px",
                                        height: "52px",
                                        background: "var(--dark2)",
                                        border: inCompare ? "1px solid var(--gold)" : "1px solid var(--dark4)",
                                        color: inCompare ? "var(--gold)" : "var(--muted)",
                                        fontSize: "1rem",
                                        cursor: "pointer",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        transition: "all .25s",
                                    }}
                                    title={inCompare ? "Remove from Compare" : "Compare Model"}
                                >
                                    ⚖
                                </button>
                            </div>

                            {/* Concierge Assistance Link */}
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "14px", fontSize: "15px" }}>
                                <span style={{ color: "var(--muted)" }}>Prefer personal assistance?</span>
                                <a
                                    href={`https://wa.me/2348000000000?text=${encodeURIComponent(
                                        `Hello FYNEKINGS Concierge, I would like to inquire about the ${product.name} (Ref: FYN-${product.slug.toUpperCase().replace(/-/g, "")}) priced at ${fmt(product.price)}.`
                                    )}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ color: "var(--gold)", textDecoration: "none", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px" }}
                                >
                                    <span>Chat with Concierge</span>
                                    <span>→</span>
                                </a>
                            </div>
                        </div>

                        {/* Information Pillars Tabs */}
                        <div style={{ marginTop: "32px" }}>
                            {/* Tab Bar */}
                            <div style={{ display: "flex", borderBottom: "1px solid var(--dark4)", gap: "28px" }}>
                                {[
                                    { id: "specs", label: "Specifications" },
                                    { id: "shipping", label: "Delivery & Returns" },
                                    { id: "authenticity", label: "Warranty & Authenticity" },
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id as typeof activeTab)}
                                        style={{
                                            background: "none",
                                            border: "none",
                                            borderBottom: activeTab === tab.id ? "2px solid var(--gold)" : "2px solid transparent",
                                            padding: "12px 0",
                                            color: activeTab === tab.id ? "var(--white)" : "var(--muted)",
                                            fontSize: "15px",
                                            letterSpacing: ".15em",
                                            textTransform: "uppercase",
                                            fontWeight: activeTab === tab.id ? 700 : 500,
                                            cursor: "pointer",
                                            transition: "all .25s",
                                            marginBottom: "-1px",
                                        }}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            {/* Tab 1: Horological Technical Specifications */}
                            {activeTab === "specs" && (
                                <div style={{ paddingTop: "24px", animation: "fadeIn .3s ease" }}>
                                    {product.specs && Object.keys(product.specs).length > 0 ? (
                                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))", gap: "12px" }}>
                                            {Object.entries(product.specs).map(([key, value]) => (
                                                <div
                                                    key={key}
                                                    style={{
                                                        padding: "14px 16px",
                                                        background: "var(--dark2)",
                                                        border: "1px solid var(--dark3)",
                                                        display: "flex",
                                                        flexDirection: "column",
                                                        gap: "4px",
                                                    }}
                                                >
                                                    <span style={{ fontSize: "15px", letterSpacing: ".18em", color: "var(--gold-dk)", textTransform: "uppercase" }}>
                                                        {key.replace(/([A-Z])/g, " $1").trim()}
                                                    </span>
                                                    <span style={{ fontSize: "15px", color: "var(--white)", fontWeight: 500 }}>
                                                        {value}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div style={{ padding: "24px", background: "var(--dark2)", border: "1px solid var(--dark3)", color: "var(--muted)", fontSize: "15px" }}>
                                            Technical caliber specifications available upon request through our master horologist.
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Tab 2: Delivery, Shipping & Returns in Nigeria */}
                            {activeTab === "shipping" && (
                                <div style={{ paddingTop: "24px", display: "flex", flexDirection: "column", gap: "16px", animation: "fadeIn .3s ease" }}>
                                    <div style={{ padding: "16px 20px", background: "var(--dark2)", border: "1px solid var(--dark3)" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                                            <span style={{ fontSize: "1.1rem" }}>📍</span>
                                            <span style={{ fontSize: "15px", letterSpacing: ".12em", color: "var(--white)", fontWeight: 600, textTransform: "uppercase" }}>
                                                Lagos Metro Delivery (24 – 48 Hours)
                                            </span>
                                        </div>
                                        <p style={{ fontSize: "15px", color: "var(--text)", lineHeight: 1.6, margin: 0 }}>
                                            Hand-delivered in tamper-evident security vault cases by our private bonded courier service across Victoria Island, Ikoyi, Lekki, and Mainland.
                                        </p>
                                    </div>

                                    <div style={{ padding: "16px 20px", background: "var(--dark2)", border: "1px solid var(--dark3)" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                                            <span style={{ fontSize: "1.1rem" }}>✈️</span>
                                            <span style={{ fontSize: "15px", letterSpacing: ".12em", color: "var(--white)", fontWeight: 600, textTransform: "uppercase" }}>
                                                Nationwide Express (2 – 4 Business Days)
                                            </span>
                                        </div>
                                        <p style={{ fontSize: "15px", color: "var(--text)", lineHeight: 1.6, margin: 0 }}>
                                            Fully insured express air shipment to Abuja, Port Harcourt, Kano, Ibadan, and all 36 states with real-time SMS & email tracking.
                                        </p>
                                    </div>

                                    <div style={{ padding: "16px 20px", background: "var(--dark2)", border: "1px solid var(--dark3)" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                                            <span style={{ fontSize: "1.1rem" }}>↩</span>
                                            <span style={{ fontSize: "15px", letterSpacing: ".12em", color: "var(--white)", fontWeight: 600, textTransform: "uppercase" }}>
                                                7-Day Inspection & Exchange Policy
                                            </span>
                                        </div>
                                        <p style={{ fontSize: "15px", color: "var(--text)", lineHeight: 1.6, margin: 0 }}>
                                            Examine your timepiece with complete peace of mind. Timepieces in unworn condition with factory protective seals intact are eligible for immediate exchange or full refund.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Tab 3: Warranty & Authenticity Guarantee */}
                            {activeTab === "authenticity" && (
                                <div style={{ paddingTop: "24px", display: "flex", flexDirection: "column", gap: "16px", animation: "fadeIn .3s ease" }}>
                                    <div style={{ padding: "16px 20px", background: "var(--dark2)", border: "1px solid var(--dark3)" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                                            <span style={{ fontSize: "1.1rem" }}>🛡️</span>
                                            <span style={{ fontSize: "15px", letterSpacing: ".12em", color: "var(--white)", fontWeight: 600, textTransform: "uppercase" }}>
                                                5-Year International Horology Warranty
                                            </span>
                                        </div>
                                        <p style={{ fontSize: "15px", color: "var(--text)", lineHeight: 1.6, margin: 0 }}>
                                            Covers mechanical movement calibration, component integrity, and manufacturing defects. Serviced by certified horological technicians at our Lagos workshop.
                                        </p>
                                    </div>

                                    <div style={{ padding: "16px 20px", background: "var(--dark2)", border: "1px solid var(--dark3)" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                                            <span style={{ fontSize: "1.1rem" }}>⚜️</span>
                                            <span style={{ fontSize: "15px", letterSpacing: ".12em", color: "var(--white)", fontWeight: 600, textTransform: "uppercase" }}>
                                                100% Certified Genuine & Numbered
                                            </span>
                                        </div>
                                        <p style={{ fontSize: "15px", color: "var(--text)", lineHeight: 1.6, margin: 0 }}>
                                            Each timepiece is timed on electronic chronocomparators, assigned an individual serial code, and packaged in a velvet-lined luxury lacquered presentation box with signed papers.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Trust Badges Bar */}
                        <div style={{ marginTop: "36px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "12px" }}>
                            {[
                                { icon: "🛡️", title: "5-Year Warranty", sub: "Mechanical coverage" },
                                { icon: "🚚", title: "Insured Transit", sub: "Nationwide delivery" },
                                { icon: "⚜️", title: "100% Authentic", sub: "Signed & numbered" },
                                { icon: "💳", title: "Secure Paystack", sub: "Cards & transfers" },
                            ].map((b) => (
                                <div key={b.title} style={{ padding: "14px 12px", border: "1px solid var(--dark3)", background: "var(--dark2)", textAlign: "center" }}>
                                    <div style={{ fontSize: "1.3rem", marginBottom: "6px" }}>{b.icon}</div>
                                    <div style={{ fontSize: "15px", letterSpacing: ".1em", color: "var(--white)", textTransform: "uppercase", fontWeight: 600, marginBottom: "2px" }}>
                                        {b.title}
                                    </div>
                                    <div style={{ fontSize: "14px", color: "var(--muted)" }}>
                                        {b.sub}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Fullscreen Zoom Lightbox */}
            {zoomed && product.images && product.images.length > 0 && (
                <div
                    onClick={() => setZoomed(false)}
                    style={{
                        position: "fixed",
                        inset: 0,
                        background: "rgba(0,0,0,.95)",
                        zIndex: 9999,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "zoom-out",
                    }}
                >
                    <img
                        src={product.images[activeImage]}
                        alt={product.name}
                        style={{ maxWidth: "90vw", maxHeight: "90vh", objectFit: "contain" }}
                    />
                    <button
                        onClick={() => setZoomed(false)}
                        aria-label="Close zoom"
                        style={{
                            position: "absolute",
                            top: "24px",
                            right: "24px",
                            background: "rgba(20,20,20,0.8)",
                            border: "1px solid var(--gold-dk)",
                            color: "var(--gold)",
                            width: "44px",
                            height: "44px",
                            fontSize: "1.2rem",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        ✕
                    </button>
                    <div style={{ position: "absolute", bottom: "24px", left: "50%", transform: "translateX(-50%)", fontSize: "15px", letterSpacing: ".12em", color: "var(--gold-dk)", textTransform: "uppercase", background: "rgba(0,0,0,0.7)", padding: "6px 16px" }}>
                        Click anywhere or press Esc to close
                    </div>
                </div>
            )}

            {/* Collector Impressions & Reviews */}
            <ProductComments slug={product.slug} />

            {/* Related Timepieces */}
            {related.length > 0 && (
                <div style={{ borderTop: "1px solid var(--dark3)", background: "var(--dark)", padding: "80px 24px" }} className="related-section">
                    <div style={{ maxWidth: "1300px", margin: "0 auto" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "40px", flexWrap: "wrap", gap: "16px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                                <span style={{ width: "24px", height: "1px", background: "var(--gold)", display: "inline-block" }} />
                                <span style={{ fontSize: "15px", letterSpacing: ".12em", color: "var(--gold)", textTransform: "uppercase", fontWeight: 600 }}>
                                    Curated Recommendations
                                </span>
                            </div>
                            <Link
                                href="/collection"
                                style={{
                                    fontSize: "15px",
                                    letterSpacing: ".2em",
                                    color: "var(--muted)",
                                    textTransform: "uppercase",
                                    textDecoration: "none",
                                    transition: "color .2s",
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--gold)")}
                                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted)")}
                            >
                                View Complete Collection →
                            </Link>
                        </div>

                        {/* Product Cards Grid using unified ProductCard */}
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))", gap: "24px" }}>
                            {related.map((p) => (
                                <ProductCard
                                    key={p.id}
                                    product={p}
                                    onQuickView={(watch) => setQuickViewProduct(watch)}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Quick View Modal for Related Watches */}
            <QuickViewModal
                product={quickViewProduct}
                onClose={() => setQuickViewProduct(null)}
            />
        </div>
    );
}

export default function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
    return (
        <Suspense fallback={<div style={{ background: "var(--black)", minHeight: "100vh" }} />}>
            <ProductContent params={params} />
        </Suspense>
    );
}