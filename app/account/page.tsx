"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Nav from "@/components/sections/Nav";
import Footer from "@/components/sections/Footer";
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

function AccountContent() {
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoadingOrders(false);
      return;
    }

    fetch("/api/orders/me")
      .then((r) => r.json())
      .then((data) => {
        if (data && Array.isArray(data.orders)) {
          setOrders(data.orders);
        }
        setLoadingOrders(false);
      })
      .catch(() => setLoadingOrders(false));
  }, [user]);

  if (!user) {
    return (
      <div style={{ background: "var(--black)", minHeight: "100vh", fontFamily: "Raleway, sans-serif" }}>
        <Nav />

        <div style={{ padding: "160px 24px 100px", maxWidth: "800px", margin: "0 auto", textAlign: "center" }}>
          <div style={{ fontSize: ".52rem", letterSpacing: ".45em", color: "var(--gold)", textTransform: "uppercase", marginBottom: "16px" }}>
            Collector Portal
          </div>
          <h1 style={{ fontFamily: "Playfair Display, serif", fontSize: "clamp(2.4rem, 5vw, 3.8rem)", color: "var(--white)", fontWeight: 300, marginBottom: "20px" }}>
            Welcome, <em style={{ fontStyle: "italic", color: "var(--gold)" }}>Collector</em>
          </h1>
          <p style={{ fontSize: ".75rem", color: "var(--muted)", maxWidth: "560px", margin: "0 auto 40px", lineHeight: 1.9 }}>
            Sign in or create an account to view your private acquisition ledger, register timepieces for horological warranty, and manage concierge preferences. Or continue exploring all boutique features as a guest.
          </p>

          {/* Voluntary Sign-in Actions */}
          <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap", marginBottom: "60px" }}>
            <Link
              href="/login?redirect=/account"
              className="btn-primary"
              style={{ padding: "16px 36px", fontSize: ".65rem", letterSpacing: ".2em", textDecoration: "none" }}
            >
              Sign In to Account
            </Link>
            <Link
              href="/signup?redirect=/account"
              style={{
                border: "1px solid var(--gold-dk)",
                color: "var(--gold)",
                padding: "16px 36px",
                fontSize: ".65rem",
                letterSpacing: ".2em",
                textTransform: "uppercase",
                textDecoration: "none",
                display: "inline-block",
              }}
            >
              Create Account
            </Link>
          </div>

          {/* Guest Quick Access Matrix */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px", textAlign: "left" }}>
            <Link
              href="/orders"
              style={{
                background: "var(--dark2)",
                border: "1px solid var(--dark3)",
                padding: "24px",
                textDecoration: "none",
                transition: "border-color .3s",
                display: "block",
              }}
            >
              <div style={{ fontSize: "1.3rem", color: "var(--gold)", marginBottom: "8px" }}>📦</div>
              <div style={{ fontFamily: "Playfair Display, serif", fontSize: "1.1rem", color: "var(--white)", marginBottom: "6px" }}>
                Order Tracking
              </div>
              <div style={{ fontSize: ".62rem", color: "var(--muted)", lineHeight: 1.6 }}>
                Track any timepiece delivery instantly using your Order ID or Email.
              </div>
            </Link>

            <Link
              href="/wishlist"
              style={{
                background: "var(--dark2)",
                border: "1px solid var(--dark3)",
                padding: "24px",
                textDecoration: "none",
                transition: "border-color .3s",
                display: "block",
              }}
            >
              <div style={{ fontSize: "1.3rem", color: "var(--gold)", marginBottom: "8px" }}>♡</div>
              <div style={{ fontFamily: "Playfair Display, serif", fontSize: "1.1rem", color: "var(--white)", marginBottom: "6px" }}>
                Saved Wishlist
              </div>
              <div style={{ fontSize: ".62rem", color: "var(--muted)", lineHeight: 1.6 }}>
                Review pieces saved locally in your browser anytime.
              </div>
            </Link>

            <Link
              href="/collection"
              style={{
                background: "var(--dark2)",
                border: "1px solid var(--dark3)",
                padding: "24px",
                textDecoration: "none",
                transition: "border-color .3s",
                display: "block",
              }}
            >
              <div style={{ fontSize: "1.3rem", color: "var(--gold)", marginBottom: "8px" }}>✦</div>
              <div style={{ fontFamily: "Playfair Display, serif", fontSize: "1.1rem", color: "var(--white)", marginBottom: "6px" }}>
                Full Collection
              </div>
              <div style={{ fontSize: ".62rem", color: "var(--muted)", lineHeight: 1.6 }}>
                Explore all handcrafted Nigerian luxury horological masterworks.
              </div>
            </Link>
          </div>
        </div>

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
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
              <span style={{ fontSize: ".5rem", letterSpacing: ".4em", color: "var(--gold)", textTransform: "uppercase" }}>
                Collector Portal
              </span>
              {user?.isInnerCircle && (
                <span
                  style={{
                    background: "var(--gold)",
                    color: "var(--black)",
                    fontSize: ".45rem",
                    fontWeight: 700,
                    letterSpacing: ".2em",
                    padding: "3px 8px",
                    textTransform: "uppercase",
                  }}
                >
                  ★ Inner Circle Enlisted
                </span>
              )}
            </div>
            <h1 style={{ fontFamily: "Playfair Display, serif", fontSize: "clamp(2.2rem, 5vw, 3.5rem)", color: "var(--white)", fontWeight: 300 }}>
              Welcome back, <em style={{ fontStyle: "italic", color: "var(--gold)" }}>{user?.name}</em>
            </h1>
          </div>

          <div style={{ display: "flex", gap: "12px" }}>
            <Link
              href="/profile"
              style={{
                padding: "10px 18px",
                border: "1px solid var(--dark3)",
                color: "var(--gold)",
                fontSize: ".52rem",
                letterSpacing: ".2em",
                textTransform: "uppercase",
                textDecoration: "none",
              }}
            >
              Edit Profile
            </Link>
            <button
              onClick={() => logout()}
              style={{
                padding: "10px 18px",
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
      </div>

      {/* Main Grid */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px 100px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 340px), 1fr))", gap: "40px", alignItems: "start" }}>
        {/* Left: Orders */}
        <div style={{ gridColumn: "span 2" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <div style={{ fontSize: ".55rem", letterSpacing: ".3em", color: "var(--gold)", textTransform: "uppercase" }}>
              Acquisition History ({orders.length})
            </div>
            <Link href="/wishlist" style={{ fontSize: ".52rem", letterSpacing: ".2em", color: "var(--muted)", textTransform: "uppercase", textDecoration: "none" }}>
              View Saved Wishlist →
            </Link>
          </div>

          {loadingOrders ? (
            <div style={{ background: "var(--dark2)", border: "1px solid var(--dark3)", padding: "40px", textAlign: "center", color: "var(--gold)" }}>
              Retrieving timepiece records...
            </div>
          ) : orders.length === 0 ? (
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
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <div style={{ fontSize: ".55rem", letterSpacing: ".3em", color: "var(--gold)", textTransform: "uppercase" }}>
              Collector Profile
            </div>
            <Link href="/profile" style={{ fontSize: ".5rem", color: "var(--gold)", textDecoration: "underline" }}>
              Edit
            </Link>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px", fontSize: ".7rem" }}>
            <div>
              <div style={{ fontSize: ".45rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".2em" }}>Full Name</div>
              <div style={{ color: "var(--white)", marginTop: "2px" }}>{user?.name}</div>
            </div>
            <div>
              <div style={{ fontSize: ".45rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".2em" }}>Email Address</div>
              <div style={{ color: "var(--white)", marginTop: "2px" }}>{user?.email}</div>
            </div>
            <div>
              <div style={{ fontSize: ".45rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".2em" }}>Phone / WhatsApp</div>
              <div style={{ color: "var(--white)", marginTop: "2px" }}>{user?.phone || "Not provided"}</div>
            </div>
            <div>
              <div style={{ fontSize: ".45rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".2em" }}>Delivery Address</div>
              <div style={{ color: "var(--white)", marginTop: "2px" }}>{user?.shippingAddress || "Not provided"}</div>
            </div>
            <div>
              <div style={{ fontSize: ".45rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".2em" }}>Inner Circle Status</div>
              <div style={{ color: user?.isInnerCircle ? "var(--gold)" : "var(--muted)", marginTop: "2px" }}>
                {user?.isInnerCircle ? "Enlisted Member" : <Link href="/inner-circle" style={{ color: "var(--gold)", textDecoration: "underline" }}>Enlist Now (Complimentary)</Link>}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default function AccountPage() {
  return <AccountContent />;
}
