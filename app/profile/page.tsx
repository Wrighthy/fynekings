"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Nav from "@/components/sections/Nav";
import Footer from "@/components/sections/Footer";
import ProtectedRoute from "@/components/ui/ProtectedRoute";
import { useAuth } from "@/lib/authStore";

function ProfileContent() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    shippingAddress: user?.shippingAddress || "",
    city: user?.city || "Lagos",
    country: user?.country || "Nigeria",
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        phone: user.phone || "",
        shippingAddress: user.shippingAddress || "",
        city: user.city || "Lagos",
        country: user.country || "Nigeria",
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess("");
    setError("");

    try {
      const res = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok && data?.user) {
        setUser(data.user);
        setSuccess("Your collector profile and delivery details have been updated.");
      } else {
        setError(data?.error || "Failed to update profile.");
      }
    } catch {
      setError("Network error while saving profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ background: "var(--black)", minHeight: "100vh", fontFamily: "Raleway, sans-serif" }}>
      <Nav />

      <div style={{ padding: "160px 24px 100px", maxWidth: "600px", margin: "0 auto" }}>
        <div style={{ marginBottom: "32px" }}>
          <Link href="/account" style={{ fontSize: ".52rem", letterSpacing: ".25em", color: "var(--gold)", textTransform: "uppercase", textDecoration: "none" }}>
            ← Back to Account
          </Link>
          <h1 style={{ fontFamily: "Playfair Display, serif", fontSize: "2.4rem", color: "var(--white)", fontWeight: 300, marginTop: "16px" }}>
            Collector <em style={{ fontStyle: "italic", color: "var(--gold)" }}>Profile</em>
          </h1>
          <p style={{ fontSize: ".72rem", color: "var(--muted)", marginTop: "6px" }}>
            Manage your personal identity, contact numbers, and delivery destination.
          </p>
        </div>

        {success && (
          <div
            style={{
              background: "rgba(201, 168, 76, 0.15)",
              border: "1px solid var(--gold)",
              color: "var(--gold)",
              padding: "14px 18px",
              fontSize: ".75rem",
              marginBottom: "24px",
            }}
          >
            ✓ {success}
          </div>
        )}

        {error && (
          <div
            style={{
              background: "rgba(220, 53, 69, 0.12)",
              border: "1px solid rgba(220, 53, 69, 0.4)",
              color: "#ff6b6b",
              padding: "14px 18px",
              fontSize: ".75rem",
              marginBottom: "24px",
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
            padding: "36px",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }}
        >
          <div>
            <label style={{ display: "block", fontSize: ".55rem", letterSpacing: ".25em", color: "var(--gold)", textTransform: "uppercase", marginBottom: "8px" }}>
              Email Address (Permanent ID)
            </label>
            <input
              type="email"
              disabled
              value={user?.email || ""}
              style={{
                width: "100%",
                background: "var(--dark3)",
                border: "1px solid var(--dark4)",
                color: "var(--muted)",
                padding: "14px",
                fontSize: ".85rem",
                cursor: "not-allowed",
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: ".55rem", letterSpacing: ".25em", color: "var(--gold)", textTransform: "uppercase", marginBottom: "8px" }}>
              Full Name
            </label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              style={{
                width: "100%",
                background: "var(--dark)",
                border: "1px solid var(--dark3)",
                color: "var(--white)",
                padding: "14px",
                fontSize: ".85rem",
                outline: "none",
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: ".55rem", letterSpacing: ".25em", color: "var(--gold)", textTransform: "uppercase", marginBottom: "8px" }}>
              Phone Number
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
                padding: "14px",
                fontSize: ".85rem",
                outline: "none",
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: ".55rem", letterSpacing: ".25em", color: "var(--gold)", textTransform: "uppercase", marginBottom: "8px" }}>
              Shipping Street Address
            </label>
            <input
              type="text"
              value={form.shippingAddress}
              onChange={(e) => setForm({ ...form, shippingAddress: e.target.value })}
              placeholder="e.g. 14 Victoria Island"
              style={{
                width: "100%",
                background: "var(--dark)",
                border: "1px solid var(--dark3)",
                color: "var(--white)",
                padding: "14px",
                fontSize: ".85rem",
                outline: "none",
              }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: ".55rem", letterSpacing: ".25em", color: "var(--gold)", textTransform: "uppercase", marginBottom: "8px" }}>
                City
              </label>
              <input
                type="text"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                style={{
                  width: "100%",
                  background: "var(--dark)",
                  border: "1px solid var(--dark3)",
                  color: "var(--white)",
                  padding: "14px",
                  fontSize: ".85rem",
                  outline: "none",
                }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: ".55rem", letterSpacing: ".25em", color: "var(--gold)", textTransform: "uppercase", marginBottom: "8px" }}>
                Country
              </label>
              <input
                type="text"
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
                style={{
                  width: "100%",
                  background: "var(--dark)",
                  border: "1px solid var(--dark3)",
                  color: "var(--white)",
                  padding: "14px",
                  fontSize: ".85rem",
                  outline: "none",
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="btn-primary"
            style={{
              marginTop: "12px",
              padding: "16px",
              justifyContent: "center",
              fontSize: ".75rem",
              letterSpacing: ".2em",
              cursor: saving ? "not-allowed" : "pointer",
            }}
          >
            {saving ? "SAVING CHANGES..." : "SAVE PROFILE"}
          </button>
        </form>
      </div>

      <Footer />
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}
