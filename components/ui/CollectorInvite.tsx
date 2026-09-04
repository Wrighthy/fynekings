"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/authStore";
import { useCart } from "@/lib/store";

// localStorage record: { subscribed?: boolean, dismissedAt?: number }
const STORAGE_KEY = "fynekings-collector-invite";
const DISMISSAL_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000; // re-invite after 7 days
const SHOW_DELAY_MS = 18_000; // let them browse a while first — subtle, not ambush

// Never nudge on these — admin is staff, checkout is mid-purchase
const QUIET_PATHS = ["/admin", "/checkout"];

function readRecord(): { subscribed?: boolean; dismissedAt?: number } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as { subscribed?: boolean; dismissedAt?: number }) : {};
  } catch {
    return {};
  }
}

function writeRecord(record: { subscribed?: boolean; dismissedAt?: number }) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
  } catch {
    // Private browsing etc. — the nudge just won't persist suppression
  }
}

export default function CollectorInvite() {
  const pathname = usePathname();
  const { user, authOpen, setAuthOpen } = useAuth();
  const { showToast } = useCart();

  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const { subscribed, dismissedAt } = readRecord();
    if (subscribed) return;
    if (dismissedAt && Date.now() - dismissedAt < DISMISSAL_COOLDOWN_MS) return;
    if (QUIET_PATHS.some((p) => pathname.startsWith(p))) return;

    const timer = setTimeout(() => {
      // Skip if they signed in or another modal is open by the time we fire
      const { user: currentUser } = useAuth.getState();
      if (currentUser || useAuth.getState().authOpen) return;
      setVisible(true);
    }, SHOW_DELAY_MS);

    return () => clearTimeout(timer);
  }, [pathname]);

  const dismiss = () => {
    const { subscribed } = readRecord();
    writeRecord({ subscribed, dismissedAt: Date.now() });
    setVisible(false);
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        writeRecord({ subscribed: true });
        showToast("✓ Welcome to the Collector Club");
        setVisible(false);
      } else {
        setError(data.error || "Something went wrong. Please try again.");
      }
    } catch {
      setError("Network error — please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const openRegister = () => {
    dismiss();
    setAuthOpen(true, "register");
  };

  // Stay out of the way once they're signed in or the auth modal is up
  if (!visible || user || authOpen) return null;

  return (
    <div
      role="dialog"
      aria-label="Join the Collector Club"
      style={{
        position: "fixed",
        bottom: "24px",
        left: "24px",
        maxWidth: "340px",
        background: "rgba(12, 12, 12, 0.94)",
        backdropFilter: "blur(20px)",
        border: "1px solid var(--gold-dk)",
        padding: "24px",
        zIndex: 9970,
        boxShadow: "0 20px 40px rgba(0,0,0,0.8)",
        animation: "fadeUp .4s ease",
      }}
    >
      <button
        onClick={dismiss}
        aria-label="Dismiss"
        style={{
          position: "absolute",
          top: "10px",
          right: "12px",
          background: "none",
          border: "none",
          color: "var(--muted)",
          fontSize: ".9rem",
          cursor: "pointer",
          lineHeight: 1,
        }}
      >
        ✕
      </button>

      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
        <span style={{ color: "var(--gold)", fontSize: ".8rem" }}>✦</span>
        <span style={{ fontSize: ".5rem", letterSpacing: ".35em", color: "var(--gold)", textTransform: "uppercase" }}>
          The Collector Club
        </span>
      </div>

      <p style={{ fontFamily: "Playfair Display, serif", fontSize: "1.15rem", color: "var(--text)", lineHeight: 1.4, marginBottom: "8px" }}>
        First to know. First to own.
      </p>
      <p style={{ fontSize: ".6rem", letterSpacing: ".08em", lineHeight: 1.8, color: "var(--muted)", marginBottom: "16px" }}>
        Join for private drop access, limited edition allocations, and collector-only pricing.
      </p>

      <form onSubmit={handleSubscribe} style={{ marginBottom: "14px" }}>
        <div style={{ display: "flex", gap: "8px" }}>
          <input
            type="email"
            required
            placeholder="Your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              flex: 1,
              padding: "10px 12px",
              background: "var(--black)",
              border: "1px solid var(--dark4)",
              color: "var(--text)",
              fontSize: ".7rem",
              outline: "none",
              minWidth: 0,
            }}
          />
          <button
            type="submit"
            disabled={submitting}
            style={{
              padding: "10px 18px",
              background: "var(--gold)",
              border: "none",
              color: "var(--black)",
              fontSize: ".5rem",
              letterSpacing: ".2em",
              textTransform: "uppercase",
              fontWeight: 600,
              cursor: submitting ? "wait" : "pointer",
            }}
          >
            {submitting ? "Joining…" : "Join"}
          </button>
        </div>
        {error && <div style={{ fontSize: ".58rem", color: "#ff6b6b", marginTop: "8px" }}>{error}</div>}
      </form>

      <button
        onClick={openRegister}
        style={{
          background: "none",
          border: "none",
          color: "var(--gold)",
          fontSize: ".55rem",
          letterSpacing: ".15em",
          textTransform: "uppercase",
          cursor: "pointer",
          padding: 0,
          textDecoration: "underline",
          textUnderlineOffset: "3px",
        }}
      >
        Or create an account →
      </button>
    </div>
  );
}
