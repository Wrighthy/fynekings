"use client";

import { useRef } from "react";
import { useCart } from "@/lib/store";

const PERKS = [
  "Early Drop Access",
  "Collector Newsletter",
  "Private Sale Invites",
  "Watch Education Series",
];

export default function Newsletter() {
  const emailRef = useRef<HTMLInputElement>(null);
  const showToast = useCart(s => s.showToast);

  const subscribe = () => {
    const v = emailRef.current?.value || "";
    if (!v.includes("@")) { showToast("Please enter a valid email"); return; }
    showToast("Welcome to the Collector Club!");
    if (emailRef.current) emailRef.current.value = "";
  };

  return (
    <section id="newsletter">
      <div className="newsletter-inner reveal">
        <div className="club-badge">
          <div className="club-dot"></div>
          <span className="club-label">Fynekings Collector Club</span>
          <div className="club-dot"></div>
        </div>
        <h2 className="sec-title" style={{ fontSize: "clamp(2rem, 4vw, 3.4rem)" }}>
          Join the Inner <em>Circle</em>
        </h2>
        <p className="sec-desc" style={{ margin: "20px auto 0", textAlign: "center" }}>
          First access to limited drops, exclusive collector content, early customization slots, and private sale invitations from our Lagos atelier.
        </p>
        <div className="perks">
          {PERKS.map(p => (
            <span key={p} className="perk">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 13l4 4L19 7"/>
              </svg>
              {p}
            </span>
          ))}
        </div>
        <div className="email-form">
          <input ref={emailRef} type="email" className="email-input" placeholder="Your email address"/>
          <button className="email-btn" onClick={subscribe}>Join Club →</button>
        </div>
        <p className="newsletter-fineprint">No spam · One email per fortnight · Unsubscribe anytime</p>
      </div>
    </section>
  );
}