"use client";

import { useState, useEffect } from "react";

type Product = {
    id: string;
    name: string;
    series: string;
    images: string[];
};

export default function AdminPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [uploading, setUploading] = useState<string | null>(null);
    const [message, setMessage] = useState("");

    useEffect(() => {
        fetch("/api/products")
            .then(r => r.json())
            .then(data => {
                if (Array.isArray(data)) setProducts(data);
            })
            .catch(() => {});
    }, []);

    const handleUpload = async (productId: string, files: FileList | null) => {
        if (!files || files.length === 0) return;
        setUploading(productId);

        try {
            for (let i = 0; i < files.length; i++) {
                const formData = new FormData();
                formData.append("file", files[i]);
                formData.append("productId", productId);

                const res = await fetch("/api/upload", { method: "POST", body: formData });
                if (!res.ok) {
                    const err = await res.json();
                    console.error("Upload failed:", err);
                }
            }

            // Force fresh fetch — bypass any cache
            // eslint-disable-next-line react-hooks/purity
            const updated = await fetch("/api/products?t=" + Date.now(), {
                cache: "no-store"
            }).then(r => r.json());

            setProducts(updated);
            setMessage(`✓ ${files.length} image${files.length > 1 ? "s" : ""} uploaded successfully`);
            setTimeout(() => setMessage(""), 4000);
        } catch (err) {
            console.error("Upload error:", err);
            setMessage("Upload failed — please try again");
        } finally {
            setUploading(null);
        }
    };
    const removeImage = async (productId: string, imageUrl: string) => {
        await fetch("/api/products/images", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId, imageUrl }),
        });
        const updated = await fetch("/api/products").then(r => r.json());
        setProducts(updated);
    };

    return (
        <div style={{ background: "#0a0a0a", minHeight: "100vh", padding: "60px 40px", fontFamily: "Raleway, sans-serif", color: "#F4EFE4" }}>
            <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
                <div style={{ marginBottom: "60px" }}>
                    <p style={{ fontSize: ".55rem", letterSpacing: ".4em", color: "#C4A962", textTransform: "uppercase", marginBottom: "12px" }}>Fynekings · Admin</p>
                    <h1 style={{ fontFamily: "Playfair Display, serif", fontSize: "3rem", fontWeight: 300, color: "#F4EFE4" }}>Product Image Manager</h1>
                    {message && (
                        <div style={{ marginTop: "16px", padding: "12px 24px", background: "rgba(196,169,98,.1)", border: "1px solid #C4A962", color: "#C4A962", fontSize: ".6rem", letterSpacing: ".2em", textTransform: "uppercase" }}>
                            {message}
                        </div>
                    )}
                </div>

                <div style={{ display: "grid", gap: "2px", background: "#1c1c1c" }}>
                    {products.map(p => (
                        <div key={p.id} style={{ background: "#0c0c0c", padding: "32px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
                                <div>
                                    <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: "1.4rem", fontWeight: 400, marginBottom: "4px" }}>{p.name}</h2>
                                    <p style={{ fontSize: ".55rem", letterSpacing: ".25em", color: "#5A5550", textTransform: "uppercase" }}>{p.series} · {p.images.length} images</p>
                                </div>
                                <label style={{ display: "inline-flex", alignItems: "center", gap: "12px", padding: "12px 24px", background: uploading === p.id ? "#888" : "#C4A962", color: "#0a0a0a", fontSize: ".55rem", letterSpacing: ".25em", textTransform: "uppercase", cursor: "pointer", fontWeight: 600 }}>
                                    {uploading === p.id ? "Uploading..." : "+ Upload Images"}
                                    <input type="file" multiple accept="image/*" style={{ display: "none" }} onChange={e => handleUpload(p.id, e.target.files)} disabled={uploading === p.id} />
                                </label>
                            </div>

                            {p.images.length > 0 ? (
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "8px" }}>
                                    {p.images.map((url, i) => (
                                        <div key={i} style={{ position: "relative", aspectRatio: "1", background: "#141414", border: "1px solid #2a2a2a", overflow: "hidden" }}>
                                            <img src={url} alt={`${p.name} ${i + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                            <button
                                                onClick={() => removeImage(p.id, url)}
                                                style={{ position: "absolute", top: "8px", right: "8px", background: "rgba(0,0,0,.8)", border: "1px solid #C4A962", color: "#C4A962", width: "28px", height: "28px", fontSize: ".7rem", cursor: "pointer" }}
                                            >
                                                ✕
                                            </button>
                                            {i === 0 && (
                                                <div style={{ position: "absolute", bottom: "8px", left: "8px", background: "#C4A962", color: "#0a0a0a", fontSize: ".4rem", letterSpacing: ".2em", padding: "3px 8px", textTransform: "uppercase", fontWeight: 600 }}>
                                                    Primary
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div style={{ padding: "40px", border: "1px dashed #2a2a2a", textAlign: "center", color: "#3a3530", fontSize: ".55rem", letterSpacing: ".3em", textTransform: "uppercase" }}>
                                    No images uploaded yet
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}