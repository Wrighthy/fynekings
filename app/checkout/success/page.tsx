"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import Nav from "@/components/sections/Nav";
import Footer from "@/components/sections/Footer";
import { useCart } from "@/lib/store";

type PageState = "verifying" | "confirmed" | "pending" | "failed";

export default function CheckoutSuccessPage({ searchParams }: { searchParams: Promise<{ orderId?: string; reference?: string }> }) {
  const { orderId, reference } = use(searchParams);
  const [state, setState] = useState<PageState>("verifying");

  useEffect(() => {
    // The order has been placed — empty the cart regardless of payment outcome
    useCart.setState({ cart: [] });

    if (orderId && reference) {
      // Returned from Paystack — confirm the payment server-side
      fetch("/api/checkout/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference, orderId }),
      })
        .then((res) => res.json())
        .then((data) => {
          setState((prev) => (prev === "verifying" ? (data?.success ? "confirmed" : "failed") : prev));
        })
        .catch(() => setState("failed"));
      return;
    }

    if (orderId) {
      // No reference (direct visit / webhook path) — check the stored status
      fetch(`/api/orders/track?query=${encodeURIComponent(orderId)}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          setState(data?.order?.status === "PAID" ? "confirmed" : "pending");
        })
        .catch(() => setState("pending"));
      return;
    }

    setState("pending");
  }, [orderId, reference]);

  const headlines: Record<PageState, string> = {
    verifying: "Confirming Payment...",
    confirmed: "Acquisition Confirmed",
    pending: "Order Received",
    failed: "Payment Not Completed",
  };

  const subtexts: Record<PageState, string> = {
    verifying: "We are verifying your payment with Paystack. This takes a moment — please do not close this page.",
    confirmed: `Thank you for acquiring a Fynekings timepiece. Your order reference is ${orderId ? `#${orderId.slice(-8).toUpperCase()}` : "confirmed"}. Our master watchmaker is preparing your timepiece for dispatch from our Victoria Island horological gallery.`,
    pending: `Your order ${orderId ? `#${orderId.slice(-8).toUpperCase()}` : ""} has been received and is awaiting payment confirmation. If you completed payment, our payment processor will confirm it shortly and you will receive a confirmation email.`,
    failed: `We could not verify the payment for order ${orderId ? `#${orderId.slice(-8).toUpperCase()}` : ""}. If you were charged, please contact our concierge with your order reference — no duplicate payment is needed.`,
  };

  return (
    <div style={{ background: "var(--black)", minHeight: "100vh", fontFamily: "Raleway, sans-serif" }}>
      <Nav />

      <div style={{ padding: "180px 24px 100px", maxWidth: "700px", margin: "0 auto", textAlign: "center" }}>
        <div style={{ width: "64px", height: "64px", border: `1px solid ${state === "failed" ? "var(--muted)" : "var(--gold)"}`, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", color: state === "failed" ? "var(--muted)" : "var(--gold)", fontSize: "1.8rem" }}>
          {state === "verifying" ? "…" : state === "failed" ? "✕" : state === "pending" ? "⏳" : "✓"}
        </div>
        <div style={{ fontSize: ".5rem", letterSpacing: ".4em", color: "var(--gold)", textTransform: "uppercase", marginBottom: "12px" }}>
          {state === "confirmed" ? "Payment Authorized & Verified" : state === "failed" ? "Verification Unsuccessful" : "Payment Status"}
        </div>
        <h1 style={{ fontFamily: "Playfair Display, serif", fontSize: "clamp(2.5rem, 5vw, 4rem)", color: "var(--white)", fontWeight: 300, marginBottom: "20px" }}>
          {headlines[state]}
        </h1>
        <p style={{ fontSize: ".72rem", lineHeight: 2.2, color: "var(--text)", marginBottom: "32px" }}>
          {subtexts[state]}
        </p>

        {state === "confirmed" && (
          <div style={{ background: "var(--dark2)", border: "1px solid var(--dark3)", padding: "32px", marginBottom: "40px", textAlign: "left" }}>
            <div style={{ fontSize: ".5rem", letterSpacing: ".3em", color: "var(--gold)", textTransform: "uppercase", marginBottom: "16px" }}>Next Steps</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: ".68rem", color: "var(--text)", lineHeight: 1.8 }}>
              <div><strong>1. Order Inspection:</strong> Final timing calibration & 5ATM pressure testing.</div>
              <div><strong>2. Signature Packaging:</strong> Sealed in luxury presentation case with 5-Year NFC warranty.</div>
              <div><strong>3. Insured Dispatch:</strong> Armed courier tracking details will be sent via SMS & email.</div>
            </div>
          </div>
        )}

        <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
          <Link href={`/orders/track?id=${orderId || ""}`} className="btn-primary">
            <span>Track Order Timeline →</span>
          </Link>
          <Link href="/collection" className="btn-outline">
            <span>Return to Collection</span>
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
