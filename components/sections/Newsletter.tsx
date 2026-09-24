"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useCart } from "@/lib/store";
import { useAuth } from "@/lib/authStore";

const PERKS = [
  "Early Drop Access",
  "Collector Newsletter",
  "Private Sale Invites",
  "Watch Education Series",
];

type EnrolledState = "idle" | "checking" | "enrolled" | "not-enrolled";

export default function Newsletter() {
  const emailRef = useRef<HTMLInputElement>(null);
  const showToast = useCart(s => s.showToast);
  const [loading, setLoading] = useState(false);
  const [enrolledState, setEnrolledState] = useState<EnrolledState>("idle");
  const { user, isInitialized } = useAuth();

  // Check enrollment status for a given email against the DB
  const checkEnrollment = useCallback(async (email: string) => {
    if (!email || !email.includes("@")) return;
    setEnrolledState("checking");
    try {
      const res = await fetch(
        `/api/newsletter/check?email=${encodeURIComponent(email.toLowerCase().trim())}`
      );
      const data = await res.json();
      setEnrolledState(data.enrolled ? "enrolled" : "not-enrolled");
    } catch {
      setEnrolledState("not-enrolled");
    }
  }, []);

  // Auto-check if a logged-in user's email is enrolled
  useEffect(() => {
    if (!isInitialized) return;
    if (user?.isInnerCircle) {
      // Already marked in the User record — no need to fetch
      setEnrolledState("enrolled");
      return;
    }
    if (user?.email) {
      checkEnrollment(user.email);
    }
  }, [user, isInitialized, checkEnrollment]);

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
        setEnrolledState("enrolled");
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

        {enrolledState === "enrolled" ? (
          <div className="enlisted-badge">
            <div className="enlisted-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="enlisted-text">
              <span className="enlisted-title">Already in the Circle</span>
              <span className="enlisted-sub">
                {user?.email
                  ? `${user.email} is enlisted in the Collector Club`
                  : "You're enlisted in the Fynekings Collector Club"}
              </span>
            </div>
          </div>
        ) : (
          <div className="email-form">
            <input
              ref={emailRef}
              type="email"
              className="email-input"
              placeholder="Your email address"
              onKeyDown={e => e.key === "Enter" && subscribe()}
              onBlur={e => {
                const val = e.target.value;
                if (val && val.includes("@")) checkEnrollment(val);
              }}
            />
            <button
              className="email-btn"
              onClick={subscribe}
              disabled={loading || enrolledState === "checking"}
              style={{ opacity: loading || enrolledState === "checking" ? 0.7 : 1 }}
            >
              {loading ? "Joining..." : enrolledState === "checking" ? "Checking..." : "Join Club →"}
            </button>
          </div>
        )}

        <p className="newsletter-fineprint">No spam · One email per fortnight · Unsubscribe anytime</p>
      </div>
    </section>
  );
}