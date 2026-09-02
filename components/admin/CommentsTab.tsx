"use client";

import { useAdmin } from "./AdminContext";

export default function CommentsTab() {
  const { comments, commentFilter, setCommentFilter, updateCommentStatus, handleDeleteComment, fetchDashboardData } = useAdmin();

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", marginBottom: "24px" }}>
        <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: "1.8rem" }}>Comment Moderation</h2>
        <button onClick={fetchDashboardData} style={{ background: "none", border: "1px solid #333", color: "#C4A962", padding: "6px 12px", fontSize: ".5rem", textTransform: "uppercase", cursor: "pointer" }}>
          Refresh ↻
        </button>
      </div>

      {/* Status filters */}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "28px" }}>
        {([
          { id: "PENDING", label: `Pending (${comments.filter((c) => c.status === "PENDING").length})` },
          { id: "APPROVED", label: `Approved (${comments.filter((c) => c.status === "APPROVED").length})` },
          { id: "REJECTED", label: `Rejected (${comments.filter((c) => c.status === "REJECTED").length})` },
          { id: "ALL", label: `All (${comments.length})` },
        ] as const).map((f) => (
          <button
            key={f.id}
            onClick={() => setCommentFilter(f.id)}
            style={{
              padding: "10px 16px",
              background: commentFilter === f.id ? "#C4A962" : "#181818",
              color: commentFilter === f.id ? "#000" : "#888",
              border: "1px solid #2a2a2a",
              fontSize: ".55rem",
              letterSpacing: ".15em",
              textTransform: "uppercase",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {comments
          .filter((c) => commentFilter === "ALL" || c.status === commentFilter)
          .map((c) => (
            <div key={c.id} style={{ background: "#121212", border: "1px solid #222", padding: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", flexWrap: "wrap", marginBottom: "12px" }}>
                <div>
                  <div style={{ fontSize: ".5rem", letterSpacing: ".25em", color: "#C4A962", textTransform: "uppercase", marginBottom: "4px" }}>
                    {c.product?.name || "Deleted product"}
                  </div>
                  <div style={{ fontSize: ".8rem", color: "#fff" }}>
                    {c.name} <span style={{ color: "#555", fontSize: ".7rem" }}>· {c.email}</span>
                  </div>
                  <div style={{ fontSize: ".55rem", color: "#555", letterSpacing: ".15em", marginTop: "2px" }}>
                    {new Date(c.createdAt).toLocaleString()}
                  </div>
                </div>
                <span
                  style={{
                    padding: "5px 12px",
                    fontSize: ".5rem",
                    letterSpacing: ".2em",
                    textTransform: "uppercase",
                    fontWeight: 600,
                    border: "1px solid",
                    color: c.status === "PENDING" ? "#C4A962" : c.status === "APPROVED" ? "#6bd68b" : "#ff6b6b",
                    borderColor: c.status === "PENDING" ? "#C4A962" : c.status === "APPROVED" ? "#6bd68b" : "#ff6b6b",
                  }}
                >
                  {c.status}
                </span>
              </div>

              <p style={{ fontSize: ".8rem", color: "#ccc", lineHeight: 1.8, marginBottom: "18px", whiteSpace: "pre-wrap" }}>{c.body}</p>

              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", borderTop: "1px solid #1a1a1a", paddingTop: "14px" }}>
                {c.status !== "APPROVED" && (
                  <button onClick={() => updateCommentStatus(c.id, "APPROVED")} style={{ background: "#C4A962", color: "#000", border: "none", padding: "8px 16px", fontSize: ".55rem", letterSpacing: ".15em", textTransform: "uppercase", fontWeight: 600, cursor: "pointer" }}>
                    Approve ✓
                  </button>
                )}
                {c.status !== "REJECTED" && (
                  <button onClick={() => updateCommentStatus(c.id, "REJECTED")} style={{ background: "none", border: "1px solid #ff6b6b", color: "#ff6b6b", padding: "8px 16px", fontSize: ".55rem", letterSpacing: ".15em", textTransform: "uppercase", fontWeight: 600, cursor: "pointer" }}>
                    Reject ✕
                  </button>
                )}
                <button onClick={() => handleDeleteComment(c.id)} style={{ background: "none", border: "none", color: "#ff6b6b", fontSize: ".55rem", letterSpacing: ".15em", textTransform: "uppercase", cursor: "pointer", marginLeft: "auto" }}>
                  Delete 🗑
                </button>
              </div>
            </div>
          ))}

        {comments.filter((c) => commentFilter === "ALL" || c.status === commentFilter).length === 0 && (
          <div style={{ background: "#121212", border: "1px solid #222", padding: "40px", textAlign: "center", color: "#555", fontSize: ".7rem", letterSpacing: ".2em", textTransform: "uppercase" }}>
            No {commentFilter === "ALL" ? "" : commentFilter.toLowerCase() + " "}comments
          </div>
        )}
      </div>
    </div>
  );
}
