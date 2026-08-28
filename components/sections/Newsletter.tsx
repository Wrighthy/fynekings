"use client";

import { useRef, useState } from "react";
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
  const [loading, setLoading] = useState(false);

  const subscribe = async () => {
    const email = emailRef.current?.value || "";

    if (!email.includes("@")) {
      showToast("Please enter a valid email");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        showToast("Welcome to the Collector Club!");
        if (emailRef.current) emailRef.current.value = "";
      } else {
        showToast(data.error || "Something went wrong");
      }
    } catch {
      showToast("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
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
          First access to limited drops, exclusive collector content, early customization slots, and private sale invitations from our Lagos horological gallery.
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
          <input
            ref={emailRef}
            type="email"
            className="email-input"
            placeholder="Your email address"
            onKeyDown={e => e.key === "Enter" && subscribe()}
          />
          <button
            className="email-btn"
            onClick={subscribe}
            disabled={loading}
            style={{ opacity: loading ? 0.7 : 1 }}
          >
            {loading ? "Joining..." : "Join Club →"}
          </button>
        </div>
        <p className="newsletter-fineprint">No spam · One email per fortnight · Unsubscribe anytime</p>
      </div>
    </section>
  );
}