"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Nav from "@/components/sections/Nav";
import Footer from "@/components/sections/Footer";
import { useAuth } from "@/lib/authStore";
import { useWishlist } from "@/lib/wishlistStore";
import { sanitizeRedirectUrl } from "@/components/ui/ProtectedRoute";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawRedirect = searchParams.get("redirect");
  const returnUrl = sanitizeRedirectUrl(rawRedirect, "/account");

  const { user, login, isInitialized, refreshUser, pendingWishlistSlug, setPendingWishlistSlug } = useAuth();
  const { addToWishlist, syncWithServer } = useWishlist();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
    if (!email || !password) {
      setError("Please provide both email and password.");
      return;
    }

    setLoading(true);
    setError("");

    const res = await login(email, password);
    if (res.success) {
      // Sync wishlist
      await syncWithServer();
      if (pendingWishlistSlug) {
        await addToWishlist(pendingWishlistSlug, true);
        setPendingWishlistSlug(null);
      }
      router.push(returnUrl);
    } else {
      setError(res.error || "Invalid email or password.");
      setLoading(false);
    }
  };

  return (
    <div style={{ background: "var(--black)", minHeight: "100vh", fontFamily: "Raleway, sans-serif" }}>
      <Nav />

      <div style={{ padding: "160px 24px 100px", maxWidth: "480px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div
            style={{
              fontSize: "14px",
              letterSpacing: ".12em",
              color: "var(--gold)",
              textTransform: "uppercase",
              marginBottom: "12px",
            }}
          >
            Client Access Portal
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
            Sign <em style={{ fontStyle: "italic", color: "var(--gold)" }}>In</em>
          </h1>
          <p style={{ fontSize: "15px", letterSpacing: ".08em", color: "var(--muted)", lineHeight: 1.8 }}>
            Access your private timepiece acquisitions, curated wishlist, and order status.
          </p>
        </div>

        {error && (
          <div
            style={{
              background: "rgba(220, 53, 69, 0.12)",
              border: "1px solid rgba(220, 53, 69, 0.4)",
              color: "#ff6b6b",
              padding: "14px 18px",
              fontSize: "15px",
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
                fontSize: "14px",
                letterSpacing: ".12em",
                textTransform: "uppercase",
                color: "var(--gold)",
                marginBottom: "8px",
              }}
            >
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="client@fynekings.com"
              style={{
                width: "100%",
                background: "var(--dark)",
                border: "1px solid var(--dark3)",
                color: "var(--white)",
                padding: "14px 16px",
                fontSize: "15px",
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
                fontSize: "14px",
                letterSpacing: ".12em",
                textTransform: "uppercase",
                color: "var(--gold)",
                marginBottom: "8px",
              }}
            >
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              style={{
                width: "100%",
                background: "var(--dark)",
                border: "1px solid var(--dark3)",
                color: "var(--white)",
                padding: "14px 16px",
                fontSize: "15px",
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
              fontSize: "15px",
              letterSpacing: ".2em",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "AUTHENTICATING..." : "SIGN IN TO PORTAL"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "32px", fontSize: "15px", color: "var(--muted)" }}>
          New to FYNEKINGS?{" "}
          <Link
            href={`/signup${rawRedirect ? `?redirect=${encodeURIComponent(rawRedirect)}` : ""}`}
            style={{ color: "var(--gold)", textDecoration: "underline", letterSpacing: ".05em" }}
          >
            Create an Account
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div style={{ background: "var(--black)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--gold)" }}>
          Loading Portal...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
