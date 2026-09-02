"use client";

import { useAdmin } from "./AdminContext";
import { fmt } from "@/lib/store";

export default function PromosTab() {
  const {
    promos,
    newPromo,
    setNewPromo,
    promoError,
    submittingPromo,
    handleCreatePromo,
    handleTogglePromo,
    handleDeletePromo,
  } = useAdmin();

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 480px), 1fr))", gap: "40px", alignItems: "start" }}>
      <div>
        <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: "1.8rem", marginBottom: "24px" }}>Active Promo Codes</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {promos.map((pr) => (
            <div key={pr.id} style={{ background: "#121212", border: "1px solid #222", padding: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontFamily: "Playfair Display, serif", fontSize: "1.4rem", color: "#C4A962" }}>{pr.code}</div>
                <div style={{ fontSize: ".6rem", color: "#888" }}>
                  Discount: {pr.discountType === "PERCENTAGE" ? `${pr.discountValue}% OFF` : fmt(pr.discountValue)} • Min Spend: {fmt(pr.minSpend)}
                </div>
                <div style={{ fontSize: ".55rem", color: "#555", marginTop: "2px" }}>Used: {pr.usedCount} times</div>
              </div>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <button
                  onClick={() => handleTogglePromo(pr.id, pr.active)}
                  style={{ padding: "4px 10px", background: pr.active ? "rgba(196,169,98,.2)" : "#222", color: pr.active ? "#C4A962" : "#666", border: "none", fontSize: ".55rem", cursor: "pointer" }}
                >
                  {pr.active ? "ACTIVE" : "DISABLED"}
                </button>
                <button onClick={() => handleDeletePromo(pr.id)} style={{ background: "none", border: "none", color: "#ff6b6b", fontSize: ".6rem", cursor: "pointer" }}>
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Promo Form */}
      <div style={{ background: "#121212", border: "1px solid #C4A962", padding: "32px" }}>
        <div style={{ fontSize: ".45rem", letterSpacing: ".3em", color: "#C4A962", textTransform: "uppercase", marginBottom: "8px" }}>Voucher System</div>
        <h3 style={{ fontFamily: "Playfair Display, serif", fontSize: "1.6rem", marginBottom: "20px" }}>Create Promo Code</h3>

        {promoError && (
          <div style={{ padding: "12px", background: "rgba(255,107,107,.15)", border: "1px solid #ff6b6b", color: "#ff6b6b", fontSize: ".65rem", marginBottom: "16px" }}>
            {promoError}
          </div>
        )}

        <form onSubmit={handleCreatePromo} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label style={{ display: "block", fontSize: ".45rem", letterSpacing: ".2em", color: "#888", textTransform: "uppercase", marginBottom: "4px" }}>Promo Code *</label>
            <input
              type="text"
              required
              placeholder="e.g. ROYAL15"
              value={newPromo.code}
              onChange={(e) => setNewPromo({ ...newPromo, code: e.target.value.toUpperCase() })}
              style={{ width: "100%", padding: "12px", background: "#000", border: "1px solid #333", color: "#C4A962", fontSize: ".85rem", fontWeight: 600, outline: "none" }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: ".45rem", letterSpacing: ".2em", color: "#888", textTransform: "uppercase", marginBottom: "4px" }}>Discount Type</label>
            <select
              value={newPromo.discountType}
              onChange={(e) => setNewPromo({ ...newPromo, discountType: e.target.value })}
              style={{ width: "100%", padding: "12px", background: "#000", border: "1px solid #333", color: "#fff", fontSize: ".8rem", outline: "none" }}
            >
              <option value="PERCENTAGE">Percentage Discount (%)</option>
              <option value="FIXED">Fixed Amount Discount (₦)</option>
            </select>
          </div>

          <div>
            <label style={{ display: "block", fontSize: ".45rem", letterSpacing: ".2em", color: "#888", textTransform: "uppercase", marginBottom: "4px" }}>Discount Value *</label>
            <input
              type="number"
              required
              placeholder="15"
              value={newPromo.discountValue}
              onChange={(e) => setNewPromo({ ...newPromo, discountValue: e.target.value })}
              style={{ width: "100%", padding: "12px", background: "#000", border: "1px solid #333", color: "#fff", fontSize: ".8rem", outline: "none" }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: ".45rem", letterSpacing: ".2em", color: "#888", textTransform: "uppercase", marginBottom: "4px" }}>Minimum Spend (₦)</label>
            <input
              type="number"
              placeholder="0"
              value={newPromo.minSpend}
              onChange={(e) => setNewPromo({ ...newPromo, minSpend: e.target.value })}
              style={{ width: "100%", padding: "12px", background: "#000", border: "1px solid #333", color: "#fff", fontSize: ".8rem", outline: "none" }}
            />
          </div>

          <button
            type="submit"
            disabled={submittingPromo}
            style={{
              width: "100%",
              padding: "16px",
              background: "#C4A962",
              color: "#000",
              border: "none",
              fontSize: ".6rem",
              letterSpacing: ".25em",
              textTransform: "uppercase",
              fontWeight: 600,
              cursor: submittingPromo ? "wait" : "pointer",
              marginTop: "10px",
            }}
          >
            {submittingPromo ? "Creating Promo..." : "Publish Promo Code →"}
          </button>
        </form>
      </div>
    </div>
  );
}
