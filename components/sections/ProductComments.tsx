"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/lib/store";

type Comment = {
    id: string;
    name: string;
    body: string;
    createdAt: string;
};

const STORAGE_KEY = "fynekings_commenter";

function loadSavedProfile(): { name: string; email: string; remember: boolean } {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            if (typeof parsed.name === "string" && typeof parsed.email === "string") {
                return { name: parsed.name, email: parsed.email, remember: true };
            }
        }
    } catch {
        // localStorage unavailable (private mode / cleared) — start fresh
    }
    return { name: "", email: "", remember: true };
}

export default function ProductComments({ slug }: { slug: string }) {
    const showToast = useCart(s => s.showToast);
    const [comments, setComments] = useState<Comment[]>([]);
    const [form, setForm] = useState({ name: "", email: "", body: "" });
    const [remember, setRemember] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [notice, setNotice] = useState("");

    useEffect(() => {
        setForm(f => ({ ...f, ...loadSavedProfile() }));
    }, []);

    useEffect(() => {
        fetch(`/api/products/${slug}/comments`)
            .then(r => (r.ok ? r.json() : { comments: [] }))
            .then(data => {
                setComments(Array.isArray(data.comments) ? data.comments : []);
            })
            .catch(() => { });
    }, [slug]);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setNotice("");

        if (form.name.trim().length < 2) {
            showToast("Please enter your name");
            return;
        }
        if (!form.email.includes("@")) {
            showToast("Please enter a valid email");
            return;
        }
        if (form.body.trim().length < 5) {
            showToast("Please write a comment");
            return;
        }

        setSubmitting(true);
        try {
            const res = await fetch(`/api/products/${slug}/comments`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: form.name,
                    email: form.email,
                    body: form.body,
                }),
            });
            const data = await res.json();

            if (res.ok) {
                if (remember) {
                    try {
                        localStorage.setItem(
                            STORAGE_KEY,
                            JSON.stringify({ name: form.name.trim(), email: form.email.trim() })
                        );
                    } catch { /* storage unavailable — skip saving */ }
                } else {
                    try {
                        localStorage.removeItem(STORAGE_KEY);
                    } catch { /* ignore */ }
                }
                setForm(f => ({ ...f, body: "" }));
                setNotice("Thank you — your comment has been submitted and is awaiting moderation.");
            } else {
                showToast(data.error || "Something went wrong");
            }
        } catch {
            showToast("Connection error. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const inputStyle: React.CSSProperties = {
        width: "100%",
        padding: "14px 16px",
        background: "var(--dark2)",
        border: "1px solid var(--dark3)",
        color: "var(--white)",
        fontSize: ".8rem",
        letterSpacing: ".05em",
        outline: "none",
        fontFamily: "Raleway, sans-serif",
    };

    return (
        <section style={{ borderTop: "1px solid var(--dark3)", background: "var(--dark)", padding: "80px 24px" }}>
            <div style={{ maxWidth: "1300px", margin: "0 auto" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "16px" }}>
                    <span style={{ width: "24px", height: "1px", background: "var(--gold-dk)", display: "inline-block" }}></span>
                    <span style={{ fontSize: ".52rem", letterSpacing: ".4em", color: "var(--gold-dk)", textTransform: "uppercase" }}>Collector Voices</span>
                </div>
                <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: "clamp(1.8rem, 3vw, 2.6rem)", fontWeight: 300, color: "var(--white)", marginBottom: "48px", letterSpacing: "-.02em" }}>
                    Comments & <em style={{ color: "var(--gold)" }}>Impressions</em>
                </h2>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 420px), 1fr))", gap: "40px", alignItems: "start" }}>
                    {/* Comment form */}
                    <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                            <div>
                                <label style={{ display: "block", fontSize: ".45rem", letterSpacing: ".25em", color: "var(--muted)", textTransform: "uppercase", marginBottom: "6px" }}>Name *</label>
                                <input
                                    type="text"
                                    value={form.name}
                                    maxLength={60}
                                    placeholder="Your name"
                                    onChange={e => setForm({ ...form, name: e.target.value })}
                                    style={inputStyle}
                                />
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: ".45rem", letterSpacing: ".25em", color: "var(--muted)", textTransform: "uppercase", marginBottom: "6px" }}>Email *</label>
                                <input
                                    type="email"
                                    value={form.email}
                                    maxLength={120}
                                    placeholder="Your email"
                                    onChange={e => setForm({ ...form, email: e.target.value })}
                                    style={inputStyle}
                                />
                            </div>
                        </div>
                        <div>
                            <label style={{ display: "block", fontSize: ".45rem", letterSpacing: ".25em", color: "var(--muted)", textTransform: "uppercase", marginBottom: "6px" }}>Your Comment *</label>
                            <textarea
                                rows={5}
                                maxLength={1000}
                                value={form.body}
                                placeholder="Share your impressions of this timepiece..."
                                onChange={e => setForm({ ...form, body: e.target.value })}
                                style={{ ...inputStyle, resize: "vertical", lineHeight: 1.8 }}
                            />
                        </div>

                        <label style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: ".55rem", letterSpacing: ".15em", color: "var(--muted)", textTransform: "uppercase", cursor: "pointer" }}>
                            <input
                                type="checkbox"
                                checked={remember}
                                onChange={e => setRemember(e.target.checked)}
                                style={{ accentColor: "#C4A962", width: "14px", height: "14px", cursor: "pointer" }}
                            />
                            Remember my details for next time
                        </label>

                        {notice && (
                            <div style={{ padding: "14px 16px", background: "rgba(196,169,98,.1)", border: "1px solid var(--gold-dk)", color: "var(--gold)", fontSize: ".65rem", letterSpacing: ".1em" }}>
                                {notice}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={submitting}
                            style={{
                                padding: "16px",
                                background: "var(--gold)",
                                color: "var(--black)",
                                border: "none",
                                fontSize: ".6rem",
                                letterSpacing: ".32em",
                                textTransform: "uppercase",
                                fontWeight: 600,
                                fontFamily: "Raleway, sans-serif",
                                cursor: submitting ? "wait" : "pointer",
                                opacity: submitting ? 0.7 : 1,
                                transition: "background .3s",
                            }}
                            onMouseEnter={e => (e.currentTarget.style.background = "var(--gold-lt)")}
                            onMouseLeave={e => (e.currentTarget.style.background = "var(--gold)")}
                        >
                            {submitting ? "Submitting..." : "Submit Comment →"}
                        </button>
                        <p style={{ fontSize: ".5rem", letterSpacing: ".15em", color: "var(--muted)", textTransform: "uppercase" }}>
                            Comments are reviewed by our gallery before appearing · Your email is never published
                        </p>
                    </form>

                    {/* Approved comments list */}
                    <div>
                        <div style={{ fontSize: ".52rem", letterSpacing: ".3em", color: "var(--gold)", textTransform: "uppercase", marginBottom: "24px" }}>
                            {comments.length > 0 ? `${comments.length} Comment${comments.length > 1 ? "s" : ""}` : "Comments"}
                        </div>
                        {comments.length === 0 ? (
                            <div style={{ padding: "32px", border: "1px solid var(--dark3)", background: "var(--dark2)", fontSize: ".7rem", letterSpacing: ".1em", color: "var(--muted)", lineHeight: 2 }}>
                                No comments yet — be the first to share your thoughts on this timepiece.
                            </div>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                {comments.map(c => (
                                    <div key={c.id} style={{ padding: "24px", border: "1px solid var(--dark3)", background: "var(--dark2)" }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "12px", marginBottom: "12px", flexWrap: "wrap" }}>
                                            <span style={{ fontFamily: "Playfair Display, serif", fontSize: "1rem", color: "var(--white)" }}>{c.name}</span>
                                            <span style={{ fontSize: ".5rem", letterSpacing: ".2em", color: "var(--muted)", textTransform: "uppercase" }}>
                                                {new Date(c.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
                                            </span>
                                        </div>
                                        <div style={{ width: "32px", height: "1px", background: "linear-gradient(to right, var(--gold-dk), transparent)", marginBottom: "14px" }}></div>
                                        <p style={{ fontSize: ".72rem", letterSpacing: ".05em", lineHeight: 2, color: "var(--text)" }}>{c.body}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
