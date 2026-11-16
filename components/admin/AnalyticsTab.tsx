"use client";

import { useAdmin } from "./AdminContext";
import { fmt } from "@/lib/store";

export default function AnalyticsTab() {
  const { analytics } = useAdmin();

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", marginBottom: "40px" }}>
        <div style={{ background: "#121212", border: "1px solid #222", padding: "24px" }}>
          <div style={{ fontSize: "14px", color: "#b8b8b8", textTransform: "uppercase", letterSpacing: ".2em" }}>Total Verified Revenue</div>
          <div style={{ fontFamily: "Playfair Display, serif", fontSize: "2rem", color: "#C4A962", marginTop: "8px" }}>{fmt(analytics?.metrics.totalRevenue || 0)}</div>
        </div>
        <div style={{ background: "#121212", border: "1px solid #222", padding: "24px" }}>
          <div style={{ fontSize: "14px", color: "#b8b8b8", textTransform: "uppercase", letterSpacing: ".2em" }}>Total Orders</div>
          <div style={{ fontFamily: "Playfair Display, serif", fontSize: "2rem", color: "#fff", marginTop: "8px" }}>{analytics?.metrics.totalOrders || 0}</div>
        </div>
        <div style={{ background: "#121212", border: "1px solid #222", padding: "24px" }}>
          <div style={{ fontSize: "14px", color: "#b8b8b8", textTransform: "uppercase", letterSpacing: ".2em" }}>Store Pageviews</div>
          <div style={{ fontFamily: "Playfair Display, serif", fontSize: "2rem", color: "#fff", marginTop: "8px" }}>{analytics?.metrics.totalPageviews || 0}</div>
        </div>
        <div style={{ background: "#121212", border: "1px solid #222", padding: "24px" }}>
          <div style={{ fontSize: "14px", color: "#b8b8b8", textTransform: "uppercase", letterSpacing: ".2em" }}>Paid Conversion Rate</div>
          <div style={{ fontFamily: "Playfair Display, serif", fontSize: "2rem", color: "#C4A962", marginTop: "8px" }}>{analytics?.metrics.conversionRate || "0.00"}%</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 480px), 1fr))", gap: "30px" }}>
        <div style={{ background: "#121212", border: "1px solid #222", padding: "28px" }}>
          <h3 style={{ fontFamily: "Playfair Display, serif", fontSize: "1.4rem", marginBottom: "16px" }}>Top Visited Pages</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {analytics?.topPages.map((p, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #222", paddingBottom: "8px", fontSize: "15px" }}>
                <span style={{ color: "#C4A962" }}>{p.url}</span>
                <span style={{ color: "#b8b8b8" }}>{p.count} hits</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: "#121212", border: "1px solid #222", padding: "28px" }}>
          <h3 style={{ fontFamily: "Playfair Display, serif", fontSize: "1.4rem", marginBottom: "16px" }}>Live Traffic Log</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "14px" }}>
            {analytics?.recentEvents.map((ev) => (
              <div key={ev.id} style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #222", paddingBottom: "6px" }}>
                <span>{ev.eventName} on <strong style={{ color: "#fff" }}>{ev.pageUrl}</strong></span>
                <span style={{ color: "#b8b8b8" }}>{new Date(ev.createdAt).toLocaleTimeString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
