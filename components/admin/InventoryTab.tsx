"use client";

import { useAdmin } from "./AdminContext";
import { fmt } from "@/lib/store";
import EditionManager from "./EditionManager";

export default function InventoryTab() {
  const {
    products,
    newProduct,
    setNewProduct,
    productError,
    submittingProduct,
    handleCreateProduct,
    updateStock,
    uploadingId,
    handleUploadImage,
    handleDeleteImage,
    handleDeleteProduct,
    fetchDashboardData,
  } = useAdmin();

  return (
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
      <EditionManager />
    </div>
  );
}
