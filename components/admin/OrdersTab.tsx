"use client";

import { useAdmin } from "./AdminContext";
import { fmt } from "@/lib/store";

export default function OrdersTab() {
  const { orders, orderStatusFilter, setOrderStatusFilter, updateOrderStatus } = useAdmin();

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
        <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: "1.8rem" }}>Acquisition Queue ({orders.length})</h2>
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {["ALL", "PENDING", "PAID", "PROCESSING", "SHIPPED", "DELIVERED"].map((st) => (
            <button
              key={st}
              onClick={() => setOrderStatusFilter(st)}
              style={{
                padding: "8px 12px",
                background: orderStatusFilter === st ? "#C4A962" : "#181818",
                color: orderStatusFilter === st ? "#000" : "#888",
                border: "none",
                fontSize: ".5rem",
                letterSpacing: ".15em",
                cursor: "pointer",
              }}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {orders
          .filter((o) => orderStatusFilter === "ALL" || o.status === orderStatusFilter)
          .map((o) => (
            <div key={o.id} style={{ background: "#121212", border: "1px solid #222", padding: "24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
              <div>
                <div style={{ fontSize: ".5rem", color: "#C4A962", letterSpacing: ".2em" }}>ORDER #{o.id.slice(-8).toUpperCase()}</div>
                <div style={{ fontFamily: "Playfair Display, serif", fontSize: "1.3rem", color: "#fff" }}>{o.customerName}</div>
                <div style={{ fontSize: ".65rem", color: "#888" }}>{o.customerEmail} • {o.customerPhone || "No Phone"}</div>
                <div style={{ fontSize: ".65rem", color: "#aaa", marginTop: "4px" }}>{o.shippingAddress}, {o.city}</div>
              </div>

              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: "Playfair Display, serif", fontSize: "1.4rem", color: "#C4A962" }}>{fmt(o.totalAmount)}</div>
                {o.promoCode && <div style={{ fontSize: ".5rem", color: "#888" }}>Promo: {o.promoCode} (-{fmt(o.discountAmount)})</div>}
                <div style={{ marginTop: "8px" }}>
                  <select
                    value={o.status}
                    onChange={(e) => updateOrderStatus(o.id, e.target.value)}
                    style={{ padding: "8px 12px", background: "#000", border: "1px solid #C4A962", color: "#C4A962", fontSize: ".6rem", outline: "none", cursor: "pointer" }}
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="PAID">PAID</option>
                    <option value="PROCESSING">PROCESSING</option>
                    <option value="SHIPPED">SHIPPED</option>
                    <option value="DELIVERED">DELIVERED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
