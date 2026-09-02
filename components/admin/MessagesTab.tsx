"use client";

import { useAdmin } from "./AdminContext";

export default function MessagesTab() {
  const { messages, messageFilter, setMessageFilter, toggleMessageHandled, handleDeleteMessage, fetchDashboardData } = useAdmin();

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", marginBottom: "24px" }}>
        <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: "1.8rem" }}>Contact Messages</h2>
        <button onClick={fetchDashboardData} style={{ background: "none", border: "1px solid #333", color: "#C4A962", padding: "6px 12px", fontSize: ".5rem", textTransform: "uppercase", cursor: "pointer" }}>
          Refresh ↻
        </button>
      </div>

      {/* Handled filters */}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "28px" }}>
        {([
          { id: "NEW", label: `New (${messages.filter((m) => !m.handled).length})` },
          { id: "HANDLED", label: `Handled (${messages.filter((m) => m.handled).length})` },
          { id: "ALL", label: `All (${messages.length})` },
        ] as const).map((f) => (
          <button
            key={f.id}
            onClick={() => setMessageFilter(f.id)}
            style={{
              padding: "10px 16px",
              background: messageFilter === f.id ? "#C4A962" : "#181818",
              color: messageFilter === f.id ? "#000" : "#888",
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
        {messages
          .filter((m) => messageFilter === "ALL" || (messageFilter === "NEW" ? !m.handled : m.handled))
          .map((m) => (
            <div key={m.id} style={{ background: "#121212", border: "1px solid #222", padding: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", flexWrap: "wrap", marginBottom: "12px" }}>
                <div>
                  <div style={{ fontSize: ".5rem", letterSpacing: ".25em", color: "#C4A962", textTransform: "uppercase", marginBottom: "4px" }}>
                    {m.subject}
                  </div>
                  <div style={{ fontSize: ".8rem", color: "#fff" }}>
                    {m.name} <span style={{ color: "#555", fontSize: ".7rem" }}>· {m.email}{m.phone ? ` · ${m.phone}` : ""}</span>
                  </div>
                  <div style={{ fontSize: ".55rem", color: "#555", letterSpacing: ".15em", marginTop: "2px" }}>
                    {new Date(m.createdAt).toLocaleString()}
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
                    color: m.handled ? "#6bd68b" : "#C4A962",
                    borderColor: m.handled ? "#6bd68b" : "#C4A962",
                  }}
                >
                  {m.handled ? "Handled" : "New"}
                </span>
              </div>

              <p style={{ fontSize: ".8rem", color: "#ccc", lineHeight: 1.8, marginBottom: "18px", whiteSpace: "pre-wrap" }}>{m.message}</p>

              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", borderTop: "1px solid #1a1a1a", paddingTop: "14px" }}>
                <a
                  href={`mailto:${m.email}?subject=${encodeURIComponent(`Re: ${m.subject}`)}`}
                  style={{ background: "#C4A962", color: "#000", padding: "8px 16px", fontSize: ".55rem", letterSpacing: ".15em", textTransform: "uppercase", fontWeight: 600, textDecoration: "none", cursor: "pointer" }}
                >
                  Reply ✉
                </a>
                <button
                  onClick={() => toggleMessageHandled(m.id, !m.handled)}
                  style={{ background: "none", border: `1px solid ${m.handled ? "#C4A962" : "#6bd68b"}`, color: m.handled ? "#C4A962" : "#6bd68b", padding: "8px 16px", fontSize: ".55rem", letterSpacing: ".15em", textTransform: "uppercase", fontWeight: 600, cursor: "pointer" }}
                >
                  {m.handled ? "Reopen ↺" : "Mark handled ✓"}
                </button>
                <button onClick={() => handleDeleteMessage(m.id)} style={{ background: "none", border: "none", color: "#ff6b6b", fontSize: ".55rem", letterSpacing: ".15em", textTransform: "uppercase", cursor: "pointer", marginLeft: "auto" }}>
                  Delete 🗑
                </button>
              </div>
            </div>
          ))}

        {messages.filter((m) => messageFilter === "ALL" || (messageFilter === "NEW" ? !m.handled : m.handled)).length === 0 && (
          <div style={{ background: "#121212", border: "1px solid #222", padding: "40px", textAlign: "center", color: "#555", fontSize: ".7rem", letterSpacing: ".2em", textTransform: "uppercase" }}>
            No {messageFilter === "ALL" ? "" : messageFilter === "NEW" ? "new " : "handled "}messages
          </div>
        )}
      </div>
    </div>
  );
}
