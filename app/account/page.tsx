"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Nav from "@/components/sections/Nav";
import Footer from "@/components/sections/Footer";
import AuthModal from "@/components/ui/AuthModal";
import { useAuth } from "@/lib/authStore";
import { fmt } from "@/lib/store";

type OrderItem = {
  id: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  shippingAddress: string;
  city: string;
  country: string;
  product?: {
    name: string;
    series: string;
    images: string[];
  } | null;
};

export default function AccountPage() {
  const { user, setUser, logout, setAuthOpen } = useAuth();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<OrderItem[]>([]);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data && data.user) {
          setUser(data.user);
          if (data.user.orders) {
            setOrders(data.user.orders);
          }
        } else {
          setUser(null);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [setUser]);

  if (loading) {
    return (
      <div style={{ background: "var(--black)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontFamily: "Playfair Display, serif", color: "var(--gold)" }}>Loading Account Portal...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ background: "var(--black)", minHeight: "100vh", fontFamily: "Raleway, sans-serif" }}>
        <Nav />
        <div style={{ padding: "180px 24px 100px", maxWidth: "600px", margin: "0 auto", textAlign: "center" }}>
          <div style={{ fontSize: ".5rem", letterSpacing: ".4em", color: "var(--gold)", textTransform: "uppercase", marginBottom: "16px" }}>
            Atelier Collector Access
          </div>
          <h1 style={{ fontFamily: "Playfair Display, serif", fontSize: "2.8rem", color: "var(--white)", fontWeight: 300, marginBottom: "20px" }}>
            Sign In Required
          </h1>
          <p style={{ fontSize: ".7rem", lineHeight: 2, color: "var(--muted)", marginBottom: "32px" }}>
            Please sign in to view your watch orders, 5-Year warranty status, and saved shipping preferences.
          </p>
          <button
            onClick={() => setAuthOpen(true, "login")}
            className="btn-primary"
            style={{ margin: "0 auto" }}
          >
            <span>Sign In / Create Account →</span>
          </button>
        </div>
        <AuthModal />
        <Footer />
      </div>
    );
  }

  return (
    <div style={{ background: "var(--black)", minHeight: "100vh", fontFamily: "Raleway, sans-serif" }}>
      <Nav />

      {/* Header */}
      <div style={{ padding: "160px 24px 60px", maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "20px" }}>
          <div>
            <div style={{ fontSize: ".5rem", letterSpacing: ".4em", color: "var(--gold)", textTransform: "uppercase", marginBottom: "8px" }}>
              Collector Portal
            </div>
            <h1 style={{ fontFamily: "Playfair Display, serif", fontSize: "clamp(2.2rem, 5vw, 3.5rem)", color: "var(--white)", fontWeight: 300 }}>
              Welcome back, <em style={{ fontStyle: "italic", color: "var(--gold)" }}>{user.name}</em>
            </h1>
          </div>
          <button
            onClick={() => logout()}
            style={{
              padding: "10px 20px",
              background: "transparent",
              border: "1px solid var(--dark4)",
              color: "var(--muted)",
              fontSize: ".52rem",
              letterSpacing: ".2em",
              textTransform: "uppercase",
              cursor: "pointer",
            }}
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px 100px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 340px), 1fr))", gap: "40px", alignItems: "start" }}>
        {/* Left: Orders */}
        <div style={{ gridColumn: "span 2" }}>
          <div style={{ fontSize: ".55rem", letterSpacing: ".3em", color: "var(--gold)", textTransform: "uppercase", marginBottom: "20px" }}>
            Acquisition History ({orders.length})
          </div>

          {orders.length === 0 ? (
            <div style={{ background: "var(--dark2)", border: "1px solid var(--dark3)", padding: "40px", textAlign: "center" }}>
              <p style={{ fontSize: ".7rem", color: "var(--muted)", marginBottom: "20px" }}>You have no watch orders recorded yet.</p>
              <Link href="/collection" className="btn-primary" style={{ display: "inline-flex" }}>
                <span>Explore Timepiece Collection</span>
              </Link>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {orders.map((o) => (
                <div key={o.id} style={{ background: "var(--dark2)", border: "1px solid var(--dark3)", padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--dark4)", paddingBottom: "12px" }}>
                    <div>
                      <div style={{ fontSize: ".45rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".2em" }}>Order Reference</div>
                      <div style={{ fontFamily: "Playfair Display, serif", fontSize: "1.1rem", color: "var(--white)" }}>#{o.id.slice(-8).toUpperCase()}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span style={{ fontSize: ".48rem", letterSpacing: ".2em", textTransform: "uppercase", padding: "4px 10px", background: "var(--dark3)", border: "1px solid var(--gold-dk)", color: "var(--gold)" }}>
                        {o.status}
                      </span>
                      <div style={{ fontSize: ".5rem", color: "var(--muted)", marginTop: "4px" }}>
                        {new Date(o.createdAt).toLocaleDateString("en-NG", { month: "short", day: "numeric", year: "numeric" })}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                    <div style={{ width: "64px", height: "64px", background: "var(--dark3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {o.product?.images?.[0] ? (
                        <img src={o.product.images[0]} alt={o.product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <span style={{ fontSize: "1.2rem", color: "var(--gold)" }}>⌚</span>
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: "Playfair Display, serif", fontSize: "1.1rem", color: "var(--white)" }}>{o.product?.name || "Custom Fynekings Watch"}</div>
                      <div style={{ fontSize: ".55rem", color: "var(--muted)", textTransform: "uppercase" }}>{o.shippingAddress}, {o.city}</div>
                    </div>
                    <div style={{ fontFamily: "Playfair Display, serif", fontSize: "1.3rem", color: "var(--gold)" }}>
                      {fmt(o.totalAmount)}
                    </div>
                  </div>

                  <div style={{ borderTop: "1px solid var(--dark4)", paddingTop: "12px", display: "flex", justifyContent: "flex-end" }}>
                    <Link href={`/orders/track?id=${o.id}`} style={{ fontSize: ".5rem", letterSpacing: ".2em", color: "var(--gold)", textTransform: "uppercase", textDecoration: "none" }}>
                      Track Order Timeline →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Profile details */}
        <div style={{ background: "var(--dark2)", border: "1px solid var(--dark3)", padding: "32px" }}>
          <div style={{ fontSize: ".55rem", letterSpacing: ".3em", color: "var(--gold)", textTransform: "uppercase", marginBottom: "20px" }}>
            Collector Profile
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", fontSize: ".7rem" }}>
            <div>
              <div style={{ fontSize: ".45rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".2em" }}>Full Name</div>
              <div style={{ color: "var(--white)", marginTop: "2px" }}>{user.name}</div>
            </div>
            <div>
              <div style={{ fontSize: ".45rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".2em" }}>Email Address</div>
              <div style={{ color: "var(--white)", marginTop: "2px" }}>{user.email}</div>
            </div>
            <div>
              <div style={{ fontSize: ".45rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".2em" }}>Phone / WhatsApp</div>
              <div style={{ color: "var(--white)", marginTop: "2px" }}>{user.phone || "Not provided"}</div>
            </div>
            <div>
              <div style={{ fontSize: ".45rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".2em" }}>Delivery Address</div>
              <div style={{ color: "var(--white)", marginTop: "2px" }}>{user.shippingAddress || "Not provided"}</div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
