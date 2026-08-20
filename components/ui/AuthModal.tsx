"use client";

import { useState } from "react";
import { useAuth } from "@/lib/authStore";

export default function AuthModal() {
  const { authOpen, authMode, setAuthOpen, setUser } = useAuth();
  const [mode, setMode] = useState<"login" | "register">(authMode);

  const [form, setForm] = useState({
    email: "",
    password: "",
    name: "",
    phone: "",
    shippingAddress: "",
    city: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!authOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (res.ok && data.user) {
        setUser(data.user);
        setAuthOpen(false);
      } else {
        setError(data.error || "Authentication failed.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={() => setAuthOpen(false)}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(5, 5, 5, 0.92)",
        backdropFilter: "blur(16px)",
        zIndex: 9990,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        animation: "fadeIn .25s ease",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "480px",
          width: "100%",
          background: "var(--dark)",
          border: "1px solid var(--gold-dk)",
          padding: "36px 32px",
          position: "relative",
        }}
      >
        <button
          onClick={() => setAuthOpen(false)}
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            background: "none",
            border: "1px solid var(--gold-dk)",
            color: "var(--gold)",
            width: "32px",
            height: "32px",
            cursor: "pointer",
          }}
        >
          ✕
        </button>

        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div style={{ fontSize: ".45rem", letterSpacing: ".4em", color: "var(--gold)", textTransform: "uppercase", marginBottom: "8px" }}>
            Atelier Collector Portal
          </div>
          <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: "2rem", color: "var(--white)", fontWeight: 300 }}>
            {mode === "login" ? "Sign In" : "Create Account"}
          </h2>
        </div>

        {error && (
          <div style={{ padding: "12px", background: "rgba(139, 32, 32, 0.2)", border: "1px solid var(--crimson)", color: "#ff6b6b", fontSize: ".65rem", marginBottom: "20px", textAlign: "center" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {mode === "register" && (
            <div>
              <label style={{ display: "block", fontSize: ".48rem", letterSpacing: ".2em", color: "var(--muted)", textTransform: "uppercase", marginBottom: "6px" }}>Full Name *</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Prince Olayemi"
                style={{ width: "100%", padding: "12px 14px", background: "var(--dark2)", border: "1px solid var(--dark4)", color: "var(--white)", fontSize: ".8rem", outline: "none" }}
              />
            </div>
          )}

          <div>
            <label style={{ display: "block", fontSize: ".48rem", letterSpacing: ".2em", color: "var(--muted)", textTransform: "uppercase", marginBottom: "6px" }}>Email Address *</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="olayemi@example.com"
              style={{ width: "100%", padding: "12px 14px", background: "var(--dark2)", border: "1px solid var(--dark4)", color: "var(--white)", fontSize: ".8rem", outline: "none" }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: ".48rem", letterSpacing: ".2em", color: "var(--muted)", textTransform: "uppercase", marginBottom: "6px" }}>Password *</label>
            <input
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••••••"
              style={{ width: "100%", padding: "12px 14px", background: "var(--dark2)", border: "1px solid var(--dark4)", color: "var(--white)", fontSize: ".8rem", outline: "none" }}
            />
          </div>

          {mode === "register" && (
            <>
              <div>
                <label style={{ display: "block", fontSize: ".48rem", letterSpacing: ".2em", color: "var(--muted)", textTransform: "uppercase", marginBottom: "6px" }}>Phone / WhatsApp</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+234 803 000 0000"
                  style={{ width: "100%", padding: "12px 14px", background: "var(--dark2)", border: "1px solid var(--dark4)", color: "var(--white)", fontSize: ".8rem", outline: "none" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: ".48rem", letterSpacing: ".2em", color: "var(--muted)", textTransform: "uppercase", marginBottom: "6px" }}>Default Delivery Address</label>
                <input
                  type="text"
                  value={form.shippingAddress}
                  onChange={(e) => setForm({ ...form, shippingAddress: e.target.value })}
                  placeholder="Ahmadu Bello Way, Victoria Island"
                  style={{ width: "100%", padding: "12px 14px", background: "var(--dark2)", border: "1px solid var(--dark4)", color: "var(--white)", fontSize: ".8rem", outline: "none" }}
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "16px",
              background: "var(--gold)",
              color: "var(--black)",
              border: "none",
              fontSize: ".58rem",
              letterSpacing: ".3em",
              textTransform: "uppercase",
              fontWeight: 600,
              cursor: loading ? "wait" : "none",
              marginTop: "8px",
            }}
          >
            {loading ? "Processing..." : mode === "login" ? "Sign In →" : "Create Account →"}
          </button>
        </form>

        <div style={{ marginTop: "24px", textAlign: "center", borderTop: "1px solid var(--dark3)", paddingTop: "16px" }}>
          {mode === "login" ? (
            <span style={{ fontSize: ".6rem", color: "var(--muted)" }}>
              Don&rsquo;t have an account?{" "}
              <button onClick={() => setMode("register")} style={{ background: "none", border: "none", color: "var(--gold)", cursor: "pointer", textDecoration: "underline" }}>
                Create one now
              </button>
            </span>
          ) : (
            <span style={{ fontSize: ".6rem", color: "var(--muted)" }}>
              Already registered?{" "}
              <button onClick={() => setMode("login")} style={{ background: "none", border: "none", color: "var(--gold)", cursor: "pointer", textDecoration: "underline" }}>
                Sign In
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
