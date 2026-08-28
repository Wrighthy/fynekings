"use client";

import { useState, useEffect, use } from "react";
import Nav from "@/components/sections/Nav";
import Footer from "@/components/sections/Footer";
import { fmt } from "@/lib/store";

type TrackedOrder = {
  id: string;
  customerName: string;
  customerEmail: string;
  shippingAddress: string;
  city: string;
  country: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  product?: {
    name: string;
    series: string;
    images: string[];
  } | null;
};

const STEPS = [
  { key: "PENDING", label: "Order Placed", desc: "Awaiting payment authorization" },
  { key: "PAID", label: "Payment Verified", desc: "Payment confirmed via Paystack" },
  { key: "PROCESSING", label: "Horological Calibration", desc: "Inspection & 5ATM pressure testing" },
  { key: "SHIPPED", label: "Insured Transit", desc: "Dispatched via armed express courier" },
  { key: "DELIVERED", label: "Delivered", desc: "Hand-delivered to client" },
];

export default function OrderTrackPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const params = use(searchParams);
  const initialId = params.id || "";

  const [query, setQuery] = useState(initialId);
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleTrack = (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    setError("");

    fetch(`/api/orders/track?query=${encodeURIComponent(searchQuery)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data && data.order) {
          setOrder(data.order);
        } else {
          setOrder(null);
          setError(data.error || "No order found.");
        }
        setLoading(false);
      })
      .catch(() => {
        setOrder(null);
        setError("Failed to fetch tracking status.");
        setLoading(false);
      });
  };

  useEffect(() => {
    if (initialId) {
      handleTrack(initialId);
    }
  }, [initialId]);

  const getStepIndex = (status: string) => {
    const idx = STEPS.findIndex((s) => s.key === status);
    return idx === -1 ? 1 : idx; // default to step 1 if paid
  };

  const currentStep = order ? getStepIndex(order.status) : 0;

  return (
    <div style={{ background: "var(--black)", minHeight: "100vh", fontFamily: "Raleway, sans-serif" }}>
      <Nav />

      {/* Header */}
      <div style={{ padding: "160px 24px 60px", maxWidth: "900px", margin: "0 auto", textAlign: "center" }}>
        <div style={{ fontSize: ".52rem", letterSpacing: ".45em", color: "var(--gold)", textTransform: "uppercase", marginBottom: "16px" }}>
          Insured Courier & Order Tracking
        </div>
        <h1 style={{ fontFamily: "Playfair Display, serif", fontSize: "clamp(2.8rem, 6vw, 4.5rem)", fontWeight: 300, color: "var(--white)", marginBottom: "20px" }}>
          Track Your <em style={{ fontStyle: "italic", color: "var(--gold)" }}>Timepiece</em>
        </h1>

        {/* Input Form */}
        <div style={{ display: "flex", gap: "12px", maxWidth: "600px", margin: "32px auto 0" }}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter Order ID or Email address..."
            style={{
              flex: 1,
              padding: "16px 20px",
              background: "var(--dark2)",
              border: "1px solid var(--gold-dk)",
              color: "var(--white)",
              fontSize: ".9rem",
              outline: "none",
            }}
          />
          <button
            onClick={() => handleTrack(query)}
            disabled={loading}
            style={{
              padding: "16px 28px",
              background: "var(--gold)",
              color: "var(--black)",
              border: "none",
              fontSize: ".58rem",
              letterSpacing: ".25em",
              textTransform: "uppercase",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {loading ? "Tracking..." : "Track →"}
          </button>
        </div>
      </div>

      {/* Results */}
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "0 24px 100px" }}>
        {error && (
          <div style={{ padding: "20px", background: "rgba(139, 32, 32, 0.2)", border: "1px solid var(--crimson)", color: "#ff6b6b", fontSize: ".7rem", textAlign: "center" }}>
            {error}
          </div>
        )}

        {order && (
          <div style={{ background: "var(--dark2)", border: "1px solid var(--dark3)", padding: "40px", animation: "fadeIn .35s ease" }}>
            {/* Header info */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px", borderBottom: "1px solid var(--dark3)", paddingBottom: "24px", marginBottom: "36px" }}>
              <div>
                <div style={{ fontSize: ".48rem", color: "var(--gold-dk)", textTransform: "uppercase", letterSpacing: ".3em" }}>Official Order Reference</div>
                <div style={{ fontFamily: "Playfair Display, serif", fontSize: "1.8rem", color: "var(--white)" }}>#{order.id.slice(-8).toUpperCase()}</div>
                <div style={{ fontSize: ".6rem", color: "var(--muted)", marginTop: "4px" }}>Customer: {order.customerName} ({order.customerEmail})</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: ".48rem", color: "var(--gold-dk)", textTransform: "uppercase", letterSpacing: ".3em" }}>Acquisition Value</div>
                <div style={{ fontFamily: "Playfair Display, serif", fontSize: "1.8rem", color: "var(--gold)" }}>{fmt(order.totalAmount)}</div>
                <div style={{ fontSize: ".6rem", color: "var(--muted)", marginTop: "4px" }}>{order.shippingAddress}, {order.city}</div>
              </div>
            </div>

            {/* Stepper Timeline */}
            <div style={{ fontSize: ".5rem", letterSpacing: ".3em", color: "var(--gold)", textTransform: "uppercase", marginBottom: "28px" }}>
              Live Status Timeline
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "24px", position: "relative" }}>
              {STEPS.map((step, i) => {
                const isCompleted = i <= currentStep;
                const isCurrent = i === currentStep;

                return (
                  <div key={step.key} style={{ display: "flex", gap: "20px", alignItems: "flex-start", opacity: isCompleted ? 1 : 0.4 }}>
                    <div
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "50%",
                        background: isCurrent ? "var(--gold)" : isCompleted ? "var(--dark3)" : "var(--dark)",
                        border: isCompleted ? "1px solid var(--gold)" : "1px solid var(--dark4)",
                        color: isCurrent ? "var(--black)" : "var(--gold)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 700,
                        fontSize: ".75rem",
                        flexShrink: 0,
                      }}
                    >
                      {isCompleted ? (i < currentStep ? "✓" : i + 1) : i + 1}
                    </div>
                    <div>
                      <div style={{ fontFamily: "Playfair Display, serif", fontSize: "1.2rem", color: isCompleted ? "var(--white)" : "var(--muted)" }}>
                        {step.label}
                      </div>
                      <div style={{ fontSize: ".62rem", color: "var(--muted)", marginTop: "2px" }}>{step.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
