"use client";
import Link from "next/link";
import Image from "next/image";

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
      { label: "About Fynekings", href: "/about" },
      { label: "Track Order", href: "/orders/track" },
      { label: "My Account", href: "/account" },
      { label: "Watch Education", href: "/journal" },
      { label: "Lagos Gallery & Archive", href: "/about" },
    ]
  },
  {
    h: "Service", l: [
      { label: "Shipping Policy", href: "/shipping-policy" },
      { label: "Return Policy", href: "/return-policy" },
      { label: "Contact Concierge", href: "/contact" },
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
            <Image
              src="/fynekings-crest.png"
              alt="Fyne Kings Crest"
              width={34}
              height={34}
              className="logo-mark"
            />
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
          <a href="https://www.instagram.com/fynekings.intltd?psln=MW5kc2dycDh1cXFlNA%3D%3D&utm_source=qr" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" />
            </svg>
          </a>
          <a href="https://www.facebook.com/share/18neq4aC9N/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
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