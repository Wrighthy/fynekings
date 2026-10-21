"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import Nav from "@/components/sections/Nav";
import Footer from "@/components/sections/Footer";
import { useCart, fmt } from "@/lib/store";
import { useAuth } from "@/lib/authStore";
import { FYNEKINGS_BANK_DETAILS } from "@/lib/bankConfig";

type PageState = "verifying" | "confirmed" | "pending" | "transfer_pending" | "failed";

export default function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string; reference?: string; trxref?: string; method?: string }>;
}) {
  const { orderId, reference, trxref, method } = use(searchParams);
  const paymentRef = reference || trxref;
  const user = useAuth((s) => s.user);
  const isGuest = !user;

  const [state, setState] = useState<PageState>(method === "transfer" ? "transfer_pending" : "verifying");
  const [errorMessage, setErrorMessage] = useState("");
  const [orderDetails, setOrderDetails] = useState<{ totalAmount?: number; paystackRef?: string } | null>(null);

  useEffect(() => {
    // Empty cart upon completing checkout
    useCart.setState({ cart: [] });

    // Bank transfer flow: order placed awaiting manual wire & receipt
    if (method === "transfer") {
      setState("transfer_pending");
      if (orderId) {
        fetch(`/api/orders/track?id=${encodeURIComponent(orderId)}`)
          .then((r) => (r.ok ? r.json() : null))
          .then((data) => {
            if (data?.order) {
              setOrderDetails(data.order);
              if (data.order.status === "PAID") {
                setState("confirmed");
              }
            }
          })
          .catch(() => {});
      }
      return;
    }

    // Paystack redirect return flow: server-side verification
    if (orderId && paymentRef) {
      fetch("/api/checkout/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference: paymentRef, orderId }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data?.success) {
            setState("confirmed");
          } else {
            setState("failed");
            setErrorMessage(data?.error || "Payment verification could not be confirmed.");
          }
        })
        .catch(() => {
          setState("failed");
          setErrorMessage("Network error during payment verification. Please contact our concierge.");
        });
      return;
    }

    // Direct lookup without reference (e.g. tracking link or webhook completed earlier)
    if (orderId) {
      fetch(`/api/orders/track?id=${encodeURIComponent(orderId)}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data?.order) {
            setOrderDetails(data.order);
            setState(data.order.status === "PAID" ? "confirmed" : "pending");
          } else {
            setState("pending");
          }
        })
        .catch(() => setState("pending"));
      return;
    }

    setState("pending");
  }, [orderId, paymentRef, method]);

  const headlines: Record<PageState, string> = {
    verifying: "Confirming Payment...",
    confirmed: "Acquisition Confirmed",
    pending: "Order Received",
    transfer_pending: "Wire Transfer Instructions",
    failed: "Payment Not Completed",
  };

  const formattedOrderId = orderId ? `#${orderId.slice(-8).toUpperCase()}` : "";
  const displayRef = orderDetails?.paystackRef || paymentRef || formattedOrderId;

  const whatsappMessage = encodeURIComponent(
    `Hello Fynekings Concierge, I have initiated a bank transfer for Order ${formattedOrderId} (Ref: ${displayRef}). Total: ${orderDetails?.totalAmount ? fmt(orderDetails.totalAmount) : "Order Total"}. Please find my payment receipt attached.`
  );

  return (
    <div style={{ background: "var(--black)", minHeight: "100vh", fontFamily: "Raleway, sans-serif" }}>
      <Nav />

      <div style={{ padding: "180px 24px 100px", maxWidth: "720px", margin: "0 auto", textAlign: "center" }}>
        {/* Status Icon */}
        <div
          style={{
            width: "64px",
            height: "64px",
            border: `1px solid ${state === "failed" ? "var(--crimson)" : "var(--gold)"}`,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 24px",
            color: state === "failed" ? "#ff6b6b" : "var(--gold)",
            fontSize: "1.8rem",
          }}
        >
          {state === "verifying" ? "…" : state === "failed" ? "✕" : state === "transfer_pending" ? "🏛" : state === "pending" ? "⏳" : "✓"}
        </div>

        <div style={{ fontSize: ".5rem", letterSpacing: ".4em", color: "var(--gold)", textTransform: "uppercase", marginBottom: "12px" }}>
          {state === "confirmed"
            ? "Payment Authorized & Verified"
            : state === "transfer_pending"
            ? "Awaiting Bank Transfer Confirmation"
            : state === "failed"
            ? "Verification Unsuccessful"
            : "Payment Status"}
        </div>

        <h1 style={{ fontFamily: "Playfair Display, serif", fontSize: "clamp(2.4rem, 5vw, 3.8rem)", color: "var(--white)", fontWeight: 300, marginBottom: "20px" }}>
          {headlines[state]}
        </h1>

        {/* Subtext Descriptions */}
        {state === "verifying" && (
          <p style={{ fontSize: ".72rem", lineHeight: 2.2, color: "var(--text)", marginBottom: "32px" }}>
            We are confirming your transaction with Paystack. This takes just a moment — please do not close or refresh this page.
          </p>
        )}

        {state === "confirmed" && (
          <p style={{ fontSize: ".72rem", lineHeight: 2.2, color: "var(--text)", marginBottom: "32px" }}>
            Thank you for acquiring a Fynekings timepiece. Your order reference is <strong style={{ color: "var(--gold)" }}>{displayRef}</strong>. Our master watchmaker is preparing your timepiece for dispatch from our Victoria Island horological gallery.
          </p>
        )}

        {state === "transfer_pending" && (
          <p style={{ fontSize: ".72rem", lineHeight: 2.2, color: "var(--text)", marginBottom: "24px" }}>
            Your order <strong style={{ color: "var(--gold)" }}>{formattedOrderId}</strong> has been created and your timepiece allocation is reserved. Please complete your direct bank transfer using the official corporate account details below.
          </p>
        )}

        {state === "pending" && (
          <p style={{ fontSize: ".72rem", lineHeight: 2.2, color: "var(--text)", marginBottom: "32px" }}>
            Your order <strong style={{ color: "var(--gold)" }}>{formattedOrderId}</strong> has been received and is awaiting payment confirmation. If you completed payment, our concierge will confirm it shortly and you will receive a confirmation email.
          </p>
        )}

        {state === "failed" && (
          <p style={{ fontSize: ".72rem", lineHeight: 2.2, color: "#ff6b6b", marginBottom: "32px" }}>
            {errorMessage || `We could not verify payment for order ${formattedOrderId}. If you were debited, please contact our concierge with your transaction reference — no duplicate payment is needed.`}
          </p>
        )}

        {/* Bank Transfer Wire Box */}
        {state === "transfer_pending" && (
          <div style={{ background: "var(--dark2)", border: "1px solid var(--dark3)", padding: "32px", marginBottom: "36px", textAlign: "left" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: "1px solid var(--dark3)", paddingBottom: "12px" }}>
              <span style={{ fontSize: ".52rem", letterSpacing: ".25em", color: "var(--gold)", textTransform: "uppercase" }}>
                Official Corporate Account Details
              </span>
              <span style={{ fontSize: ".5rem", color: "var(--muted)", textTransform: "uppercase" }}>
                Held for {FYNEKINGS_BANK_DETAILS.paymentWindowHours} Hours
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px", fontSize: ".7rem" }}>
              <div>
                <div style={{ fontSize: ".48rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".15em", marginBottom: "4px" }}>Bank Name</div>
                <div style={{ color: "var(--white)", fontWeight: 500 }}>{FYNEKINGS_BANK_DETAILS.bankName}</div>
              </div>
              <div>
                <div style={{ fontSize: ".48rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".15em", marginBottom: "4px" }}>Account Name</div>
                <div style={{ color: "var(--white)", fontWeight: 500 }}>{FYNEKINGS_BANK_DETAILS.accountName}</div>
              </div>
              <div>
                <div style={{ fontSize: ".48rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".15em", marginBottom: "4px" }}>Account Number</div>
                <div style={{ color: "var(--gold)", fontFamily: "monospace", fontSize: "1.1rem", fontWeight: 700, letterSpacing: ".15em" }}>
                  {FYNEKINGS_BANK_DETAILS.accountNumber}
                </div>
              </div>
              <div>
                <div style={{ fontSize: ".48rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".15em", marginBottom: "4px" }}>Payment Narration / Remark</div>
                <div style={{ color: "var(--white)", fontFamily: "monospace", fontSize: ".85rem", fontWeight: 600 }}>
                  {displayRef}
                </div>
              </div>
            </div>

            {orderDetails?.totalAmount ? (
              <div style={{ background: "var(--dark)", border: "1px solid var(--dark4)", padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <span style={{ fontSize: ".6rem", textTransform: "uppercase", letterSpacing: ".15em", color: "var(--muted)" }}>Exact Total to Transfer:</span>
                <span style={{ fontSize: "1.2rem", fontFamily: "Playfair Display, serif", color: "var(--gold)" }}>
                  {fmt(orderDetails.totalAmount)}
                </span>
              </div>
            ) : null}

            <div style={{ borderTop: "1px solid var(--dark3)", paddingTop: "16px", marginBottom: "20px" }}>
              <div style={{ fontSize: ".5rem", letterSpacing: ".2em", color: "var(--gold)", textTransform: "uppercase", marginBottom: "8px" }}>
                Next Steps for Transfer Clearance
              </div>
              <ol style={{ paddingLeft: "18px", margin: 0, fontSize: ".62rem", color: "var(--muted)", lineHeight: 1.9 }}>
                {FYNEKINGS_BANK_DETAILS.instructions.map((inst, idx) => (
                  <li key={idx}>{inst}</li>
                ))}
              </ol>
            </div>

            <a
              href={`https://wa.me/${FYNEKINGS_BANK_DETAILS.conciergeWhatsApp}?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
              style={{ display: "block", textAlign: "center", width: "100%", padding: "16px", textDecoration: "none" }}
            >
              <span>Send Payment Receipt to Concierge (WhatsApp) →</span>
            </a>
          </div>
        )}

        {/* Next Steps for Confirmed Orders */}
        {state === "confirmed" && (
          <div style={{ background: "var(--dark2)", border: "1px solid var(--dark3)", padding: "32px", marginBottom: "40px", textAlign: "left" }}>
            <div style={{ fontSize: ".5rem", letterSpacing: ".3em", color: "var(--gold)", textTransform: "uppercase", marginBottom: "16px" }}>
              Next Steps
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: ".68rem", color: "var(--text)", lineHeight: 1.8 }}>
              <div><strong>1. Order Inspection:</strong> Final timing calibration &amp; 5ATM pressure testing.</div>
              <div><strong>2. Signature Packaging:</strong> Sealed in luxury presentation case with 5-Year NFC warranty.</div>
              <div><strong>3. Insured Dispatch:</strong> Armed courier tracking details will be sent via SMS &amp; email.</div>
            </div>
          </div>
        )}

        {/* Optional account creation banner for guest users */}
        {isGuest && (state === "confirmed" || state === "transfer_pending" || state === "pending") && (
          <div style={{ background: "var(--dark2)", border: "1px solid rgba(196,169,98,0.3)", padding: "28px 32px", marginBottom: "40px", textAlign: "left" }}>
            <div style={{ fontSize: ".48rem", letterSpacing: ".3em", color: "var(--gold)", textTransform: "uppercase", marginBottom: "10px" }}
            >
              Optional · Member Account
            </div>
            <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: "1.3rem", color: "var(--white)", fontWeight: 300, marginBottom: "10px" }}>
              Save your order history
            </h2>
            <p style={{ fontSize: ".65rem", color: "var(--muted)", lineHeight: 1.9, marginBottom: "18px" }}>
              Create your Fynekings account to make future purchases easier and keep track of your orders. Your existing order will be linked automatically.
            </p>
            <Link
              href={`/signup?claimOrder=${orderId || ""}`}
              style={{
                display: "inline-block",
                padding: "12px 28px",
                background: "transparent",
                border: "1px solid var(--gold)",
                color: "var(--gold)",
                fontSize: ".55rem",
                letterSpacing: ".25em",
                textTransform: "uppercase",
                textDecoration: "none",
              }}
            >
              Create Account →
            </Link>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
          {orderId && (
            <Link href={`/orders/track?id=${orderId}`} className="btn-primary">
              <span>Track Order Timeline →</span>
            </Link>
          )}
          <Link href="/collection" className="btn-outline">
            <span>Return to Collection</span>
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
