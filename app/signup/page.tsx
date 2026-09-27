"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Nav from "@/components/sections/Nav";
import Footer from "@/components/sections/Footer";
import { useAuth } from "@/lib/authStore";
import { useWishlist } from "@/lib/wishlistStore";
import { sanitizeRedirectUrl } from "@/components/ui/ProtectedRoute";

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawRedirect = searchParams.get("redirect");
  const returnUrl = sanitizeRedirectUrl(rawRedirect, "/account");

  const { user, signup, isInitialized, refreshUser, pendingWishlistSlug, setPendingWishlistSlug } = useAuth();
  const { addToWishlist, syncWithServer } = useWishlist();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    shippingAddress: "",
    city: "Lagos",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isInitialized) {
      refreshUser();
    }
  }, [isInitialized, refreshUser]);

  useEffect(() => {
    if (user) {
      router.replace(returnUrl);
    }
  }, [user, returnUrl, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim() || !form.email.trim() || !form.password) {
      setError("Please complete all required fields.");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match. Please verify.");
      return;
    }

    setLoading(true);

    const res = await signup({
      name: form.name.trim(),
      email: form.email.trim(),
      password: form.password,
      phone: form.phone.trim() || undefined,
      shippingAddress: form.shippingAddress.trim() || undefined,
      city: form.city.trim() || undefined,
    });

    if (res.success) {
      await syncWithServer();
      if (pendingWishlistSlug) {
        await addToWishlist(pendingWishlistSlug, true);
        setPendingWishlistSlug(null);
      }
      router.push(returnUrl);
    } else {
      setError(res.error || "Failed to create account.");
      setLoading(false);
    }
  };

  return (
    <div style={{ background: "var(--black)", minHeight: "100vh", fontFamily: "Raleway, sans-serif" }}>
      <Nav />

      <div style={{ padding: "160px 24px 100px", maxWidth: "520px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div
            style={{
              fontSize: ".52rem",
              letterSpacing: ".45em",
              color: "var(--gold)",
              textTransform: "uppercase",
              marginBottom: "12px",
            }}
          >
            Atelier Membership
          </div>
          <h1
            style={{
              fontFamily: "Playfair Display, serif",
              fontSize: "clamp(2rem, 4vw, 2.6rem)",
              fontWeight: 300,
              color: "var(--white)",
              marginBottom: "10px",
            }}
          >
            Create <em style={{ fontStyle: "italic", color: "var(--gold)" }}>Account</em>
          </h1>
          <p style={{ fontSize: ".72rem", letterSpacing: ".08em", color: "var(--muted)", lineHeight: 1.8 }}>
            Join the FYNEKINGS client community to track orders, save timepieces, and access private events.
          </p>
        </div>

        {error && (
          <div
            style={{
              background: "rgba(220, 53, 69, 0.12)",
              border: "1px solid rgba(220, 53, 69, 0.4)",
              color: "#ff6b6b",
              padding: "14px 18px",
              fontSize: ".75rem",
              marginBottom: "24px",
              textAlign: "center",
              letterSpacing: ".04em",
            }}
          >
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          style={{
            background: "var(--dark2)",
            border: "1px solid var(--dark3)",
            padding: "36px 32px",
            boxShadow: "0 20px 50px rgba(0,0,0,0.6)",
          }}
        >
          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                fontSize: ".55rem",
                letterSpacing: ".25em",
                textTransform: "uppercase",
                color: "var(--gold)",
                marginBottom: "8px",
              }}
            >
              Full Name *
            </label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Lord Alexander Sterling"
              style={{
                width: "100%",
                background: "var(--dark)",
                border: "1px solid var(--dark3)",
                color: "var(--white)",
                padding: "14px 16px",
                fontSize: ".85rem",
                outline: "none",
                transition: "border-color .2s",
                fontFamily: "inherit",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "var(--gold)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "var(--dark3)")}
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                fontSize: ".55rem",
                letterSpacing: ".25em",
                textTransform: "uppercase",
                color: "var(--gold)",
                marginBottom: "8px",
              }}
            >
              Email Address *
            </label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="client@fynekings.com"
              style={{
                width: "100%",
                background: "var(--dark)",
                border: "1px solid var(--dark3)",
                color: "var(--white)",
                padding: "14px 16px",
                fontSize: ".85rem",
                outline: "none",
                transition: "border-color .2s",
                fontFamily: "inherit",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "var(--gold)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "var(--dark3)")}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: ".55rem",
                  letterSpacing: ".25em",
                  textTransform: "uppercase",
                  color: "var(--gold)",
                  marginBottom: "8px",
                }}
              >
                Password *
              </label>
              <input
                type="password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Min. 6 chars"
                style={{
                  width: "100%",
                  background: "var(--dark)",
                  border: "1px solid var(--dark3)",
                  color: "var(--white)",
                  padding: "14px 16px",
                  fontSize: ".85rem",
                  outline: "none",
                  transition: "border-color .2s",
                  fontFamily: "inherit",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "var(--gold)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "var(--dark3)")}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: ".55rem",
                  letterSpacing: ".25em",
                  textTransform: "uppercase",
                  color: "var(--gold)",
                  marginBottom: "8px",
                }}
              >
                Confirm Password *
              </label>
              <input
                type="password"
                required
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                placeholder="Repeat password"
                style={{
                  width: "100%",
                  background: "var(--dark)",
                  border: "1px solid var(--dark3)",
                  color: "var(--white)",
                  padding: "14px 16px",
                  fontSize: ".85rem",
                  outline: "none",
                  transition: "border-color .2s",
                  fontFamily: "inherit",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "var(--gold)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "var(--dark3)")}
              />
            </div>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                fontSize: ".55rem",
                letterSpacing: ".25em",
                textTransform: "uppercase",
                color: "var(--gold)",
                marginBottom: "8px",
              }}
            >
              Phone Number (Optional)
            </label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+234 800 000 0000"
              style={{
                width: "100%",
                background: "var(--dark)",
                border: "1px solid var(--dark3)",
                color: "var(--white)",
                padding: "14px 16px",
                fontSize: ".85rem",
                outline: "none",
                transition: "border-color .2s",
                fontFamily: "inherit",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "var(--gold)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "var(--dark3)")}
            />
          </div>

          <div style={{ marginBottom: "28px" }}>
            <label
              style={{
                display: "block",
                fontSize: ".55rem",
                letterSpacing: ".25em",
                textTransform: "uppercase",
                color: "var(--gold)",
                marginBottom: "8px",
              }}
            >
              Default Delivery Address (Optional)
            </label>
            <input
              type="text"
              value={form.shippingAddress}
              onChange={(e) => setForm({ ...form, shippingAddress: e.target.value })}
              placeholder="e.g. 14 Victoria Island, Lagos"
              style={{
                width: "100%",
                background: "var(--dark)",
                border: "1px solid var(--dark3)",
                color: "var(--white)",
                padding: "14px 16px",
                fontSize: ".85rem",
                outline: "none",
                transition: "border-color .2s",
                fontFamily: "inherit",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "var(--gold)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "var(--dark3)")}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{
              width: "100%",
              justifyContent: "center",
              padding: "16px",
              fontSize: ".75rem",
              letterSpacing: ".2em",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "CREATING CLIENT PROFILE..." : "REGISTER ATELIER ACCOUNT"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "32px", fontSize: ".75rem", color: "var(--muted)" }}>
          Already have an account?{" "}
          <Link
            href={`/login${rawRedirect ? `?redirect=${encodeURIComponent(rawRedirect)}` : ""}`}
            style={{ color: "var(--gold)", textDecoration: "underline", letterSpacing: ".05em" }}
          >
            Sign In
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div style={{ background: "var(--black)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--gold)" }}>
          Loading Portal...
        </div>
      }
    >
      <SignupForm />
    </Suspense>
  );
}
