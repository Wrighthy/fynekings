"use client";

import { useState, useEffect } from "react";
import { AdminDashboardContext } from "@/components/admin/AdminContext";
import type {
  Product,
  Order,
  Promo,
  AnalyticsData,
  Subscriber,
  Comment,
  ContactMessage,
  LimitedEditionData,
  NewProductForm,
} from "@/components/admin/AdminContext";
import InventoryTab from "@/components/admin/InventoryTab";
import OrdersTab from "@/components/admin/OrdersTab";
import AnalyticsTab from "@/components/admin/AnalyticsTab";
import PromosTab from "@/components/admin/PromosTab";
import SubscribersTab from "@/components/admin/SubscribersTab";
import CommentsTab from "@/components/admin/CommentsTab";
import MessagesTab from "@/components/admin/MessagesTab";

export default function UnifiedAdminDashboard() {
  const [activeTab, setActiveTab] = useState<"analytics" | "orders" | "inventory" | "promos" | "subscribers" | "comments" | "messages">("inventory");
  const [authenticated, setAuthenticated] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [passkeyInput, setPasskeyInput] = useState("");
  const [authError, setAuthError] = useState("");

  // Data states
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderStatusFilter, setOrderStatusFilter] = useState("ALL");
  const [products, setProducts] = useState<Product[]>([]);
  const [promos, setPromos] = useState<Promo[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentFilter, setCommentFilter] = useState<"PENDING" | "APPROVED" | "REJECTED" | "ALL">("PENDING");
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [messageFilter, setMessageFilter] = useState<"NEW" | "HANDLED" | "ALL">("NEW");

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
  const [newProduct, setNewProduct] = useState<NewProductForm>({
    name: "",
    series: "Midnight Series",
    price: "450000",
    tag: "AUTOMATIC · CHRONOMETER",
    stockCount: "10",
    description: "",
    imageUrl: "",
    categories: ["men", "automatic", "classic"],
    movement: "automatic",
    strapMaterial: "leather",
    style: "luxury",
    isPremium: false,
    premiumCollection: "",
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
        setAuthError("Invalid passkey.");
      }
    } catch {
      setAuthError("Network error during authorization.");
    }
  };

  // Fetch that drops back to the passkey screen when the admin session has expired
  const adminFetch = (url: string) =>
    fetch(url).then((r) => {
      if (r.status === 401) setAuthenticated(false);
      return r.json();
    });

  const fetchDashboardData = () => {
    setLoading(true);
    Promise.all([
      adminFetch("/api/admin/analytics").catch(() => ({})),
      adminFetch("/api/admin/orders").catch(() => ({})),
      adminFetch("/api/admin/products").catch(() => ({})),
      adminFetch("/api/admin/promos").catch(() => ({})),
      adminFetch("/api/admin/subscribers").catch(() => ({})),
      adminFetch("/api/admin/comments").catch(() => ({})),
      adminFetch("/api/admin/messages").catch(() => ({})),
      adminFetch("/api/admin/edition").catch(() => null),
    ])
      .then(([aData, oData, pData, prData, sData, cData, mData, eData]) => {
        if (aData?.metrics) setAnalytics(aData);
        if (oData?.orders) setOrders(oData.orders);
        if (pData?.products) setProducts(pData.products);
        else if (Array.isArray(pData)) setProducts(pData);
        if (prData?.promos) setPromos(prData.promos);
        if (sData?.subscribers) setSubscribers(sData.subscribers);
        if (cData?.comments) setComments(cData.comments);
        if (mData?.messages) setMessages(mData.messages);
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
    // Check for an existing valid admin session before showing the passkey form
    fetch("/api/admin/auth")
      .then((r) => r.json())
      .then((data) => {
        if (data?.authenticated) {
          setAuthenticated(true);
          fetchDashboardData();
        }
      })
      .catch(() => { })
      .finally(() => setAuthChecking(false));
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

  const updateProductDetails = async (productId: string, data: Record<string, any>) => {
    try {
      const res = await fetch("/api/admin/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, ...data }),
      });
      if (res.ok) {
        setMessage("✓ Product details updated");
        fetchDashboardData();
        setTimeout(() => setMessage(""), 3000);
      } else {
        const err = await res.json();
        setMessage(`✕ Failed to update: ${err.error || "Unknown error"}`);
      }
    } catch {
      setMessage("✕ Network error updating product");
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

  // ——— Comment moderation ———

  const updateCommentStatus = async (commentId: string, status: string) => {
    const res = await fetch("/api/admin/comments", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ commentId, status }),
    });
    if (res.ok) {
      setMessage(`✓ Comment ${status === "APPROVED" ? "approved" : status === "REJECTED" ? "rejected" : "updated"}`);
      fetchDashboardData();
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("Permanently delete this comment?")) return;
    const res = await fetch(`/api/admin/comments?id=${commentId}`, { method: "DELETE" });
    if (res.ok) {
      setMessage("✓ Comment deleted");
      fetchDashboardData();
      setTimeout(() => setMessage(""), 3000);
    }
  };

  // ——— Contact message management ———

  const toggleMessageHandled = async (messageId: string, handled: boolean) => {
    const res = await fetch("/api/admin/messages", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messageId, handled }),
    });
    if (res.ok) {
      setMessage(handled ? "✓ Message marked as handled" : "✓ Message reopened");
      fetchDashboardData();
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm("Permanently delete this contact message?")) return;
    const res = await fetch(`/api/admin/messages?id=${messageId}`, { method: "DELETE" });
    if (res.ok) {
      setMessage("✓ Message deleted");
      fetchDashboardData();
      setTimeout(() => setMessage(""), 3000);
    }
  };

  // ——— Subscriber management ———

  const handleDeleteSubscriber = async (subscriberId: string) => {
    if (!confirm("Remove this subscriber from the newsletter list?")) return;
    const res = await fetch(`/api/admin/subscribers?id=${subscriberId}`, { method: "DELETE" });
    if (res.ok) {
      setMessage("✓ Subscriber removed");
      fetchDashboardData();
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const exportSubscribersCsv = () => {
    if (subscribers.length === 0) {
      setMessage("No subscribers to export yet.");
      setTimeout(() => setMessage(""), 3000);
      return;
    }
    const csvEscape = (value: string) => `"${value.replace(/"/g, '""')}"`;
    const rows = [
      ["Email", "Subscribed At"].map(csvEscape).join(","),
      ...subscribers.map((s) =>
        [csvEscape(s.email), csvEscape(new Date(s.createdAt).toISOString())].join(",")
      ),
    ];
    const csv = rows.join("\n");
    // UTF-8 BOM so Excel opens the file with correct encoding
    const blob = new Blob([String.fromCharCode(0xfeff) + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Fynekings-Newsletter-Subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setMessage(`✓ Exported ${subscribers.length} subscriber${subscribers.length > 1 ? "s" : ""} to CSV`);
    setTimeout(() => setMessage(""), 3000);
  };

  const copySubscriberEmails = async () => {
    if (subscribers.length === 0) {
      setMessage("No subscribers to copy yet.");
      setTimeout(() => setMessage(""), 3000);
      return;
    }
    try {
      await navigator.clipboard.writeText(subscribers.map((s) => s.email).join(", "));
      setMessage(`✓ ${subscribers.length} email${subscribers.length > 1 ? "s" : ""} copied to clipboard`);
    } catch {
      setMessage("✕ Clipboard access was blocked by your browser");
    }
    setTimeout(() => setMessage(""), 3000);
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
          categories: ["men", "automatic", "classic"],
          movement: "automatic",
          strapMaterial: "leather",
          style: "luxury",
          isPremium: false,
          premiumCollection: "",
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

  if (authChecking) {
    return (
      <div style={{ background: "#0a0a0a", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Raleway, sans-serif" }}>
        <div style={{ fontFamily: "Playfair Display, serif", fontSize: "1.2rem", color: "#C4A962", fontStyle: "italic" }}>Verifying session...</div>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div style={{ background: "#0a0a0a", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Raleway, sans-serif", padding: "24px" }}>
        <div style={{ background: "#121212", border: "1px solid #C4A962", padding: "48px", maxWidth: "420px", width: "100%", textAlign: "center" }}>
          <div style={{ fontSize: "14px", letterSpacing: ".12em", color: "#C4A962", textTransform: "uppercase", marginBottom: "12px" }}>Fynekings Operating Portal</div>
          <h1 style={{ fontFamily: "Playfair Display, serif", fontSize: "2rem", color: "#F4EFE4", fontWeight: 300, marginBottom: "24px" }}>Admin Authorization</h1>
          {authError && <div style={{ color: "#ff6b6b", fontSize: "14px", marginBottom: "16px" }}>{authError}</div>}
          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <input
              type="password"
              placeholder="Enter Admin Passkey"
              value={passkeyInput}
              onChange={(e) => setPasskeyInput(e.target.value)}
              style={{ width: "100%", padding: "14px", background: "#080808", border: "1px solid #2a2a2a", color: "#F4EFE4", fontSize: "15px", outline: "none" }}
            />
            <button type="submit" style={{ padding: "14px", background: "#C4A962", color: "#000", border: "none", fontSize: "14px", letterSpacing: ".2em", textTransform: "uppercase", fontWeight: 600, cursor: "pointer" }}>
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
          <div style={{ fontSize: "14px", letterSpacing: ".12em", color: "#C4A962", textTransform: "uppercase" }}>Fynekings Executive Operations</div>
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
            { id: "comments", label: "💬 Comment Moderation" },
            { id: "messages", label: "📨 Contact Messages" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              style={{
                padding: "12px 18px",
                background: activeTab === tab.id ? "#C4A962" : "#181818",
                color: activeTab === tab.id ? "#000" : "#888",
                border: "1px solid #2a2a2a",
                fontSize: "14px",
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
        <div style={{ background: "rgba(196,169,98,.15)", borderBottom: "1px solid #C4A962", padding: "14px 40px", color: "#C4A962", fontSize: "15px", letterSpacing: ".15em", textTransform: "uppercase", fontWeight: 600 }}>
          {message}
        </div>
      )}

      {/* Main Content Body */}
      <AdminDashboardContext.Provider
        value={{
          analytics,
          orders,
          products,
          promos,
          subscribers,
          comments,
          messages,
          editionData,
          orderStatusFilter,
          setOrderStatusFilter,
          commentFilter,
          setCommentFilter,
          messageFilter,
          setMessageFilter,
          newProduct,
          setNewProduct,
          newPromo,
          setNewPromo,
          broadcast,
          setBroadcast,
          setEditionData,
          setEditionError,
          setSubmittingEdition,
          setUploadingEditionImg,
          productError,
          promoError,
          broadcastError,
          editionError,
          submittingProduct,
          submittingPromo,
          submittingBroadcast,
          submittingEdition,
          uploadingId,
          uploadingEditionImg,
          fetchDashboardData,
          setMessage,
          updateOrderStatus,
          updateStock,
          updateProductDetails,
          handleUploadImage,
          handleDeleteImage,
          handleDeleteProduct,
          handleCreateProduct,
          handleCreatePromo,
          handleTogglePromo,
          handleDeletePromo,
          handleBroadcast,
          exportSubscribersCsv,
          copySubscriberEmails,
          handleDeleteSubscriber,
          updateCommentStatus,
          handleDeleteComment,
          toggleMessageHandled,
          handleDeleteMessage,
        }}
      >
        <div style={{ maxWidth: "1300px", margin: "0 auto", padding: "40px" }}>
          {activeTab === "inventory" && <InventoryTab />}
          {activeTab === "orders" && <OrdersTab />}
          {activeTab === "analytics" && <AnalyticsTab />}
          {activeTab === "promos" && <PromosTab />}
          {activeTab === "subscribers" && <SubscribersTab />}
          {activeTab === "comments" && <CommentsTab />}
          {activeTab === "messages" && <MessagesTab />}
        </div>
      </AdminDashboardContext.Provider>
    </div>
  );
}
