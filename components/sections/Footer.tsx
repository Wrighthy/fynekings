"use client";
import Link from "next/link";

const FOOTER_COLS = [
  {
    h: "Collection", l: [
      { label: "Best Sellers", href: "/collection" },
      { label: "New Arrivals", href: "/collection" },
      { label: "Compare Models", href: "/compare" },
      { label: "Wishlist", href: "/wishlist" },
    ]
  },
  {
    h: "Experience", l: [
      { label: "About Atelier", href: "/about" },
      { label: "Track Order", href: "/orders/track" },
      { label: "My Account", href: "/account" },
      { label: "Watch Education", href: "/#education" },
      { label: "Lagos Atelier", href: "/#heritage" },
    ]
  },
  {
    h: "Service", l: [
      { label: "Shipping Policy", href: "/shipping-policy" },
      { label: "Return Policy", href: "/return-policy" },
      { label: "Contact Atelier", href: "/contact" },
      { label: "FAQ & Help", href: "/faq" },
    ]
  },
  {
    h: "Legal", l: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Sale", href: "/terms" },
    ]
  },
];

export default function Footer() {
  return (
    <footer>
      <div className="footer-grid">
        <div className="footer-brand">
          <Link href="/" className="logo">
            <span className="logo-mark">F</span>
            FYNE<span>KINGS</span>
          </Link>
          <p className="footer-tag">Handcrafted timepieces for the African collector. Precision engineered. Prestige defined.</p>
          <p className="footer-locale">
            <span className="footer-locale-line"></span>
            Lagos, Nigeria · Est. 2024
          </p>
        </div>
        {FOOTER_COLS.map(c => (
          <div key={c.h} className="footer-col">
            <h5>{c.h}</h5>
            <ul>
              {c.l.map(li => (
                <li key={li.label}>
                  <Link href={li.href} style={{ fontSize: ".6rem", letterSpacing: ".12em", color: "var(--text)", textDecoration: "none", transition: "color .3s, padding-left .3s", display: "block" }}
                    onMouseEnter={e => { e.currentTarget.style.color = "var(--gold)"; e.currentTarget.style.paddingLeft = "6px"; }}
                    onMouseLeave={e => { e.currentTarget.style.color = "var(--text)"; e.currentTarget.style.paddingLeft = "0"; }}>
                    {li.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="footer-bottom">
        <p className="footer-copy">© 2024 Fynekings International Ltd · All rights reserved</p>
        <div className="footer-social">
          <a href="https://www.instagram.com/?utm_source=pwa_homescreen&__pwa=1" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" />
            </svg>
          </a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
            </svg>
          </a>
          <a href="https://wa.me/2348033376287" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21 11.5a8.4 8.4 0 01-1.2 4.3 8.5 8.5 0 01-7.3 4.2 8.4 8.4 0 01-4.3-1.2L3 21l2.3-5.2a8.4 8.4 0 01-1.2-4.3 8.5 8.5 0 014.2-7.3 8.4 8.4 0 014.3-1.2A8.5 8.5 0 0121 11.5z" />
            </svg>
          </a>
        </div>
      </div>
      <div className="footer-watermark">FYNEKINGS</div>
    </footer>
  );
}