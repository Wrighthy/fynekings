"use client";

import { useState, useEffect, useRef } from "react";

export default function Home() {
  // CART STATE
  const [cart, setCart] = useState<Array<{name: string; series: string; amount: number; fee: number; custom: {strapName: string; caseName: string; dialName: string} | null}>>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [navScrolled, setNavScrolled] = useState(false);
  const [toast, setToast] = useState("");

  // CUSTOMIZER STATE
  const [strapName, setStrapName] = useState("Midnight Black");
  const [caseName, setCaseName] = useState("Gold PVD");
  const [dialName, setDialName] = useState("Sunray Black");
  const [strapExtra, setStrapExtra] = useState(0);
  const [caseExtra, setCaseExtra] = useState(0);
  const [dialExtra, setDialExtra] = useState(0);
  const [strapColor, setStrapColor] = useState("#141414");
  const [caseStroke, setCaseStroke] = useState("#C4A962");
  const BASE = 420000;

  // COUNTDOWN STATE
  const [timer, setTimer] = useState({ d: "14", h: "00", m: "00", s: "00" });

  // CURSOR REFS
  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorRingRef = useRef<HTMLDivElement>(null);

  // HELPERS
  const fmt = (n: number) => "₦" + n.toLocaleString("en-NG");
  const paystackFee = (a: number) => Math.min(Math.round(a * 0.015 + 100), 2000);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2800);
  };

  const addToCart = (name: string, series: string, amount: number) => {
    setCart(c => [...c, { name, series, amount, fee: paystackFee(amount), custom: null }]);
    setCartOpen(true);
    showToast(name + " added to cart");
  };

  const addCustomToCart = () => {
    const extra = strapExtra + caseExtra + dialExtra;
    const amount = BASE + extra;
    setCart(c => [...c, { name: "Custom Fynekings", series: "Your Build", amount, fee: paystackFee(amount), custom: { strapName, caseName, dialName } }]);
    setCartOpen(true);
    showToast("Custom watch added to cart");
  };

  const removeFromCart = (i: number) => {
    setCart(c => c.filter((_, idx) => idx !== i));
    showToast("Item removed");
  };

  const subtotal = cart.reduce((s, i) => s + i.amount, 0);
  const totalFee = cart.reduce((s, i) => s + i.fee, 0);
  const cfgExtra = strapExtra + caseExtra + dialExtra;

  // CURSOR FOLLOWER
  useEffect(() => {
    let mx = 0, my = 0, rx = 0, ry = 0;
    const onMove = (e: MouseEvent) => {
      mx = e.clientX; my = e.clientY;
      if (cursorRef.current) {
        cursorRef.current.style.left = mx + "px";
        cursorRef.current.style.top = my + "px";
      }
    };
    const animate = () => {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      if (cursorRingRef.current) {
        cursorRingRef.current.style.left = rx + "px";
        cursorRingRef.current.style.top = ry + "px";
      }
      requestAnimationFrame(animate);
    };
    document.addEventListener("mousemove", onMove);
    animate();
    return () => document.removeEventListener("mousemove", onMove);
  }, []);

  // NAV SCROLL
  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // COUNTDOWN TIMER
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const target = new Date(now);
      target.setDate(target.getDate() + 14);
      target.setHours(23, 59, 59, 0);
      const diff = Math.max(0, target.getTime() - now.getTime());
      setTimer({
        d: String(Math.floor(diff / 86400000)).padStart(2, "0"),
        h: String(Math.floor((diff % 86400000) / 3600000)).padStart(2, "0"),
        m: String(Math.floor((diff % 3600000) / 60000)).padStart(2, "0"),
        s: String(Math.floor((diff % 60000) / 1000)).padStart(2, "0"),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // SCROLL REVEAL
  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("visible"); }),
      { threshold: 0.1 }
    );
    document.querySelectorAll(".reveal").forEach(r => obs.observe(r));
    return () => obs.disconnect();
  }, []);

  // CURSOR HOVER TARGETS
  useEffect(() => {
    const targets = document.querySelectorAll("a, button, .swatch, .product-card, .style-btn, .filter-btn, .edu-card, input");
    const enter = () => document.body.classList.add("cur-hover");
    const leave = () => document.body.classList.remove("cur-hover");
    targets.forEach(el => {
      el.addEventListener("mouseenter", enter);
      el.addEventListener("mouseleave", leave);
    });
    return () => {
      targets.forEach(el => {
        el.removeEventListener("mouseenter", enter);
        el.removeEventListener("mouseleave", leave);
      });
    };
  }, []);

  return (
    <>
      <div ref={cursorRef} id="cur" aria-hidden="true"></div>
      <div ref={cursorRingRef} id="cur-r" aria-hidden="true"></div>

      {/* Placeholder content — we'll fill in all the sections in the next sub-step */}
      <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "20px", padding: "40px" }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(3rem, 8vw, 6rem)", fontWeight: 300, color: "var(--white)", textAlign: "center", lineHeight: 0.95 }}>
          Fynekings <em style={{ color: "var(--gold)", fontStyle: "italic" }}>scaffold</em> ready.
        </h1>
        <p style={{ fontSize: "0.7rem", letterSpacing: "0.3em", textTransform: "uppercase", color: "var(--gold)" }}>
          Step 2.4 complete · {cart.length} item{cart.length !== 1 ? "s" : ""} in cart · Drop closes in {timer.d}d {timer.h}h {timer.m}m {timer.s}s
        </p>
        <p style={{ fontSize: "0.65rem", letterSpacing: "0.15em", color: "var(--muted)", textAlign: "center", maxWidth: "500px", lineHeight: 2 }}>
          State, cursor, countdown, scroll listeners — all working. Next sub-step: paste in the actual sections.
        </p>
        <button
          onClick={() => addToCart("Test Watch", "Demo", 100000)}
          style={{ marginTop: "20px", padding: "14px 32px", background: "var(--gold)", color: "var(--black)", border: "none", fontSize: "0.55rem", letterSpacing: "0.3em", textTransform: "uppercase", fontWeight: 600, cursor: "none" }}
        >
          Test Add to Cart
        </button>
      </main>

      {toast && (
        <div style={{ position: "fixed", bottom: "40px", left: "50%", transform: "translateX(-50%)", background: "var(--dark2)", border: "1px solid var(--gold)", padding: "16px 32px", fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--gold)", zIndex: 900 }}>
          {toast}
        </div>
      )}
    </>
  );
}