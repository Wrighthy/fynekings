"use client";

import { useState } from "react";
import { useAdmin } from "./AdminContext";
import type { Product } from "./AdminContext";
import { fmt } from "@/lib/store";
import EditionManager from "./EditionManager";
import {
  CATEGORIES,
  MOVEMENT_OPTIONS,
  STRAP_OPTIONS,
  STYLE_OPTIONS,
  PREMIUM_SUBCATEGORIES,
} from "@/lib/categories";

function ProductAttributeEditor({
  product,
  onSave,
}: {
  product: Product;
  onSave: (productId: string, data: Record<string, any>) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [selectedCats, setSelectedCats] = useState<string[]>(product.categories || []);
  const [movement, setMovement] = useState(product.movement || "");
  const [strap, setStrap] = useState(product.strapMaterial || "");
  const [style, setStyle] = useState(product.style || "");
  const [isPremium, setIsPremium] = useState<boolean>(product.isPremium || false);
  const [premiumCollection, setPremiumCollection] = useState<string>(product.premiumCollection || "");
  const [saving, setSaving] = useState(false);

  const toggleCategory = (slug: string) => {
    if (selectedCats.includes(slug)) {
      setSelectedCats(selectedCats.filter((c) => c !== slug));
    } else {
      setSelectedCats([...selectedCats, slug]);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(product.id, {
        categories: selectedCats,
        movement: movement || null,
        strapMaterial: strap || null,
        style: style || null,
        isPremium,
        premiumCollection: isPremium ? (premiumCollection || null) : null,
      });
      setOpen(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ marginTop: "14px", borderTop: "1px solid #1a1a1a", paddingTop: "12px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", alignItems: "center" }}>
          <span style={{ fontSize: ".5rem", color: "#888", textTransform: "uppercase", letterSpacing: ".1em" }}>
            Categories:
          </span>
          {selectedCats.length === 0 ? (
            <span style={{ fontSize: ".5rem", color: "#666", fontStyle: "italic" }}>None assigned</span>
          ) : (
            selectedCats.map((cat) => {
              const info = CATEGORIES.find((c) => c.slug === cat);
              return (
                <span
                  key={cat}
                  style={{
                    fontSize: ".46rem",
                    letterSpacing: ".08em",
                    background: "rgba(196,169,98,.12)",
                    border: "1px solid rgba(196,169,98,.3)",
                    color: "var(--gold, #C4A962)",
                    padding: "2px 7px",
                    borderRadius: "2px",
                    textTransform: "uppercase",
                  }}
                >
                  {info?.label || cat}
                </span>
              );
            })
          )}
        </div>

        <button
          type="button"
          onClick={() => setOpen(!open)}
          style={{
            background: "none",
            border: "1px solid #333",
            color: "#C4A962",
            padding: "4px 10px",
            fontSize: ".48rem",
            letterSpacing: ".15em",
            textTransform: "uppercase",
            cursor: "pointer",
          }}
        >
          {open ? "Close Edit ▲" : "Edit Tags ✎"}
        </button>
      </div>

      <div style={{ display: "flex", gap: "12px", marginTop: "8px", fontSize: ".5rem", color: "#888", flexWrap: "wrap", alignItems: "center" }}>
        <span>Movement: <strong style={{ color: "#fff" }}>{product.movement || "—"}</strong></span>
        <span>•</span>
        <span>Strap: <strong style={{ color: "#fff" }}>{product.strapMaterial || "—"}</strong></span>
        <span>•</span>
        <span>Style: <strong style={{ color: "#fff" }}>{product.style || "—"}</strong></span>
        {isPremium && (
          <>
            <span>•</span>
            <span
              style={{
                fontSize: ".44rem",
                letterSpacing: ".12em",
                background: "rgba(196,169,98,.18)",
                border: "1px solid rgba(196,169,98,.5)",
                color: "#C4A962",
                padding: "2px 8px",
                borderRadius: "2px",
                textTransform: "uppercase",
                fontWeight: 600,
              }}
            >
              ✦ PREMIUM{premiumCollection ? ` · ${PREMIUM_SUBCATEGORIES.find(s => s.slug === premiumCollection)?.label || premiumCollection}` : ""}
            </span>
          </>
        )}
      </div>

      {open && (
        <div
          style={{
            marginTop: "14px",
            background: "#0c0c0c",
            border: "1px solid #2a2a2a",
            padding: "16px",
            borderRadius: "3px",
          }}
        >
          <div style={{ fontSize: ".5rem", letterSpacing: ".2em", color: "#C4A962", textTransform: "uppercase", marginBottom: "10px" }}>
            Assign Watch Categories
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
              gap: "8px",
              marginBottom: "16px",
            }}
          >
            {CATEGORIES.map((cat) => {
              const isChecked = selectedCats.includes(cat.slug);
              return (
                <label
                  key={cat.slug}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: ".55rem",
                    color: isChecked ? "#fff" : "#888",
                    background: isChecked ? "rgba(196,169,98,.15)" : "#141414",
                    border: isChecked ? "1px solid #C4A962" : "1px solid #222",
                    padding: "6px 8px",
                    cursor: "pointer",
                    borderRadius: "2px",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleCategory(cat.slug)}
                    style={{ accentColor: "#C4A962" }}
                  />
                  <span>{cat.icon} {cat.label}</span>
                </label>
              );
            })}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "12px", marginBottom: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: ".46rem", letterSpacing: ".15em", color: "#888", textTransform: "uppercase", marginBottom: "4px" }}>Movement</label>
              <select
                value={movement}
                onChange={(e) => setMovement(e.target.value)}
                style={{ width: "100%", padding: "8px", background: "#000", border: "1px solid #333", color: "#fff", fontSize: ".65rem" }}
              >
                <option value="">Select Movement</option>
                {MOVEMENT_OPTIONS.map((m) => (
                  <option key={m.id} value={m.id}>{m.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: ".46rem", letterSpacing: ".15em", color: "#888", textTransform: "uppercase", marginBottom: "4px" }}>Strap Material</label>
              <select
                value={strap}
                onChange={(e) => setStrap(e.target.value)}
                style={{ width: "100%", padding: "8px", background: "#000", border: "1px solid #333", color: "#fff", fontSize: ".65rem" }}
              >
                <option value="">Select Strap</option>
                {STRAP_OPTIONS.map((s) => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: ".46rem", letterSpacing: ".15em", color: "#888", textTransform: "uppercase", marginBottom: "4px" }}>Watch Style</label>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                style={{ width: "100%", padding: "8px", background: "#000", border: "1px solid #333", color: "#fff", fontSize: ".65rem" }}
              >
                <option value="">Select Style</option>
                {STYLE_OPTIONS.map((st) => (
                  <option key={st.id} value={st.id}>{st.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* ── Premium Collection ── */}
          <div
            style={{
              marginBottom: "16px",
              padding: "14px",
              background: isPremium ? "rgba(196,169,98,.07)" : "#0a0a0a",
              border: `1px solid ${isPremium ? "rgba(196,169,98,.4)" : "#1e1e1e"}`,
              borderRadius: "3px",
              transition: "all .2s",
            }}
          >
            <div style={{ fontSize: ".5rem", letterSpacing: ".2em", color: "#C4A962", textTransform: "uppercase", marginBottom: "10px" }}>
              ✦ Premium Collection
            </div>
            <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", marginBottom: "12px" }}>
              <input
                type="checkbox"
                checked={isPremium}
                onChange={(e) => {
                  setIsPremium(e.target.checked);
                  if (!e.target.checked) setPremiumCollection("");
                }}
                style={{ accentColor: "#C4A962", width: "14px", height: "14px" }}
              />
              <span style={{ fontSize: ".6rem", color: isPremium ? "#C4A962" : "#888" }}>
                Mark as Premium Product
              </span>
            </label>
            {isPremium && (
              <div>
                <label style={{ display: "block", fontSize: ".46rem", letterSpacing: ".15em", color: "#888", textTransform: "uppercase", marginBottom: "6px" }}
                >Sub-Collection (optional)</label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: "6px" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: ".52rem", cursor: "pointer",
                    background: premiumCollection === "" ? "rgba(196,169,98,.15)" : "#111",
                    border: premiumCollection === "" ? "1px solid #C4A962" : "1px solid #222",
                    color: premiumCollection === "" ? "#fff" : "#888",
                    padding: "6px 8px", borderRadius: "2px" }}>
                    <input type="radio" name={`prem-${product.id}`} value="" checked={premiumCollection === ""}
                      onChange={() => setPremiumCollection("")} style={{ accentColor: "#C4A962" }} />
                    None
                  </label>
                  {PREMIUM_SUBCATEGORIES.map((sub) => (
                    <label key={sub.slug} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: ".52rem", cursor: "pointer",
                      background: premiumCollection === sub.slug ? "rgba(196,169,98,.15)" : "#111",
                      border: premiumCollection === sub.slug ? "1px solid #C4A962" : "1px solid #222",
                      color: premiumCollection === sub.slug ? "#fff" : "#888",
                      padding: "6px 8px", borderRadius: "2px" }}>
                      <input type="radio" name={`prem-${product.id}`} value={sub.slug}
                        checked={premiumCollection === sub.slug}
                        onChange={() => setPremiumCollection(sub.slug)}
                        style={{ accentColor: "#C4A962" }} />
                      {sub.icon} {sub.label}
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
            <button
              type="button"
              onClick={() => setOpen(false)}
              style={{ padding: "8px 14px", background: "none", border: "1px solid #333", color: "#888", fontSize: ".5rem", textTransform: "uppercase", cursor: "pointer" }}
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={handleSave}
              style={{
                padding: "8px 18px",
                background: "#C4A962",
                color: "#000",
                border: "none",
                fontSize: ".55rem",
                fontWeight: 600,
                letterSpacing: ".15em",
                textTransform: "uppercase",
                cursor: saving ? "wait" : "pointer",
              }}
            >
              {saving ? "Saving..." : "Save Product Details ✓"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function InventoryTab() {
  const {
    products,
    newProduct,
    setNewProduct,
    productError,
    submittingProduct,
    handleCreateProduct,
    updateStock,
    updateProductDetails,
    uploadingId,
    handleUploadImage,
    handleDeleteImage,
    handleDeleteProduct,
    fetchDashboardData,
  } = useAdmin();

  const toggleNewProductCategory = (slug: string) => {
    const current = newProduct.categories || [];
    if (current.includes(slug)) {
      setNewProduct({ ...newProduct, categories: current.filter((c) => c !== slug) });
    } else {
      setNewProduct({ ...newProduct, categories: [...current, slug] });
    }
  };

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

              {/* Stock and Upload */}
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

              {/* Categories & Filter Attributes manager */}
              <ProductAttributeEditor
                product={p}
                onSave={updateProductDetails}
              />
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

          {/* Categories Assignment */}
          <div style={{ borderTop: "1px solid #222", paddingTop: "14px", marginTop: "4px" }}>
            <label style={{ display: "block", fontSize: ".48rem", letterSpacing: ".2em", color: "#C4A962", textTransform: "uppercase", marginBottom: "8px" }}>
              Main Watch Categories (Multi-select)
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "8px" }}>
              {CATEGORIES.map((cat) => {
                const isChecked = (newProduct.categories || []).includes(cat.slug);
                return (
                  <label
                    key={cat.slug}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      fontSize: ".55rem",
                      color: isChecked ? "#fff" : "#888",
                      background: isChecked ? "rgba(196,169,98,.15)" : "#0c0c0c",
                      border: isChecked ? "1px solid #C4A962" : "1px solid #222",
                      padding: "8px",
                      cursor: "pointer",
                      borderRadius: "2px",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleNewProductCategory(cat.slug)}
                      style={{ accentColor: "#C4A962" }}
                    />
                    <span>{cat.icon} {cat.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Movement, Strap, Style Selects */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
            <div>
              <label style={{ display: "block", fontSize: ".45rem", letterSpacing: ".15em", color: "#888", textTransform: "uppercase", marginBottom: "4px" }}>Movement</label>
              <select
                value={newProduct.movement}
                onChange={(e) => setNewProduct({ ...newProduct, movement: e.target.value })}
                style={{ width: "100%", padding: "10px", background: "#000", border: "1px solid #333", color: "#fff", fontSize: ".7rem" }}
              >
                {MOVEMENT_OPTIONS.map((m) => (
                  <option key={m.id} value={m.id}>{m.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: ".45rem", letterSpacing: ".15em", color: "#888", textTransform: "uppercase", marginBottom: "4px" }}>Strap</label>
              <select
                value={newProduct.strapMaterial}
                onChange={(e) => setNewProduct({ ...newProduct, strapMaterial: e.target.value })}
                style={{ width: "100%", padding: "10px", background: "#000", border: "1px solid #333", color: "#fff", fontSize: ".7rem" }}
              >
                {STRAP_OPTIONS.map((s) => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: ".45rem", letterSpacing: ".15em", color: "#888", textTransform: "uppercase", marginBottom: "4px" }}>Style</label>
              <select
                value={newProduct.style}
                onChange={(e) => setNewProduct({ ...newProduct, style: e.target.value })}
                style={{ width: "100%", padding: "10px", background: "#000", border: "1px solid #333", color: "#fff", fontSize: ".7rem" }}
              >
                {STYLE_OPTIONS.map((st) => (
                  <option key={st.id} value={st.id}>{st.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Premium Collection Setting for New Product */}
          <div
            style={{
              padding: "12px",
              background: newProduct.isPremium ? "rgba(196,169,98,.07)" : "#0c0c0c",
              border: `1px solid ${newProduct.isPremium ? "rgba(196,169,98,.4)" : "#222"}`,
              borderRadius: "2px",
              marginTop: "4px",
            }}
          >
            <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", marginBottom: newProduct.isPremium ? "10px" : "0" }}>
              <input
                type="checkbox"
                checked={newProduct.isPremium}
                onChange={(e) =>
                  setNewProduct({
                    ...newProduct,
                    isPremium: e.target.checked,
                    premiumCollection: e.target.checked ? newProduct.premiumCollection : "",
                  })
                }
                style={{ accentColor: "#C4A962", width: "14px", height: "14px" }}
              />
              <span style={{ fontSize: ".55rem", color: newProduct.isPremium ? "#C4A962" : "#888", textTransform: "uppercase", letterSpacing: ".1em" }}>
                ✦ Mark as Premium Product
              </span>
            </label>
            {newProduct.isPremium && (
              <div>
                <label style={{ display: "block", fontSize: ".45rem", letterSpacing: ".15em", color: "#888", textTransform: "uppercase", marginBottom: "4px" }}>
                  Premium Subcategory
                </label>
                <select
                  value={newProduct.premiumCollection}
                  onChange={(e) => setNewProduct({ ...newProduct, premiumCollection: e.target.value })}
                  style={{ width: "100%", padding: "10px", background: "#000", border: "1px solid #333", color: "#fff", fontSize: ".7rem" }}
                >
                  <option value="">All Premium (No Subcategory)</option>
                  {PREMIUM_SUBCATEGORIES.map((sub) => (
                    <option key={sub.slug} value={sub.slug}>
                      {sub.icon} {sub.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
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
