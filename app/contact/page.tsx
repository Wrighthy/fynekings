"use client";

import { useState } from "react";
import Nav from "@/components/sections/Nav";
import Footer from "@/components/sections/Footer";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "General Inquiry", message: "" });
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusMsg(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (res.ok) {
        setStatusMsg({ type: "success", text: data.message || "Message sent successfully." });
        setForm({ name: "", email: "", phone: "", subject: "General Inquiry", message: "" });
      } else {
        setStatusMsg({ type: "error", text: data.error || "Failed to send message." });
      }
    } catch {
      setStatusMsg({ type: "error", text: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: "var(--black)", minHeight: "100vh", fontFamily: "Raleway, sans-serif" }}>
      <Nav />

      {/* Header */}
      <div style={{ padding: "160px 24px 60px", maxWidth: "1200px", margin: "0 auto", textAlign: "center" }}>
        <div style={{ fontSize: ".52rem", letterSpacing: ".45em", color: "var(--gold)", textTransform: "uppercase", marginBottom: "16px" }}>
          Client Concierge & Atelier Support
        </div>
        <h1 style={{ fontFamily: "Playfair Display, serif", fontSize: "clamp(2.8rem, 6vw, 4.5rem)", fontWeight: 300, color: "var(--white)", marginBottom: "20px" }}>
          Contact <em style={{ fontStyle: "italic", color: "var(--gold)" }}>Fynekings</em>
        </h1>
        <p style={{ fontSize: ".7rem", letterSpacing: ".1em", lineHeight: 2.2, color: "var(--text)", maxWidth: "600px", margin: "0 auto" }}>
          Have a question about a timepiece, custom order, or atelier appointment? Our horological concierge team is at your service.
        </p>
      </div>

      {/* Main Grid */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px 100px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 480px), 1fr))", gap: "60px", alignItems: "start" }}>
        {/* Form */}
        <div style={{ background: "var(--dark2)", border: "1px solid var(--dark3)", padding: "40px" }}>
          <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: "1.8rem", color: "var(--white)", fontWeight: 300, marginBottom: "24px" }}>
            Send a Concierge Message
          </h2>

          {statusMsg && (
            <div
              style={{
                padding: "14px 20px",
                marginBottom: "24px",
                fontSize: ".65rem",
                letterSpacing: ".08em",
                background: statusMsg.type === "success" ? "rgba(196, 169, 98, 0.1)" : "rgba(139, 32, 32, 0.15)",
                border: statusMsg.type === "success" ? "1px solid var(--gold)" : "1px solid var(--crimson)",
                color: statusMsg.type === "success" ? "var(--gold)" : "#ff6b6b",
              }}
            >
              {statusMsg.text}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div>
              <label style={{ display: "block", fontSize: ".5rem", letterSpacing: ".2em", color: "var(--muted)", textTransform: "uppercase", marginBottom: "8px" }}>Full Name *</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Prince Olayemi"
                style={{ width: "100%", padding: "14px", background: "var(--dark)", border: "1px solid var(--dark4)", color: "var(--white)", fontSize: ".8rem", outline: "none" }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: ".5rem", letterSpacing: ".2em", color: "var(--muted)", textTransform: "uppercase", marginBottom: "8px" }}>Email Address *</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="olayemi@example.com"
                  style={{ width: "100%", padding: "14px", background: "var(--dark)", border: "1px solid var(--dark4)", color: "var(--white)", fontSize: ".8rem", outline: "none" }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: ".5rem", letterSpacing: ".2em", color: "var(--muted)", textTransform: "uppercase", marginBottom: "8px" }}>Phone / WhatsApp</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+234 803 000 0000"
                  style={{ width: "100%", padding: "14px", background: "var(--dark)", border: "1px solid var(--dark4)", color: "var(--white)", fontSize: ".8rem", outline: "none" }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: ".5rem", letterSpacing: ".2em", color: "var(--muted)", textTransform: "uppercase", marginBottom: "8px" }}>Subject</label>
              <select
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                style={{ width: "100%", padding: "14px", background: "var(--dark)", border: "1px solid var(--dark4)", color: "var(--white)", fontSize: ".75rem", outline: "none" }}
              >
                <option value="General Inquiry">General Inquiry</option>
                <option value="Custom Order Inquiry">Custom Watch Build</option>
                <option value="Order Status & Delivery">Order Status & Delivery</option>
                <option value="Warranty & Servicing">Warranty & Servicing</option>
                <option value="Private Atelier Appointment">Private Atelier Appointment</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: ".5rem", letterSpacing: ".2em", color: "var(--muted)", textTransform: "uppercase", marginBottom: "8px" }}>Your Message *</label>
              <textarea
                required
                rows={5}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="How can our concierge assist you today?"
                style={{ width: "100%", padding: "14px", background: "var(--dark)", border: "1px solid var(--dark4)", color: "var(--white)", fontSize: ".8rem", outline: "none", resize: "vertical" }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "18px",
                background: "var(--gold)",
                color: "var(--black)",
                border: "none",
                fontSize: ".58rem",
                letterSpacing: ".3em",
                textTransform: "uppercase",
                fontWeight: 600,
                cursor: loading ? "wait" : "pointer",
                marginTop: "10px",
              }}
            >
              {loading ? "Dispatching..." : "Submit Inquiry →"}
            </button>
          </form>
        </div>

        {/* Contact Info & Atelier Details */}
        <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
          <div style={{ background: "var(--dark2)", border: "1px solid var(--dark3)", padding: "32px" }}>
            <div style={{ fontSize: ".5rem", letterSpacing: ".3em", color: "var(--gold)", textTransform: "uppercase", marginBottom: "8px" }}>Atelier Headquarters</div>
            <h3 style={{ fontFamily: "Playfair Display, serif", fontSize: "1.5rem", color: "var(--white)", fontWeight: 300, marginBottom: "16px" }}>Victoria Island Atelier</h3>
            <p style={{ fontSize: ".68rem", lineHeight: 2, color: "var(--text)", marginBottom: "16px" }}>
              Ahmadu Bello Way, Victoria Island<br />
              Lagos, Nigeria
            </p>
            <div style={{ fontSize: ".6rem", color: "var(--muted)", lineHeight: 1.8 }}>
              <div><strong>Hours:</strong> Mon – Sat, 10:00 AM – 6:00 PM WAT</div>
              <div><strong>Private Appointments:</strong> By Reservation Only</div>
            </div>
          </div>

          <div style={{ background: "var(--dark2)", border: "1px solid var(--dark3)", padding: "32px" }}>
            <div style={{ fontSize: ".5rem", letterSpacing: ".3em", color: "var(--gold)", textTransform: "uppercase", marginBottom: "8px" }}>Direct Channels</div>
            <h3 style={{ fontFamily: "Playfair Display, serif", fontSize: "1.5rem", color: "var(--white)", fontWeight: 300, marginBottom: "16px" }}>Immediate Support</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: ".68rem", color: "var(--text)" }}>
              <div><strong>WhatsApp Concierge:</strong> +234 803 337 6287</div>
              <div><strong>Email Desk:</strong> concierge@fynekings.com</div>
              <div><strong>Response Time:</strong> Under 2 hours during atelier operating hours</div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
