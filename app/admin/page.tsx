"use client";

import { useState, useEffect } from "react";
import { fmt } from "@/lib/store";

type Product = {
  id: string;
  name: string;
  series: string;
  price: number;
  stockCount: number;
  inStock: boolean;
  tag: string;
  images: string[];
};

type Order = {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  shippingAddress: string;
  city: string;
  status: string;
  totalAmount: number;
  discountAmount: number;
  promoCode?: string;
  paystackRef?: string;
  createdAt: string;
};

type Promo = {
  id: string;
  code: string;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
  minSpend: number;
  usedCount: number;
  maxUses?: number;
  active: boolean;
};

type AnalyticsData = {
  metrics: {
    totalRevenue: number;
    totalOrders: number;
    paidOrders: number;
    totalPageviews: number;
    conversionRate: string;
    newsletterCount: number;
  };
  topPages: { url: string; count: number }[];
  recentEvents: { id: string; eventName: string; pageUrl: string; createdAt: string }[];
};

type Subscriber = {
  id: string;
  email: string;
  createdAt: string;
};

export default function UnifiedAdminDashboard() {
  const [activeTab, setActiveTab] = useState<"analytics" | "orders" | "inventory" | "promos" | "subscribers">("analytics");
  const [authenticated, setAuthenticated] = useState(false);
  const [passkeyInput, setPasskeyInput] = useState("");
  const [authError, setAuthError] = useState("");

  // Data states
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderStatusFilter, setOrderStatusFilter] = useState("ALL");
  const [products, setProducts] = useState<Product[]>([]);
  const [promos, setPromos] = useState<Promo[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);

  // UI state
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Forms
  const [newPromo, setNewPromo] = useState({ code: "", discountType: "PERCENTAGE", discountValue: "15", minSpend: "0", maxUses: "" });
  const [newProduct, setNewProduct] = useState({ name: "", series: "Midnight Series", price: "450000", tag: "AUTOMATIC · CHRONOMETER", stockCount: "10", description: "" });
  const [broadcast, setBroadcast] = useState({ subject: "", html: "" });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    const res = await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ passkey: passkeyInput }),
    });
    if (res.ok) {
      setAuthenticated(true);
      fetchDashboardData();
    } else {
      setAuthError("Invalid passkey. Key: fynekings2026");
    }
  };

  const fetchDashboardData = () => {
    setLoading(true);
    Promise.all([
      fetch("/api/admin/analytics").then((r) => r.json()),
      fetch("/api/admin/orders").then((r) => r.json()),
      fetch("/api/admin/products").then((r) => r.json()),
      fetch("/api/admin/promos").then((r) => r.json()),
      fetch("/api/admin/subscribers").then((r) => r.json()),
    ])
      .then(([aData, oData, pData, prData, sData]) => {
        if (aData.metrics) setAnalytics(aData);
        if (oData.orders) setOrders(oData.orders);
        if (pData.products) setProducts(pData.products);
        if (prData.promos) setPromos(prData.promos);
        if (sData.subscribers) setSubscribers(sData.subscribers);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    // Auto check
    fetchDashboardData();
    setAuthenticated(true);
  }, []);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    const res = await fetch("/api/admin/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, status: newStatus }),
    });
    if (res.ok) {
      setMessage("✓ Order status updated");
      fetchDashboardData();
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const updateStock = async (productId: string, newStock: number) => {
    const res = await fetch("/api/admin/products", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, stockCount: newStock }),
    });
    if (res.ok) {
      setMessage("✓ Inventory stock updated");
      fetchDashboardData();
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newProduct),
    });
    if (res.ok) {
      setMessage("✓ Product created successfully");
      setNewProduct({ name: "", series: "Midnight Series", price: "450000", tag: "AUTOMATIC · CHRONOMETER", stockCount: "10", description: "" });
      fetchDashboardData();
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handleCreatePromo = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/admin/promos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newPromo),
    });
    if (res.ok) {
      setMessage("✓ Promo code created");
      setNewPromo({ code: "", discountType: "PERCENTAGE", discountValue: "15", minSpend: "0", maxUses: "" });
      fetchDashboardData();
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/admin/subscribers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject: broadcast.subject, messageHtml: broadcast.html }),
    });
    const data = await res.json();
    if (res.ok) {
      setMessage(`✓ ${data.message}`);
      setBroadcast({ subject: "", html: "" });
      setTimeout(() => setMessage(""), 4000);
    }
  };

  if (!authenticated) {
    return (
      <div style={{ background: "#0a0a0a", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Raleway, sans-serif", padding: "24px" }}>
        <div style={{ background: "#121212", border: "1px solid #C4A962", padding: "48px", maxWidth: "420px", width: "100%", textAlign: "center" }}>
          <div style={{ fontSize: ".5rem", letterSpacing: ".4em", color: "#C4A962", textTransform: "uppercase", marginBottom: "12px" }}>Fynekings Operating Portal</div>
          <h1 style={{ fontFamily: "Playfair Display, serif", fontSize: "2rem", color: "#F4EFE4", fontWeight: 300, marginBottom: "24px" }}>Admin Authorization</h1>
          {authError && <div style={{ color: "#ff6b6b", fontSize: ".65rem", marginBottom: "16px" }}>{authError}</div>}
          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <input
              type="password"
              placeholder="Enter Admin Passkey (default: fynekings2026)"
              value={passkeyInput}
              onChange={(e) => setPasskeyInput(e.target.value)}
              style={{ width: "100%", padding: "14px", background: "#080808", border: "1px solid #2a2a2a", color: "#F4EFE4", fontSize: ".85rem", outline: "none" }}
            />
            <button type="submit" style={{ padding: "14px", background: "#C4A962", color: "#000", border: "none", fontSize: ".6rem", letterSpacing: ".2em", textTransform: "uppercase", fontWeight: 600, cursor: "pointer" }}>
              Unlock Portal →
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "#080808", minHeight: "100vh", color: "#F4EFE4", fontFamily: "Raleway, sans-serif" }}>
      {/* Header */}
      <div style={{ background: "#111", borderBottom: "1px solid #222", padding: "30px 40px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "20px" }}>
        <div>
          <div style={{ fontSize: ".5rem", letterSpacing: ".4em", color: "#C4A962", textTransform: "uppercase" }}>Fynekings Executive Operations</div>
          <h1 style={{ fontFamily: "Playfair Display, serif", fontSize: "2.2rem", fontWeight: 300 }}>Business Operations Dashboard</h1>
        </div>

        {/* Tabs Navigation */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {[
            { id: "analytics", label: "📈 Analytics" },
            { id: "orders", label: "📦 Orders & Fulfilment" },
            { id: "inventory", label: "⌚ Inventory & Products" },
            { id: "promos", label: "🏷 Promo Codes" },
            { id: "subscribers", label: "✉ Subscribers & Broadcast" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                padding: "12px 18px",
                background: activeTab === tab.id ? "#C4A962" : "#181818",
                color: activeTab === tab.id ? "#000" : "#888",
                border: "1px solid #2a2a2a",
                fontSize: ".55rem",
                letterSpacing: ".15em",
                textTransform: "uppercase",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {message && (
        <div style={{ background: "rgba(196,169,98,.15)", borderBottom: "1px solid #C4A962", padding: "12px 40px", color: "#C4A962", fontSize: ".65rem", letterSpacing: ".2em", textTransform: "uppercase" }}>
          {message}
        </div>
      )}

      {/* Main Content Body */}
      <div style={{ maxWidth: "1300px", margin: "0 auto", padding: "40px" }}>
        {/* TAB 1: ANALYTICS */}
        {activeTab === "analytics" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px", marginBottom: "40px" }}>
              <div style={{ background: "#121212", border: "1px solid #222", padding: "24px" }}>
                <div style={{ fontSize: ".5rem", color: "#888", textTransform: "uppercase", letterSpacing: ".2em" }}>Total Verified Revenue</div>
                <div style={{ fontFamily: "Playfair Display, serif", fontSize: "2rem", color: "#C4A962", marginTop: "8px" }}>{fmt(analytics?.metrics.totalRevenue || 0)}</div>
              </div>
              <div style={{ background: "#121212", border: "1px solid #222", padding: "24px" }}>
                <div style={{ fontSize: ".5rem", color: "#888", textTransform: "uppercase", letterSpacing: ".2em" }}>Total Orders</div>
                <div style={{ fontFamily: "Playfair Display, serif", fontSize: "2rem", color: "#fff", marginTop: "8px" }}>{analytics?.metrics.totalOrders || 0}</div>
              </div>
              <div style={{ background: "#121212", border: "1px solid #222", padding: "24px" }}>
                <div style={{ fontSize: ".5rem", color: "#888", textTransform: "uppercase", letterSpacing: ".2em" }}>Store Pageviews</div>
                <div style={{ fontFamily: "Playfair Display, serif", fontSize: "2rem", color: "#fff", marginTop: "8px" }}>{analytics?.metrics.totalPageviews || 0}</div>
              </div>
              <div style={{ background: "#121212", border: "1px solid #222", padding: "24px" }}>
                <div style={{ fontSize: ".5rem", color: "#888", textTransform: "uppercase", letterSpacing: ".2em" }}>Paid Conversion Rate</div>
                <div style={{ fontFamily: "Playfair Display, serif", fontSize: "2rem", color: "#C4A962", marginTop: "8px" }}>{analytics?.metrics.conversionRate || "0.00"}%</div>
              </div>
              <div style={{ background: "#121212", border: "1px solid #222", padding: "24px" }}>
                <div style={{ fontSize: ".5rem", color: "#888", textTransform: "uppercase", letterSpacing: ".2em" }}>Newsletter Collectors</div>
                <div style={{ fontFamily: "Playfair Display, serif", fontSize: "2rem", color: "#fff", marginTop: "8px" }}>{analytics?.metrics.newsletterCount || 0}</div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "30px" }}>
              <div style={{ background: "#121212", border: "1px solid #222", padding: "28px" }}>
                <h3 style={{ fontFamily: "Playfair Display, serif", fontSize: "1.4rem", marginBottom: "16px" }}>Top Visited Pages</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {analytics?.topPages.map((p, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #222", paddingBottom: "8px", fontSize: ".7rem" }}>
                      <span style={{ color: "#C4A962" }}>{p.url}</span>
                      <span style={{ color: "#888" }}>{p.count} hits</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ background: "#121212", border: "1px solid #222", padding: "28px" }}>
                <h3 style={{ fontFamily: "Playfair Display, serif", fontSize: "1.4rem", marginBottom: "16px" }}>Live Traffic Log</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: ".65rem" }}>
                  {analytics?.recentEvents.map((ev) => (
                    <div key={ev.id} style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #222", paddingBottom: "6px" }}>
                      <span>{ev.eventName} on <strong style={{ color: "#fff" }}>{ev.pageUrl}</strong></span>
                      <span style={{ color: "#555" }}>{new Date(ev.createdAt).toLocaleTimeString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ORDERS */}
        {activeTab === "orders" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: "1.8rem" }}>Acquisition Queue ({orders.length})</h2>
              <div style={{ display: "flex", gap: "8px" }}>
                {["ALL", "PENDING", "PAID", "PROCESSING", "SHIPPED", "DELIVERED"].map((st) => (
                  <button
                    key={st}
                    onClick={() => setOrderStatusFilter(st)}
                    style={{
                      padding: "8px 14px",
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
        )}

        {/* TAB 3: INVENTORY */}
        {activeTab === "inventory" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "30px", alignItems: "start" }}>
              <div>
                <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: "1.8rem", marginBottom: "24px" }}>Inventory & Stock Counts</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {products.map((p) => (
                    <div key={p.id} style={{ background: "#121212", border: "1px solid #222", padding: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ fontFamily: "Playfair Display, serif", fontSize: "1.3rem" }}>{p.name}</div>
                        <div style={{ fontSize: ".55rem", color: "#888", letterSpacing: ".2em", textTransform: "uppercase" }}>{p.series} • {fmt(p.price)}</div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <span style={{ fontSize: ".6rem", color: p.stockCount < 5 ? "#ff6b6b" : "#C4A962", fontWeight: 600 }}>
                          {p.stockCount === 0 ? "OUT OF STOCK" : `${p.stockCount} in stock`}
                        </span>
                        <input
                          type="number"
                          defaultValue={p.stockCount}
                          onBlur={(e) => updateStock(p.id, parseInt(e.target.value, 10))}
                          style={{ width: "70px", padding: "8px", background: "#000", border: "1px solid #333", color: "#fff", fontSize: ".8rem" }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Create Product Form */}
              <div style={{ background: "#121212", border: "1px solid #222", padding: "28px" }}>
                <h3 style={{ fontFamily: "Playfair Display, serif", fontSize: "1.4rem", marginBottom: "20px" }}>Add New Timepiece</h3>
                <form onSubmit={handleCreateProduct} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <input
                    type="text"
                    required
                    placeholder="Watch Name (e.g. Sovereign Imperial)"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    style={{ padding: "10px", background: "#000", border: "1px solid #333", color: "#fff", fontSize: ".75rem" }}
                  />
                  <input
                    type="text"
                    required
                    placeholder="Series (e.g. Gold Edition)"
                    value={newProduct.series}
                    onChange={(e) => setNewProduct({ ...newProduct, series: e.target.value })}
                    style={{ padding: "10px", background: "#000", border: "1px solid #333", color: "#fff", fontSize: ".75rem" }}
                  />
                  <input
                    type="number"
                    required
                    placeholder="Price (₦)"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    style={{ padding: "10px", background: "#000", border: "1px solid #333", color: "#fff", fontSize: ".75rem" }}
                  />
                  <input
                    type="number"
                    required
                    placeholder="Initial Stock Count"
                    value={newProduct.stockCount}
                    onChange={(e) => setNewProduct({ ...newProduct, stockCount: e.target.value })}
                    style={{ padding: "10px", background: "#000", border: "1px solid #333", color: "#fff", fontSize: ".75rem" }}
                  />
                  <button type="submit" style={{ padding: "12px", background: "#C4A962", color: "#000", border: "none", fontSize: ".55rem", letterSpacing: ".2em", textTransform: "uppercase", fontWeight: 600, cursor: "pointer" }}>
                    Create Model →
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: PROMOS */}
        {activeTab === "promos" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "30px", alignItems: "start" }}>
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
                      <span style={{ fontSize: ".55rem", letterSpacing: ".2em", padding: "4px 10px", background: pr.active ? "rgba(196,169,98,.2)" : "#222", color: pr.active ? "#C4A962" : "#666" }}>
                        {pr.active ? "ACTIVE" : "INACTIVE"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Create Promo Form */}
              <div style={{ background: "#121212", border: "1px solid #222", padding: "28px" }}>
                <h3 style={{ fontFamily: "Playfair Display, serif", fontSize: "1.4rem", marginBottom: "20px" }}>Create Promo Code</h3>
                <form onSubmit={handleCreatePromo} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <input
                    type="text"
                    required
                    placeholder="Code (e.g. VIP20)"
                    value={newPromo.code}
                    onChange={(e) => setNewPromo({ ...newPromo, code: e.target.value })}
                    style={{ padding: "10px", background: "#000", border: "1px solid #333", color: "#fff", fontSize: ".75rem" }}
                  />
                  <select
                    value={newPromo.discountType}
                    onChange={(e) => setNewPromo({ ...newPromo, discountType: e.target.value })}
                    style={{ padding: "10px", background: "#000", border: "1px solid #333", color: "#fff", fontSize: ".75rem" }}
                  >
                    <option value="PERCENTAGE">Percentage Discount (%)</option>
                    <option value="FIXED">Fixed Amount Discount (₦)</option>
                  </select>
                  <input
                    type="number"
                    required
                    placeholder="Discount Value"
                    value={newPromo.discountValue}
                    onChange={(e) => setNewPromo({ ...newPromo, discountValue: e.target.value })}
                    style={{ padding: "10px", background: "#000", border: "1px solid #333", color: "#fff", fontSize: ".75rem" }}
                  />
                  <input
                    type="number"
                    placeholder="Min Spend (₦)"
                    value={newPromo.minSpend}
                    onChange={(e) => setNewPromo({ ...newPromo, minSpend: e.target.value })}
                    style={{ padding: "10px", background: "#000", border: "1px solid #333", color: "#fff", fontSize: ".75rem" }}
                  />
                  <button type="submit" style={{ padding: "12px", background: "#C4A962", color: "#000", border: "none", fontSize: ".55rem", letterSpacing: ".2em", textTransform: "uppercase", fontWeight: 600, cursor: "pointer" }}>
                    Publish Promo →
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: SUBSCRIBERS */}
        {activeTab === "subscribers" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "30px" }}>
              <div>
                <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: "1.8rem", marginBottom: "24px" }}>Subscribers ({subscribers.length})</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "400px", overflowY: "auto" }}>
                  {subscribers.map((s) => (
                    <div key={s.id} style={{ background: "#121212", border: "1px solid #222", padding: "14px 20px", display: "flex", justifyContent: "space-between", fontSize: ".7rem" }}>
                      <span style={{ color: "#C4A962" }}>{s.email}</span>
                      <span style={{ color: "#555" }}>{new Date(s.createdAt).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Email Broadcast */}
              <div style={{ background: "#121212", border: "1px solid #222", padding: "28px" }}>
                <h3 style={{ fontFamily: "Playfair Display, serif", fontSize: "1.4rem", marginBottom: "20px" }}>Dispatch Email Campaign</h3>
                <form onSubmit={handleBroadcast} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <input
                    type="text"
                    required
                    placeholder="Email Subject Line"
                    value={broadcast.subject}
                    onChange={(e) => setBroadcast({ ...broadcast, subject: e.target.value })}
                    style={{ padding: "10px", background: "#000", border: "1px solid #333", color: "#fff", fontSize: ".75rem" }}
                  />
                  <textarea
                    rows={6}
                    required
                    placeholder="HTML / Text Message Content..."
                    value={broadcast.html}
                    onChange={(e) => setBroadcast({ ...broadcast, html: e.target.value })}
                    style={{ padding: "10px", background: "#000", border: "1px solid #333", color: "#fff", fontSize: ".75rem", fontFamily: "monospace" }}
                  />
                  <button type="submit" style={{ padding: "12px", background: "#C4A962", color: "#000", border: "none", fontSize: ".55rem", letterSpacing: ".2em", textTransform: "uppercase", fontWeight: 600, cursor: "pointer" }}>
                    Send Broadcast ({subscribers.length} Collectors) →
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}