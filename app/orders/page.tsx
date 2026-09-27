"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Nav from "@/components/sections/Nav";
import Footer from "@/components/sections/Footer";
import ProtectedRoute from "@/components/ui/ProtectedRoute";
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
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/orders/me")
      .then((r) => r.json())
      .then((data) => {
        if (data && Array.isArray(data.orders)) {
          setOrders(data.orders);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div style={{ background: "var(--black)", minHeight: "100vh", fontFamily: "Raleway, sans-serif" }}>
      <Nav />

      <div style={{ padding: "160px 24px 100px", maxWidth: "1000px", margin: "0 auto" }}>
        <div style={{ marginBottom: "36px" }}>
          <div style={{ fontSize: ".52rem", letterSpacing: ".4em", color: "var(--gold)", textTransform: "uppercase", marginBottom: "8px" }}>
            Order Fulfillment Records
          </div>
          <h1 style={{ fontFamily: "Playfair Display, serif", fontSize: "2.6rem", color: "var(--white)", fontWeight: 300 }}>
            Your <em style={{ fontStyle: "italic", color: "var(--gold)" }}>Orders</em>
          </h1>
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
            <p style={{ fontSize: ".72rem", color: "var(--muted)", marginBottom: "32px" }}>
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
                    <div style={{ fontSize: ".45rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".2em" }}>Order ID</div>
                    <div style={{ fontFamily: "Playfair Display, serif", fontSize: "1.2rem", color: "var(--white)" }}>#{o.id.toUpperCase()}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span style={{ fontSize: ".5rem", letterSpacing: ".2em", textTransform: "uppercase", padding: "6px 12px", background: "var(--dark3)", border: "1px solid var(--gold)", color: "var(--gold)" }}>
                      {o.status}
                    </span>
                    <div style={{ fontSize: ".55rem", color: "var(--muted)", marginTop: "6px" }}>
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
                    <div style={{ fontSize: ".6rem", color: "var(--muted)" }}>
                      Destination: {o.shippingAddress}, {o.city}, {o.country}
                    </div>
                  </div>
                  <div style={{ fontFamily: "Playfair Display, serif", fontSize: "1.4rem", color: "var(--gold)" }}>
                    {fmt(o.totalAmount)}
                  </div>
                </div>

                <div style={{ borderTop: "1px solid var(--dark4)", marginTop: "20px", paddingTop: "16px", display: "flex", justifyContent: "flex-end" }}>
                  <Link href={`/orders/track?id=${o.id}`} style={{ fontSize: ".55rem", letterSpacing: ".2em", color: "var(--gold)", textTransform: "uppercase", textDecoration: "none" }}>
                    Track Delivery & Verification →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

export default function OrdersPage() {
  return (
    <ProtectedRoute>
      <OrdersContent />
    </ProtectedRoute>
  );
}
