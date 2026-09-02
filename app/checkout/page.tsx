"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Nav from "@/components/sections/Nav";
import Footer from "@/components/sections/Footer";
import { useCart, fmt } from "@/lib/store";
import { useAuth } from "@/lib/authStore";

export default function CheckoutPage() {
  const router = useRouter();
  const cart = useCart((s) => s.cart);
  const user = useAuth((s) => s.user);

  const [form, setForm] = useState({
    customerName: user?.name || "",
    customerEmail: user?.email || "",
    customerPhone: user?.phone || "",
    shippingAddress: user?.shippingAddress || "",
    city: user?.city || "Lagos",
    country: "Nigeria",
  });

  const [promoInput, setPromoInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discountAmount: number } | null>(null);
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoMsg, setPromoMsg] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const subtotal = cart.reduce((a, b) => a + b.amount, 0);
  const totalFees = cart.reduce((a, b) => a + b.fee, 0);
  const discountAmount = appliedPromo ? appliedPromo.discountAmount : 0;
  const grandTotal = Math.max(0, subtotal + totalFees - discountAmount);

  const handleApplyPromo = async () => {
    if (!promoInput.trim()) return;
    setPromoLoading(true);
    setPromoMsg("");

    try {
      const res = await fetch("/api/promo/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: promoInput, subtotal }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAppliedPromo({ code: data.code, discountAmount: data.discountAmount });
        setPromoMsg(`✓ Code ${data.code} applied! Saved ${fmt(data.discountAmount)}`);
      } else {
        setPromoMsg(`✕ ${data.error || "Failed to apply promo code."}`);
      }
    } catch {
      setPromoMsg("✕ Network error applying promo.");
    } finally {
      setPromoLoading(false);
    }
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cart.length) return;
    setLoading(true);
    setError("");

    try {
      // Step 1: Create Order in DB
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart,
          ...form,
          promoCode: appliedPromo?.code || null,
          discountAmount,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.orderId) {
        setError(data.error || "Failed to initialize order.");
        setLoading(false);
        return;
      }

      // Step 2: Payment
      if (data.authorizationUrl) {
        // Real Paystack transaction — send the customer to the hosted
        // payment page. Verification happens server-side when Paystack
        // redirects back to /checkout/success with the reference.
        window.location.href = data.authorizationUrl;
        return; // stay in loading state while the redirect happens
      }

      if (data.mock) {
        // Local development only (no Paystack keys configured)
        const mockRef = `MOCK-PAYSTACK-${Date.now()}`;
        const verifyRes = await fetch("/api/checkout/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            reference: mockRef,
            orderId: data.orderId,
          }),
        });

        const verifyData = await verifyRes.json();

        if (verifyRes.ok && verifyData.success) {
          useCart.setState({ cart: [] });
          router.push(`/checkout/success?orderId=${data.orderId}`);
        } else {
          setError(verifyData.error || "Payment verification failed.");
          setLoading(false);
        }
      } else {
        setError("Payment could not be initialized. Please try again.");
        setLoading(false);
      }
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  if (!cart.length) {
    return (
      <div style={{ background: "var(--black)", minHeight: "100vh", fontFamily: "Raleway, sans-serif" }}>
        <Nav />
        <div style={{ padding: "180px 24px 100px", maxWidth: "600px", margin: "0 auto", textAlign: "center" }}>
          <div style={{ fontSize: ".5rem", letterSpacing: ".4em", color: "var(--gold)", textTransform: "uppercase", marginBottom: "16px" }}>
            Luxury Checkout Portal
          </div>
          <h1 style={{ fontFamily: "Playfair Display, serif", fontSize: "2.8rem", color: "var(--white)", fontWeight: 300, marginBottom: "20px" }}>
            Your Cart is Empty
          </h1>
          <p style={{ fontSize: ".7rem", lineHeight: 2, color: "var(--muted)", marginBottom: "32px" }}>
            Select your timepiece from our collection to proceed to checkout.
          </p>
          <Link href="/collection" className="btn-primary" style={{ display: "inline-flex" }}>
            <span>Explore Collection</span>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div style={{ background: "var(--black)", minHeight: "100vh", fontFamily: "Raleway, sans-serif" }}>
      <Nav />

      {/* Header */}
      <div style={{ padding: "160px 24px 40px", maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ fontSize: ".52rem", letterSpacing: ".4em", color: "var(--gold)", textTransform: "uppercase", marginBottom: "8px" }}>
          Encrypted Security
        </div>
        <h1 style={{ fontFamily: "Playfair Display, serif", fontSize: "clamp(2.4rem, 5vw, 3.8rem)", color: "var(--white)", fontWeight: 300 }}>
          Acquisition <em style={{ fontStyle: "italic", color: "var(--gold)" }}>Checkout</em>
        </h1>
      </div>

      {/* Grid */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px 100px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 460px), 1fr))", gap: "60px", alignItems: "start" }}>
        {/* Form */}
        <div style={{ background: "var(--dark2)", border: "1px solid var(--dark3)", padding: "40px" }}>
          <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: "1.6rem", color: "var(--white)", fontWeight: 300, marginBottom: "24px" }}>
            1. Shipping & Contact Details
          </h2>

          {error && (
            <div style={{ padding: "14px", background: "rgba(139, 32, 32, 0.2)", border: "1px solid var(--crimson)", color: "#ff6b6b", fontSize: ".65rem", marginBottom: "24px" }}>
              {error}
            </div>
          )}

          <form onSubmit={handleCheckout} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div>
              <label style={{ display: "block", fontSize: ".48rem", letterSpacing: ".2em", color: "var(--muted)", textTransform: "uppercase", marginBottom: "6px" }}>Full Name *</label>
              <input
                type="text"
                required
                value={form.customerName}
                onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                placeholder="Prince Olayemi"
                style={{ width: "100%", padding: "14px", background: "var(--dark)", border: "1px solid var(--dark4)", color: "var(--white)", fontSize: ".85rem", outline: "none" }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: ".48rem", letterSpacing: ".2em", color: "var(--muted)", textTransform: "uppercase", marginBottom: "6px" }}>Email Address *</label>
                <input
                  type="email"
                  required
                  value={form.customerEmail}
                  onChange={(e) => setForm({ ...form, customerEmail: e.target.value })}
                  placeholder="olayemi@example.com"
                  style={{ width: "100%", padding: "14px", background: "var(--dark)", border: "1px solid var(--dark4)", color: "var(--white)", fontSize: ".85rem", outline: "none" }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: ".48rem", letterSpacing: ".2em", color: "var(--muted)", textTransform: "uppercase", marginBottom: "6px" }}>Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={form.customerPhone}
                  onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
                  placeholder="+234 803 000 0000"
                  style={{ width: "100%", padding: "14px", background: "var(--dark)", border: "1px solid var(--dark4)", color: "var(--white)", fontSize: ".85rem", outline: "none" }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: ".48rem", letterSpacing: ".2em", color: "var(--muted)", textTransform: "uppercase", marginBottom: "6px" }}>Delivery Address *</label>
              <input
                type="text"
                required
                value={form.shippingAddress}
                onChange={(e) => setForm({ ...form, shippingAddress: e.target.value })}
                placeholder="Ahmadu Bello Way, Victoria Island"
                style={{ width: "100%", padding: "14px", background: "var(--dark)", border: "1px solid var(--dark4)", color: "var(--white)", fontSize: ".85rem", outline: "none" }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: ".48rem", letterSpacing: ".2em", color: "var(--muted)", textTransform: "uppercase", marginBottom: "6px" }}>City *</label>
                <input
                  type="text"
                  required
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  placeholder="Lagos"
                  style={{ width: "100%", padding: "14px", background: "var(--dark)", border: "1px solid var(--dark4)", color: "var(--white)", fontSize: ".85rem", outline: "none" }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: ".48rem", letterSpacing: ".2em", color: "var(--muted)", textTransform: "uppercase", marginBottom: "6px" }}>Country</label>
                <input
                  type="text"
                  readOnly
                  value="Nigeria"
                  style={{ width: "100%", padding: "14px", background: "var(--dark3)", border: "1px solid var(--dark4)", color: "var(--gold)", fontSize: ".85rem", outline: "none" }}
                />
              </div>
            </div>

            <div style={{ marginTop: "20px", borderTop: "1px solid var(--dark3)", paddingTop: "24px" }}>
              <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: "1.6rem", color: "var(--white)", fontWeight: 300, marginBottom: "16px" }}>
                2. Secure Payment Authorization
              </h2>
              <p style={{ fontSize: ".62rem", color: "var(--muted)", lineHeight: 1.8, marginBottom: "20px" }}>
                Payment processed via 256-bit encrypted Paystack payment gateway with instant backend verification.
              </p>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "20px",
                  background: "var(--gold)",
                  color: "var(--black)",
                  border: "none",
                  fontSize: ".62rem",
                  letterSpacing: ".32em",
                  textTransform: "uppercase",
                  fontWeight: 600,
                  cursor: loading ? "wait" : "pointer",
                }}
              >
                {loading ? "Verifying Transaction..." : `Authorize Payment (${fmt(grandTotal)}) →`}
              </button>
            </div>
          </form>
        </div>

        {/* Order Summary Sidebar */}
        <div style={{ background: "var(--dark2)", border: "1px solid var(--dark3)", padding: "36px" }}>
          <div style={{ fontSize: ".5rem", letterSpacing: ".3em", color: "var(--gold)", textTransform: "uppercase", marginBottom: "20px" }}>
            Acquisition Summary ({cart.length})
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "24px" }}>
            {cart.map((item, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--dark3)", paddingBottom: "12px" }}>
                <div>
                  <div style={{ fontFamily: "Playfair Display, serif", fontSize: "1.1rem", color: "var(--white)" }}>{item.name}</div>
                  <div style={{ fontSize: ".52rem", color: "var(--muted)", textTransform: "uppercase" }}>{item.series}</div>
                </div>
                <div style={{ fontFamily: "Playfair Display, serif", fontSize: "1.1rem", color: "var(--gold)" }}>
                  {fmt(item.amount)}
                </div>
              </div>
            ))}
          </div>

          {/* Promo Code Input */}
          <div style={{ borderTop: "1px solid var(--dark3)", paddingTop: "20px", marginBottom: "20px" }}>
            <label style={{ display: "block", fontSize: ".45rem", letterSpacing: ".25em", color: "var(--gold-dk)", textTransform: "uppercase", marginBottom: "8px" }}>
              Promo / VIP Voucher Code
            </label>
            <div style={{ display: "flex", gap: "8px" }}>
              <input
                type="text"
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                placeholder="ROYAL15"
                style={{ flex: 1, padding: "10px 14px", background: "var(--dark)", border: "1px solid var(--dark4)", color: "var(--gold)", fontSize: ".75rem", outline: "none" }}
              />
              <button
                type="button"
                onClick={handleApplyPromo}
                disabled={promoLoading}
                style={{ padding: "10px 16px", background: "var(--gold-dk)", color: "var(--white)", border: "none", fontSize: ".48rem", letterSpacing: ".2em", textTransform: "uppercase", cursor: "pointer" }}
              >
                {promoLoading ? "..." : "Apply"}
              </button>
            </div>
            {promoMsg && (
              <div style={{ fontSize: ".55rem", marginTop: "8px", color: promoMsg.startsWith("✓") ? "var(--gold)" : "#ff6b6b" }}>
                {promoMsg}
              </div>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: ".65rem", color: "var(--text)", borderTop: "1px solid var(--dark3)", paddingTop: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Subtotal</span>
              <span style={{ color: "var(--white)" }}>{fmt(subtotal)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Paystack & Gateway Fees</span>
              <span style={{ color: "var(--white)" }}>{fmt(totalFees)}</span>
            </div>
            {discountAmount > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", color: "var(--gold)" }}>
                <span>Promo Discount ({appliedPromo?.code})</span>
                <span>-{fmt(discountAmount)}</span>
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Insured Express Shipping</span>
              <span style={{ color: "var(--gold)" }}>COMPLIMENTARY</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.2rem", fontFamily: "Playfair Display, serif", color: "var(--gold)", borderTop: "1px solid var(--dark4)", paddingTop: "16px", marginTop: "6px" }}>
              <span>Total Payable</span>
              <span>{fmt(grandTotal)}</span>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
