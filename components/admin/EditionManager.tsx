"use client";

import { useAdmin } from "./AdminContext";

export default function EditionManager() {
  const {
    editionData,
    setEditionData,
    editionError,
    setEditionError,
    submittingEdition,
    setSubmittingEdition,
    uploadingEditionImg,
    setMessage,
    fetchDashboardData,
  } = useAdmin();

  return (
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
  );
}
