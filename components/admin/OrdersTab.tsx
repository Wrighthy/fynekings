"use client";

import { useState } from "react";
import { useAdmin } from "./AdminContext";
import type { Order } from "./AdminContext";
import { fmt } from "@/lib/store";

// Priced cart items recorded at checkout — same shape the server stores
// in Order.customConfig.
type OrderItem = {
  name: string;
  series: string;
  amount: number;
  fee: number;
  custom: { strapName: string; caseName: string; dialName: string } | null;
};

function orderItems(order: Order): OrderItem[] {
  const raw = order.customConfig;
  if (!Array.isArray(raw)) return [];

  const items: OrderItem[] = [];
  for (const entry of raw) {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) continue;
    const candidate = entry as Record<string, unknown>;
    if (typeof candidate.name !== "string") continue;

    const c = candidate.custom;
    const custom =
      c && typeof c === "object" && !Array.isArray(c)
        ? {
            strapName: String((c as Record<string, unknown>).strapName || ""),
            caseName: String((c as Record<string, unknown>).caseName || ""),
            dialName: String((c as Record<string, unknown>).dialName || ""),
          }
        : null;

    items.push({
      name: candidate.name,
      series: typeof candidate.series === "string" ? candidate.series : "",
      amount: typeof candidate.amount === "number" ? candidate.amount : 0,
      fee: typeof candidate.fee === "number" ? candidate.fee : 0,
      custom,
    });
  }
  return items;
}

export default function OrdersTab() {
  const { orders, orderStatusFilter, setOrderStatusFilter, updateOrderStatus } = useAdmin();
  const [expandedId, setExpandedId] = useState<string | null>(null);

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
          .map((o) => {
            const items = orderItems(o);
            const expanded = expandedId === o.id;

            return (
              <div key={o.id} style={{ background: "#121212", border: "1px solid #222", padding: "24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
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

                {/* Fulfillment details */}
                <div style={{ marginTop: "16px", borderTop: "1px solid #1a1a1a", paddingTop: "12px" }}>
                  <button
                    onClick={() => setExpandedId(expanded ? null : o.id)}
                    style={{ background: "none", border: "none", color: "#C4A962", fontSize: ".55rem", letterSpacing: ".15em", textTransform: "uppercase", fontWeight: 600, cursor: "pointer", padding: 0 }}
                  >
                    {expanded ? "Hide Fulfillment Details ▴" : "Fulfillment Details ▾"}
                  </button>

                  {expanded && (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))", gap: "24px", marginTop: "16px", animation: "fadeIn .25s ease" }}>
                      {/* Items purchased */}
                      <div>
                        <div style={{ fontSize: ".48rem", letterSpacing: ".25em", color: "#C4A962", textTransform: "uppercase", marginBottom: "10px" }}>Items to Fulfill</div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                          {items.length > 0 ? (
                            items.map((item, i) => (
                              <div key={i} style={{ background: "#0c0c0c", border: "1px solid #1e1e1e", padding: "12px 14px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", gap: "12px" }}>
                                  <div style={{ fontSize: ".75rem", color: "#fff" }}>{item.name}</div>
                                  <div style={{ fontSize: ".75rem", color: "#C4A962" }}>{fmt(item.amount)}</div>
                                </div>
                                <div style={{ fontSize: ".55rem", color: "#888", marginTop: "2px" }}>
                                  {item.series} • fee {fmt(item.fee)}
                                </div>
                                {item.custom && (
                                  <div style={{ fontSize: ".55rem", color: "#6bd68b", marginTop: "4px" }}>
                                    Custom build: {item.custom.strapName} strap · {item.custom.caseName} case · {item.custom.dialName} dial
                                  </div>
                                )}
                              </div>
                            ))
                          ) : o.product ? (
                            <div style={{ background: "#0c0c0c", border: "1px solid #1e1e1e", padding: "12px 14px" }}>
                              <div style={{ display: "flex", justifyContent: "space-between", gap: "12px" }}>
                                <div style={{ fontSize: ".75rem", color: "#fff" }}>{o.product.name}</div>
                                <div style={{ fontSize: ".75rem", color: "#C4A962" }}>{fmt(o.product.price)}</div>
                              </div>
                              <div style={{ fontSize: ".55rem", color: "#888", marginTop: "2px" }}>{o.product.series}</div>
                            </div>
                          ) : (
                            <div style={{ fontSize: ".6rem", color: "#555" }}>No item details recorded for this order.</div>
                          )}
                        </div>
                      </div>

                      {/* Order meta */}
                      <div>
                        <div style={{ fontSize: ".48rem", letterSpacing: ".25em", color: "#C4A962", textTransform: "uppercase", marginBottom: "10px" }}>Order Record</div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: ".62rem" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #1e1e1e", paddingBottom: "8px" }}>
                            <span style={{ color: "#888" }}>Placed</span>
                            <span style={{ color: "#fff" }}>{o.createdAt ? new Date(o.createdAt).toLocaleString() : "—"}</span>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #1e1e1e", paddingBottom: "8px" }}>
                            <span style={{ color: "#888" }}>Payment reference</span>
                            <span style={{ color: "#fff", fontFamily: "monospace", fontSize: ".58rem" }}>{o.paystackRef || "—"}</span>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #1e1e1e", paddingBottom: "8px" }}>
                            <span style={{ color: "#888" }}>Payment method</span>
                            <span style={{ color: "#C4A962", fontSize: ".58rem", fontWeight: 600 }}>
                              {o.paymentMethod || (o.paystackRef?.startsWith("FYN-BT") ? "BANK_TRANSFER" : "PAYSTACK")}
                            </span>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #1e1e1e", paddingBottom: "8px" }}>
                            <span style={{ color: "#888" }}>Customer account</span>
                            <span style={{ color: o.user ? "#6bd68b" : "#888" }}>{o.user ? o.user.email : "Guest checkout"}</span>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #1e1e1e", paddingBottom: "8px" }}>
                            <span style={{ color: "#888" }}>Ship to</span>
                            <span style={{ color: "#fff", textAlign: "right" }}>{o.shippingAddress}, {o.city}, {o.country || "Nigeria"}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

        {orders.filter((o) => orderStatusFilter === "ALL" || o.status === orderStatusFilter).length === 0 && (
          <div style={{ background: "#121212", border: "1px solid #222", padding: "40px", textAlign: "center", color: "#555", fontSize: ".7rem", letterSpacing: ".2em", textTransform: "uppercase" }}>
            No {orderStatusFilter === "ALL" ? "" : orderStatusFilter.toLowerCase() + " "}orders
          </div>
        )}
      </div>
    </div>
  );
}
