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

type LimitedEditionData = {
  id?: string;
  name: string;
  reference: string;
  price: number;
  totalStock: number;
  soldCount: number;
  dropEndsAt: string;
  imageUrl?: string;
  description?: string;
  active: boolean;
};

export default function UnifiedAdminDashboard() {
  const [activeTab, setActiveTab] = useState<"analytics" | "orders" | "inventory" | "promos" | "subscribers">("inventory");
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
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  // Specific Form Errors & Submitting States
  const [productError, setProductError] = useState("");
  const [submittingProduct, setSubmittingProduct] = useState(false);

  const [promoError, setPromoError] = useState("");
  const [submittingPromo, setSubmittingPromo] = useState(false);

  const [broadcastError, setBroadcastError] = useState("");
  const [submittingBroadcast, setSubmittingBroadcast] = useState(false);

  // Limited Edition Drop State
  const [editionData, setEditionData] = useState<LimitedEditionData>({
    name: "Obsidian King",
    reference: "F-OBK/24",
    price: 850000,
    totalStock: 50,
    soldCount: 38,
    dropEndsAt: "",
    imageUrl: "",
    description: "Handcrafted timepieces for the African collector.",
    active: true,
  });
  const [editionError, setEditionError] = useState("");
  const [submittingEdition, setSubmittingEdition] = useState(false);
  const [uploadingEditionImg, setUploadingEditionImg] = useState(false);

  // Forms
  const [newPromo, setNewPromo] = useState({ code: "", discountType: "PERCENTAGE", discountValue: "15", minSpend: "0", maxUses: "" });
  const [newProduct, setNewProduct] = useState({
    name: "",
    series: "Midnight Series",
    price: "450000",
    tag: "AUTOMATIC · CHRONOMETER",
    stockCount: "10",
    description: "",
    imageUrl: "",
  });
  const [broadcast, setBroadcast] = useState({ subject: "", html: "" });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passkey: passkeyInput }),
      });
      if (res.ok) {
        setAuthenticated(true);
        fetchDashboardData();
      } else {
        setAuthError("Invalid passkey. Default key: fynekings2026");
      }
    } catch {
      setAuthError("Network error during authorization.");
    }
  };

  const fetchDashboardData = () => {
    setLoading(true);
    Promise.all([
      fetch("/api/admin/analytics").then((r) => r.json()).catch(() => ({})),
      fetch("/api/admin/orders").then((r) => r.json()).catch(() => ({})),
      fetch("/api/admin/products").then((r) => r.json()).catch(() => ({})),
      fetch("/api/admin/promos").then((r) => r.json()).catch(() => ({})),
      fetch("/api/admin/subscribers").then((r) => r.json()).catch(() => ({})),
      fetch("/api/admin/edition").then((r) => r.json()).catch(() => null),
    ])
      .then(([aData, oData, pData, prData, sData, eData]) => {
        if (aData?.metrics) setAnalytics(aData);
        if (oData?.orders) setOrders(oData.orders);
        if (pData?.products) setProducts(pData.products);
        else if (Array.isArray(pData)) setProducts(pData);
        if (prData?.promos) setPromos(prData.promos);
        if (sData?.subscribers) setSubscribers(sData.subscribers);
        if (eData && !eData.error) {
          setEditionData({
            ...eData,
            dropEndsAt: eData.dropEndsAt ? new Date(eData.dropEndsAt).toISOString().slice(0, 16) : "",
          });
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
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

  const handleUploadImage = async (productId: string, files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploadingId(productId);
    let uploadedCount = 0;
    let lastError = "";
    try {
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append("file", files[i]);
        formData.append("productId", productId);
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await res.json();
        if (res.ok && data.success) {
          uploadedCount++;
        } else {
          lastError = data.details || data.error || `HTTP ${res.status}`;
          console.error("Upload error for file", files[i].name, ":", lastError);
        }
      }
      if (uploadedCount > 0) {
        setMessage(`✓ ${uploadedCount} image${uploadedCount > 1 ? "s" : ""} uploaded successfully`);
        fetchDashboardData();
        setTimeout(() => setMessage(""), 5000);
      }
      if (lastError) {
        setMessage(`✕ Upload failed: ${lastError}`);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setMessage(`✕ Network error during upload: ${msg}`);
    } finally {
      setUploadingId(null);
    }
  };

  const handleDeleteImage = async (productId: string, imageUrl: string) => {
    if (!confirm("Remove this image from the watch?")) return;
    try {
      const res = await fetch("/api/upload", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, imageUrl }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMessage("✓ Image removed successfully");
        fetchDashboardData();
        setTimeout(() => setMessage(""), 4000);
      } else {
        setMessage(`✕ Failed to remove image: ${data.error || "Unknown error"}`);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setMessage(`✕ Network error: ${msg}`);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this watch model?")) return;
    const res = await fetch(`/api/admin/products?id=${productId}`, { method: "DELETE" });
    if (res.ok) {
      setMessage("✓ Watch model deleted");
      fetchDashboardData();
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setProductError("");

    if (!newProduct.name.trim() || !newProduct.price) {
      setProductError("Model Name and Price are required.");
      return;
    }

    setSubmittingProduct(true);
    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProduct),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setMessage(`✓ Watch model "${data.product.name}" created successfully!`);
        setNewProduct({
          name: "",
          series: "Midnight Series",
          price: "450000",
          tag: "AUTOMATIC · CHRONOMETER",
          stockCount: "10",
          description: "",
          imageUrl: "",
        });
        fetchDashboardData();
        setTimeout(() => setMessage(""), 4000);
      } else {
        setProductError(data.error || "Failed to create watch model.");
      }
    } catch (err) {
      console.error("Create product error:", err);
      setProductError("Network error. Please try again.");
    } finally {
      setSubmittingProduct(false);
    }
  };

  const handleCreatePromo = async (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError("");

    if (!newPromo.code.trim() || !newPromo.discountValue) {
      setPromoError("Promo Code and Discount Value are required.");
      return;
    }

    setSubmittingPromo(true);
    try {
      const res = await fetch("/api/admin/promos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPromo),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setMessage(`✓ Promo code ${data.promo.code} created!`);
        setNewPromo({ code: "", discountType: "PERCENTAGE", discountValue: "15", minSpend: "0", maxUses: "" });
        fetchDashboardData();
        setTimeout(() => setMessage(""), 4000);
      } else {
        setPromoError(data.error || "Failed to create promo code.");
      }
    } catch {
      setPromoError("Network error creating promo code.");
    } finally {
      setSubmittingPromo(false);
    }
  };

  const handleTogglePromo = async (promoId: string, currentActive: boolean) => {
    const res = await fetch("/api/admin/promos", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ promoId, active: !currentActive }),
    });
    if (res.ok) {
      setMessage("✓ Promo code status updated");
      fetchDashboardData();
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handleDeletePromo = async (promoId: string) => {
    const res = await fetch(`/api/admin/promos?id=${promoId}`, { method: "DELETE" });
    if (res.ok) {
      setMessage("✓ Promo code deleted");
      fetchDashboardData();
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    setBroadcastError("");

    if (!broadcast.subject.trim() || !broadcast.html.trim()) {
      setBroadcastError("Subject Line and Email Content are required.");
      return;
    }

    setSubmittingBroadcast(true);
    try {
      const res = await fetch("/api/admin/subscribers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: broadcast.subject, messageHtml: broadcast.html }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setMessage(`✓ ${data.message}`);
        setBroadcast({ subject: "", html: "" });
        fetchDashboardData();
        setTimeout(() => setMessage(""), 5000);
      } else {
        setBroadcastError(data.error || "Failed to send email campaign.");
      }
    } catch {
      setBroadcastError("Network error dispatching campaign.");
    } finally {
      setSubmittingBroadcast(false);
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
            { id: "inventory", label: "⌚ Inventory & Products" },
            { id: "orders", label: "📦 Orders & Fulfilment" },
            { id: "analytics", label: "📈 Analytics" },
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
        <div style={{ background: "rgba(196,169,98,.15)", borderBottom: "1px solid #C4A962", padding: "14px 40px", color: "#C4A962", fontSize: ".7rem", letterSpacing: ".15em", textTransform: "uppercase", fontWeight: 600 }}>
          {message}
        </div>
      )}

      {/* Main Content Body */}
      <div style={{ maxWidth: "1300px", margin: "0 auto", padding: "40px" }}>
        {/* TAB 1: INVENTORY & PRODUCTS */}
        {activeTab === "inventory" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 480px), 1fr))", gap: "40px", alignItems: "start" }}>
            {/* Products List & Stock Manager */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: "1.8rem" }}>Watch Collection ({products.length})</h2>
                <button onClick={fetchDashboardData} style={{ background: "none", border: "1px solid #333", color: "#C4A962", padding: "6px 12px", fontSize: ".5rem", textTransform: "uppercase", cursor: "pointer" }}>
                  Refresh List ↻
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {products.map((p) => (
                  <div key={p.id} style={{ background: "#121212", border: "1px solid #222", padding: "24px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
                      <div>
                        <div style={{ fontFamily: "Playfair Display, serif", fontSize: "1.3rem", color: "#fff" }}>{p.name}</div>
                        <div style={{ fontSize: ".55rem", color: "#888", letterSpacing: ".2em", textTransform: "uppercase", marginTop: "2px" }}>
                          {p.series} • <span style={{ color: "#C4A962" }}>{fmt(p.price)}</span>
                        </div>
                      </div>
                      <button onClick={() => handleDeleteProduct(p.id)} style={{ background: "none", border: "none", color: "#ff6b6b", fontSize: ".6rem", cursor: "pointer" }}>
                        Delete Model ✕
                      </button>
                    </div>

                    {/* Image thumbnails with delete */}
                    {p.images && p.images.length > 0 && (
                      <div style={{ display: "flex", gap: "8px", marginBottom: "16px", overflowX: "auto", flexWrap: "wrap" }}>
                        {p.images.map((img, idx) => (
                          <div
                            key={idx}
                            style={{ position: "relative", width: "64px", height: "64px", border: "1px solid #2a2a2a", overflow: "visible", flexShrink: 0 }}
                            title={`Image ${idx + 1} — click × to remove`}
                          >
                            <img src={img} alt={`Watch image ${idx + 1}`} style={{ width: "64px", height: "64px", objectFit: "cover", display: "block" }} />
                            <button
                              onClick={() => handleDeleteImage(p.id, img)}
                              title="Remove this image"
                              style={{
                                position: "absolute",
                                top: "-8px",
                                right: "-8px",
                                width: "20px",
                                height: "20px",
                                borderRadius: "50%",
                                background: "#ff4444",
                                color: "#fff",
                                border: "none",
                                fontSize: "10px",
                                lineHeight: "20px",
                                textAlign: "center",
                                cursor: "pointer",
                                fontWeight: 700,
                                padding: 0,
                                zIndex: 10,
                              }}
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #1a1a1a", paddingTop: "14px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span style={{ fontSize: ".58rem", color: p.stockCount < 5 ? "#ff6b6b" : "#C4A962", fontWeight: 600 }}>
                          {p.stockCount === 0 ? "OUT OF STOCK" : `${p.stockCount} IN STOCK`}
                        </span>
                        <input
                          type="number"
                          defaultValue={p.stockCount}
                          onBlur={(e) => updateStock(p.id, parseInt(e.target.value, 10))}
                          style={{ width: "64px", padding: "6px 8px", background: "#000", border: "1px solid #333", color: "#fff", fontSize: ".75rem" }}
                        />
                      </div>

                      <label style={{ padding: "8px 14px", background: uploadingId === p.id ? "#555" : "#222", border: "1px solid #333", color: "#C4A962", fontSize: ".5rem", letterSpacing: ".15em", textTransform: "uppercase", cursor: "pointer" }}>
                        {uploadingId === p.id ? "Uploading..." : "+ Add Images"}
                        <input type="file" multiple accept="image/*" style={{ display: "none" }} onChange={(e) => handleUploadImage(p.id, e.target.files)} />
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Create Watch Model Form */}
            <div style={{ background: "#121212", border: "1px solid #C4A962", padding: "32px" }}>
              <div style={{ fontSize: ".45rem", letterSpacing: ".3em", color: "#C4A962", textTransform: "uppercase", marginBottom: "8px" }}>Catalog Expansion</div>
              <h3 style={{ fontFamily: "Playfair Display, serif", fontSize: "1.6rem", marginBottom: "20px" }}>Create Watch Model</h3>

              {productError && (
                <div style={{ padding: "12px", background: "rgba(255,107,107,.15)", border: "1px solid #ff6b6b", color: "#ff6b6b", fontSize: ".65rem", marginBottom: "16px" }}>
                  {productError}
                </div>
              )}

              <form onSubmit={handleCreateProduct} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div>
                  <label style={{ display: "block", fontSize: ".45rem", letterSpacing: ".2em", color: "#888", textTransform: "uppercase", marginBottom: "4px" }}>Model Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sovereign Imperial Gold"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    style={{ width: "100%", padding: "12px", background: "#000", border: "1px solid #333", color: "#fff", fontSize: ".8rem", outline: "none" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: ".45rem", letterSpacing: ".2em", color: "#888", textTransform: "uppercase", marginBottom: "4px" }}>Series / Collection *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Gold Edition"
                    value={newProduct.series}
                    onChange={(e) => setNewProduct({ ...newProduct, series: e.target.value })}
                    style={{ width: "100%", padding: "12px", background: "#000", border: "1px solid #333", color: "#fff", fontSize: ".8rem", outline: "none" }}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: ".45rem", letterSpacing: ".2em", color: "#888", textTransform: "uppercase", marginBottom: "4px" }}>Price (₦) *</label>
                    <input
                      type="number"
                      required
                      placeholder="450000"
                      value={newProduct.price}
                      onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                      style={{ width: "100%", padding: "12px", background: "#000", border: "1px solid #333", color: "#fff", fontSize: ".8rem", outline: "none" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: ".45rem", letterSpacing: ".2em", color: "#888", textTransform: "uppercase", marginBottom: "4px" }}>Initial Stock *</label>
                    <input
                      type="number"
                      required
                      placeholder="10"
                      value={newProduct.stockCount}
                      onChange={(e) => setNewProduct({ ...newProduct, stockCount: e.target.value })}
                      style={{ width: "100%", padding: "12px", background: "#000", border: "1px solid #333", color: "#fff", fontSize: ".8rem", outline: "none" }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: ".45rem", letterSpacing: ".2em", color: "#888", textTransform: "uppercase", marginBottom: "4px" }}>Badge Tag</label>
                  <input
                    type="text"
                    placeholder="AUTOMATIC · CHRONOMETER"
                    value={newProduct.tag}
                    onChange={(e) => setNewProduct({ ...newProduct, tag: e.target.value })}
                    style={{ width: "100%", padding: "12px", background: "#000", border: "1px solid #333", color: "#fff", fontSize: ".8rem", outline: "none" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: ".45rem", letterSpacing: ".2em", color: "#888", textTransform: "uppercase", marginBottom: "4px" }}>Primary Image URL (Optional)</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={newProduct.imageUrl}
                    onChange={(e) => setNewProduct({ ...newProduct, imageUrl: e.target.value })}
                    style={{ width: "100%", padding: "12px", background: "#000", border: "1px solid #333", color: "#fff", fontSize: ".8rem", outline: "none" }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingProduct}
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
                    cursor: submittingProduct ? "wait" : "pointer",
                    marginTop: "10px",
                  }}
                >
                  {submittingProduct ? "Creating Model..." : "Create Watch Model →"}
                </button>
              </form>
            </div>

            {/* LIMITED EDITION DROP MANAGER */}
            <div style={{ gridColumn: "1 / -1", background: "#121212", border: "1px solid #C4A962", padding: "36px", marginTop: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px", flexWrap: "wrap", gap: "16px" }}>
                <div>
                  <div style={{ fontSize: ".48rem", letterSpacing: ".3em", color: "#C4A962", textTransform: "uppercase", marginBottom: "6px" }}>Featured Live Drop</div>
                  <h3 style={{ fontFamily: "Playfair Display, serif", fontSize: "1.8rem", color: "#fff" }}>Limited Edition Manager (Obsidian Drop)</h3>
                  <p style={{ fontSize: ".65rem", color: "#888", marginTop: "4px" }}>
                    Configure the live countdown drop, actual timepiece photography, pricing, and allocation numbers shown on the homepage.
                  </p>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: ".6rem", letterSpacing: ".15em", textTransform: "uppercase", color: editionData.active ? "#C4A962" : "#666" }}>
                    <input
                      type="checkbox"
                      checked={editionData.active}
                      onChange={(e) => setEditionData({ ...editionData, active: e.target.checked })}
                      style={{ accentColor: "#C4A962" }}
                    />
                    Live Drop Active
                  </label>
                </div>
              </div>

              {editionError && (
                <div style={{ padding: "12px", background: "rgba(255,107,107,.15)", border: "1px solid #ff6b6b", color: "#ff6b6b", fontSize: ".65rem", marginBottom: "20px" }}>
                  {editionError}
                </div>
              )}

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setEditionError("");
                  setSubmittingEdition(true);
                  try {
                    const res = await fetch("/api/admin/edition", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(editionData),
                    });
                    const data = await res.json();
                    if (res.ok && data.success) {
                      setMessage("✓ Limited Edition drop updated successfully!");
                      fetchDashboardData();
                      setTimeout(() => setMessage(""), 4000);
                    } else {
                      setEditionError(data.error || "Failed to update limited edition drop");
                    }
                  } catch (err: any) {
                    setEditionError(err.message || "Network error");
                  } finally {
                    setSubmittingEdition(false);
                  }
                }}
                style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))", gap: "28px", alignItems: "start" }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: ".45rem", letterSpacing: ".2em", color: "#888", textTransform: "uppercase", marginBottom: "4px" }}>Drop Name *</label>
                    <input
                      type="text"
                      required
                      value={editionData.name}
                      onChange={(e) => setEditionData({ ...editionData, name: e.target.value })}
                      style={{ width: "100%", padding: "12px", background: "#000", border: "1px solid #333", color: "#fff", fontSize: ".8rem" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: ".45rem", letterSpacing: ".2em", color: "#888", textTransform: "uppercase", marginBottom: "4px" }}>Reference Number *</label>
                    <input
                      type="text"
                      required
                      value={editionData.reference}
                      onChange={(e) => setEditionData({ ...editionData, reference: e.target.value })}
                      style={{ width: "100%", padding: "12px", background: "#000", border: "1px solid #333", color: "#fff", fontSize: ".8rem" }}
                    />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: ".45rem", letterSpacing: ".2em", color: "#888", textTransform: "uppercase", marginBottom: "4px" }}>Price (₦) *</label>
                      <input
                        type="number"
                        required
                        value={editionData.price}
                        onChange={(e) => setEditionData({ ...editionData, price: parseInt(e.target.value, 10) || 0 })}
                        style={{ width: "100%", padding: "12px", background: "#000", border: "1px solid #333", color: "#fff", fontSize: ".8rem" }}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: ".45rem", letterSpacing: ".2em", color: "#888", textTransform: "uppercase", marginBottom: "4px" }}>Total Allocation Units *</label>
                      <input
                        type="number"
                        required
                        value={editionData.totalStock}
                        onChange={(e) => setEditionData({ ...editionData, totalStock: parseInt(e.target.value, 10) || 0 })}
                        style={{ width: "100%", padding: "12px", background: "#000", border: "1px solid #333", color: "#fff", fontSize: ".8rem" }}
                      />
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: ".45rem", letterSpacing: ".2em", color: "#888", textTransform: "uppercase", marginBottom: "4px" }}>Claimed / Sold Units</label>
                      <input
                        type="number"
                        value={editionData.soldCount}
                        onChange={(e) => setEditionData({ ...editionData, soldCount: parseInt(e.target.value, 10) || 0 })}
                        style={{ width: "100%", padding: "12px", background: "#000", border: "1px solid #333", color: "#fff", fontSize: ".8rem" }}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: ".45rem", letterSpacing: ".2em", color: "#888", textTransform: "uppercase", marginBottom: "4px" }}>Drop End Expiration Date/Time</label>
                      <input
                        type="datetime-local"
                        value={editionData.dropEndsAt}
                        onChange={(e) => setEditionData({ ...editionData, dropEndsAt: e.target.value })}
                        style={{ width: "100%", padding: "12px", background: "#000", border: "1px solid #333", color: "#fff", fontSize: ".8rem", colorScheme: "dark" }}
                      />
                    </div>
                  </div>
                </div>

                {/* Right side: Image upload & Photo preview */}
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: ".45rem", letterSpacing: ".2em", color: "#888", textTransform: "uppercase", marginBottom: "4px" }}>Actual Timepiece Photo URL</label>
                    <input
                      type="url"
                      placeholder="https://..."
                      value={editionData.imageUrl || ""}
                      onChange={(e) => setEditionData({ ...editionData, imageUrl: e.target.value })}
                      style={{ width: "100%", padding: "12px", background: "#000", border: "1px solid #333", color: "#fff", fontSize: ".8rem" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "inline-block", padding: "12px 20px", background: uploadingEditionImg ? "#555" : "#222", border: "1px solid #C4A962", color: "#C4A962", fontSize: ".55rem", letterSpacing: ".2em", textTransform: "uppercase", cursor: "pointer", fontWeight: 600 }}>
                      {uploadingEditionImg ? "Uploading Photo..." : "📁 Upload New Actual Photo"}
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          setUploadingEditionImg(true);
                          try {
                            const formData = new FormData();
                            formData.append("file", file);
                            formData.append("productId", "limited_edition_drop");
                            const res = await fetch("/api/upload", { method: "POST", body: formData });
                            const data = await res.json();
                            if (res.ok && data.url) {
                              setEditionData(prev => ({ ...prev, imageUrl: data.url }));
                              setMessage("✓ Limited Edition photo uploaded");
                              setTimeout(() => setMessage(""), 3000);
                            } else {
                              setEditionError(data.error || "Upload failed");
                            }
                          } catch (err: any) {
                            setEditionError(err.message || "Upload error");
                          } finally {
                            setUploadingEditionImg(false);
                          }
                        }}
                      />
                    </label>
                  </div>

                  {/* Photo Preview Frame */}
                  <div style={{ marginTop: "4px" }}>
                    <div style={{ fontSize: ".45rem", letterSpacing: ".2em", color: "#888", textTransform: "uppercase", marginBottom: "8px" }}>Live Photo Preview</div>
                    <div style={{ width: "160px", height: "160px", borderRadius: "10px", overflow: "hidden", border: "1px solid #333", background: "#000", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {editionData.imageUrl ? (
                        <img src={editionData.imageUrl} alt="Edition Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <div style={{ fontSize: ".55rem", color: "#555", textAlign: "center", padding: "12px" }}>No photo uploaded (using default luxury photo)</div>
                      )}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submittingEdition}
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
                      cursor: submittingEdition ? "wait" : "pointer",
                      marginTop: "12px",
                    }}
                  >
                    {submittingEdition ? "Saving Edition..." : "Save Limited Edition Drop →"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* TAB 2: ORDERS */}
        {activeTab === "orders" && (
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
        )}

        {/* TAB 3: ANALYTICS */}
        {activeTab === "analytics" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", marginBottom: "40px" }}>
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
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 480px), 1fr))", gap: "30px" }}>
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

        {/* TAB 4: PROMOS */}
        {activeTab === "promos" && (
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
        )}

        {/* TAB 5: SUBSCRIBERS */}
        {activeTab === "subscribers" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 480px), 1fr))", gap: "40px", alignItems: "start" }}>
            <div>
              <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: "1.8rem", marginBottom: "24px" }}>Subscribers ({subscribers.length})</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "450px", overflowY: "auto" }}>
                {subscribers.map((s) => (
                  <div key={s.id} style={{ background: "#121212", border: "1px solid #222", padding: "14px 20px", display: "flex", justifyContent: "space-between", fontSize: ".7rem" }}>
                    <span style={{ color: "#C4A962" }}>{s.email}</span>
                    <span style={{ color: "#555" }}>{new Date(s.createdAt).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Email Broadcast */}
            <div style={{ background: "#121212", border: "1px solid #C4A962", padding: "32px" }}>
              <div style={{ fontSize: ".45rem", letterSpacing: ".3em", color: "#C4A962", textTransform: "uppercase", marginBottom: "8px" }}>Direct Marketing</div>
              <h3 style={{ fontFamily: "Playfair Display, serif", fontSize: "1.6rem", marginBottom: "20px" }}>Dispatch Email Campaign</h3>

              {broadcastError && (
                <div style={{ padding: "12px", background: "rgba(255,107,107,.15)", border: "1px solid #ff6b6b", color: "#ff6b6b", fontSize: ".65rem", marginBottom: "16px" }}>
                  {broadcastError}
                </div>
              )}

              <form onSubmit={handleBroadcast} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div>
                  <label style={{ display: "block", fontSize: ".45rem", letterSpacing: ".2em", color: "#888", textTransform: "uppercase", marginBottom: "4px" }}>Campaign Subject *</label>
                  <input
                    type="text"
                    required
                    placeholder="Exclusive Collector Invitation..."
                    value={broadcast.subject}
                    onChange={(e) => setBroadcast({ ...broadcast, subject: e.target.value })}
                    style={{ width: "100%", padding: "12px", background: "#000", border: "1px solid #333", color: "#fff", fontSize: ".8rem", outline: "none" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: ".45rem", letterSpacing: ".2em", color: "#888", textTransform: "uppercase", marginBottom: "4px" }}>Email Body HTML *</label>
                  <textarea
                    rows={6}
                    required
                    placeholder="<h1>Exclusive Access</h1><p>Discover our newest chronometer release...</p>"
                    value={broadcast.html}
                    onChange={(e) => setBroadcast({ ...broadcast, html: e.target.value })}
                    style={{ width: "100%", padding: "12px", background: "#000", border: "1px solid #333", color: "#fff", fontSize: ".75rem", fontFamily: "monospace", outline: "none" }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingBroadcast}
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
                    cursor: submittingBroadcast ? "wait" : "pointer",
                    marginTop: "10px",
                  }}
                >
                  {submittingBroadcast ? "Dispatching..." : `Send Broadcast (${subscribers.length} Collectors) →`}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}