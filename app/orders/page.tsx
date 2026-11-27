"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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

function OrdersContent() {
  const router = useRouter();
  const { user } = useAuth();
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    fetch("/api/orders/me")
      .then((r) => r.json())
      .then((data) => {
        if (data && Array.isArray(data.orders)) {
          setOrders(data.orders);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [user]);

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/orders/track?id=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div style={{ background: "var(--black)", minHeight: "100vh", fontFamily: "Raleway, sans-serif" }}>
      <Nav />

      <div style={{ padding: "160px 24px 100px", maxWidth: "1000px", margin: "0 auto" }}>
        {/* Page Title */}
        <div style={{ marginBottom: "36px" }}>
          <div style={{ fontSize: "14px", letterSpacing: ".12em", color: "var(--gold)", textTransform: "uppercase", marginBottom: "8px" }}>
            Order Fulfillment & Verification
          </div>
          <h1 style={{ fontFamily: "Playfair Display, serif", fontSize: "2.6rem", color: "var(--white)", fontWeight: 300 }}>
            Orders & <em style={{ fontStyle: "italic", color: "var(--gold)" }}>Tracking</em>
          </h1>
        </div>

        {/* Guest & Universal Quick Tracking Form */}
        <div
          style={{
            background: "var(--dark2)",
            border: "1px solid var(--gold-dk)",
            padding: "32px",
            marginBottom: "40px",
          }}
        >
          <div style={{ fontSize: "14px", letterSpacing: ".12em", color: "var(--gold)", textTransform: "uppercase", marginBottom: "8px" }}>
            Instant Order & Courier Lookup
          </div>
          <p style={{ fontSize: "15px", color: "var(--muted)", marginBottom: "20px", lineHeight: 1.6 }}>
            Track any acquisition in real time with your Order ID, Payment Reference, or checkout Email address. No account required.
          </p>

          <form onSubmit={handleTrackSubmit} style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter Order ID (e.g. ord_...) or Email..."
              style={{
                flex: "1 1 280px",
                padding: "14px 18px",
                background: "var(--black)",
                border: "1px solid var(--dark4)",
                color: "var(--white)",
                fontSize: "15px",
                outline: "none",
              }}
            />
            <button
              type="submit"
              className="btn-primary"
              style={{
                padding: "14px 28px",
                fontSize: "14px",
                letterSpacing: ".12em",
                textTransform: "uppercase",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              Track Order →
            </button>
          </form>
        </div>

        {/* Authenticated User Orders vs Guest Prompt */}
        {user ? (
          <div>
            <div style={{ fontSize: "14px", letterSpacing: ".12em", color: "var(--gold)", textTransform: "uppercase", marginBottom: "20px" }}>
              Your Acquisition History
            </div>

            {loading ? (
              <div style={{ background: "var(--dark2)", border: "1px solid var(--dark3)", padding: "60px", textAlign: "center", color: "var(--gold)" }}>
                Loading your acquisition history...
              </div>
            ) : orders.length === 0 ? (
              <div style={{ background: "var(--dark2)", border: "1px solid var(--dark3)", padding: "60px 24px", textAlign: "center" }}>
                <div style={{ fontSize: "2rem", color: "var(--gold)", marginBottom: "16px" }}>⌚</div>
                <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: "1.8rem", color: "var(--white)", fontWeight: 300, marginBottom: "16px" }}>
                  No Orders Placed Yet
                </h2>
                <p style={{ fontSize: "15px", color: "var(--muted)", marginBottom: "32px" }}>
                  When you acquire a Fynekings timepiece, full delivery tracking and certificate information will appear here.
                </p>
                <Link href="/collection" className="btn-primary" style={{ display: "inline-flex" }}>
                  Explore Collection
                </Link>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {orders.map((o) => (
                  <div key={o.id} style={{ background: "var(--dark2)", border: "1px solid var(--dark3)", padding: "28px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--dark4)", paddingBottom: "16px", marginBottom: "20px" }}>
                      <div>
                        <div style={{ fontSize: "14px", color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".2em" }}>Order ID</div>
                        <div style={{ fontFamily: "Playfair Display, serif", fontSize: "1.2rem", color: "var(--white)" }}>#{o.id.toUpperCase()}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <span style={{ fontSize: "14px", letterSpacing: ".2em", textTransform: "uppercase", padding: "6px 12px", background: "var(--dark3)", border: "1px solid var(--gold)", color: "var(--gold)" }}>
                          {o.status}
                        </span>
                        <div style={{ fontSize: "14px", color: "var(--muted)", marginTop: "6px" }}>
                          {new Date(o.createdAt).toLocaleDateString("en-NG", { month: "long", day: "numeric", year: "numeric" })}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "24px", flexWrap: "wrap" }}>
                      <div style={{ width: "80px", height: "80px", background: "var(--dark3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {o.product?.images?.[0] ? (
                          <img src={o.product.images[0]} alt={o.product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                          <span style={{ fontSize: "1.5rem", color: "var(--gold)" }}>⌚</span>
                        )}
                      </div>
                      <div style={{ flex: 1, minWidth: "200px" }}>
                        <h3 style={{ fontFamily: "Playfair Display, serif", fontSize: "1.2rem", color: "var(--white)", marginBottom: "4px" }}>
                          {o.product?.name || "Bespoke Timepiece Commission"}
                        </h3>
                        <div style={{ fontSize: "14px", color: "var(--muted)" }}>
                          Destination: {o.shippingAddress}, {o.city}, {o.country}
                        </div>
                      </div>
                      <div style={{ fontFamily: "Playfair Display, serif", fontSize: "1.4rem", color: "var(--gold)" }}>
                        {fmt(o.totalAmount)}
                      </div>
                    </div>

                    <div style={{ borderTop: "1px solid var(--dark4)", marginTop: "20px", paddingTop: "16px", display: "flex", justifyContent: "flex-end" }}>
                      <Link href={`/orders/track?id=${o.id}`} style={{ fontSize: "14px", letterSpacing: ".2em", color: "var(--gold)", textTransform: "uppercase", textDecoration: "none" }}>
                        Track Delivery & Verification →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div
            style={{
              background: "var(--dark2)",
              border: "1px solid var(--dark3)",
              padding: "48px 32px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "1.8rem", color: "var(--gold)", marginBottom: "16px" }}>👑</div>
            <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: "1.6rem", color: "var(--white)", fontWeight: 300, marginBottom: "12px" }}>
              FYNEKINGS Collector Account
            </h2>
            <p style={{ fontSize: "15px", color: "var(--muted)", maxWidth: "540px", margin: "0 auto 28px", lineHeight: 1.8 }}>
              Did you make a purchase under an account or wish to link future acquisitions? Sign in or register to view your comprehensive ledger, digital certificates of authenticity, and private vault access.
            </p>
            <div style={{ display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap" }}>
              <Link
                href="/login?redirect=/orders"
                className="btn-primary"
                style={{ padding: "14px 28px", fontSize: "14px", textDecoration: "none" }}
              >
                Sign In to Account
              </Link>
              <Link
                href="/signup?redirect=/orders"
                style={{
                  border: "1px solid var(--gold-dk)",
                  color: "var(--gold)",
                  padding: "14px 28px",
                  fontSize: "14px",
                  letterSpacing: ".2em",
                  textTransform: "uppercase",
                  textDecoration: "none",
                  display: "inline-block",
                }}
              >
                Create Account
              </Link>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

export default function OrdersPage() {
  return <OrdersContent />;
}
