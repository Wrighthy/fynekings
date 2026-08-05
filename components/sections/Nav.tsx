"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/lib/store";

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const cart = useCart(s => s.cart);
  const setCartOpen = useCart(s => s.setCartOpen);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className={scrolled ? "scrolled" : ""}>
      <a href="/" className="logo">
        <span className="logo-mark">F</span>
        FYNE<span>KINGS</span>
      </a>
      <ul className="nav-links">
        <li><a href="/collection">Collection</a></li>
        <li><a href="#customizer">Customize</a></li>
        <li><a href="#countdown">Limited</a></li>
        <li><a href="#tryon">Try On</a></li>
        <li><a href="#heritage">Atelier</a></li>
        <li><a href="#education">Craft</a></li>
      </ul>
      <div className="nav-right">
        <span className="lang-switch"><span className="active">EN</span> · FR</span>
        <button className="nav-btn" onClick={() => setCartOpen(true)}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0" />
          </svg>
          Cart <span className="cart-pill">{cart.length}</span>
        </button>
      </div>
    </nav>
  );
}