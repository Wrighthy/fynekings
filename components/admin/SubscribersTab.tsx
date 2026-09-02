"use client";

import { useAdmin } from "./AdminContext";

export default function SubscribersTab() {
  const {
    subscribers,
    broadcast,
    setBroadcast,
    broadcastError,
    submittingBroadcast,
    handleBroadcast,
    exportSubscribersCsv,
    copySubscriberEmails,
    handleDeleteSubscriber,
  } = useAdmin();

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 480px), 1fr))", gap: "40px", alignItems: "start" }}>
      <div>
        <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: "1.8rem", marginBottom: "16px" }}>Subscribers ({subscribers.length})</h2>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "20px" }}>
          <button onClick={exportSubscribersCsv} style={{ background: "#C4A962", color: "#000", border: "none", padding: "10px 16px", fontSize: ".55rem", letterSpacing: ".15em", textTransform: "uppercase", fontWeight: 600, cursor: "pointer" }}>
            ⬇ Export CSV
          </button>
          <button onClick={copySubscriberEmails} style={{ background: "none", border: "1px solid #333", color: "#C4A962", padding: "10px 16px", fontSize: ".55rem", letterSpacing: ".15em", textTransform: "uppercase", fontWeight: 600, cursor: "pointer" }}>
            ⧉ Copy All Emails
          </button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "450px", overflowY: "auto" }}>
          {subscribers.map((s) => (
            <div key={s.id} style={{ background: "#121212", border: "1px solid #222", padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: ".7rem" }}>
              <span style={{ color: "#C4A962" }}>{s.email}</span>
              <span style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <span style={{ color: "#555" }}>{new Date(s.createdAt).toLocaleDateString()}</span>
                <button onClick={() => handleDeleteSubscriber(s.id)} title="Remove subscriber" style={{ background: "none", border: "none", color: "#ff6b6b", fontSize: ".6rem", cursor: "pointer" }}>
                  ✕
                </button>
              </span>
            </div>
          ))}
          {subscribers.length === 0 && (
            <div style={{ background: "#121212", border: "1px solid #222", padding: "40px", textAlign: "center", color: "#555", fontSize: ".7rem", letterSpacing: ".2em", textTransform: "uppercase" }}>
              No subscribers yet
            </div>
          )}
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
  );
}
