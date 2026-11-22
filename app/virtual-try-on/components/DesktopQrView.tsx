"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import QRCode from "qrcode";

type Props = {
  selectedWatchSlug?: string | null;
};

export default function DesktopQrView({ selectedWatchSlug }: Props) {
  const [copied, setCopied] = useState(false);
  const [qrSvg, setQrSvg] = useState<string | null>(null);

  // Exact target URL requested for mobile virtual try-on
  const targetUrl = selectedWatchSlug
    ? `https://fynekings.vercel.app/virtual-try-on?watch=${encodeURIComponent(selectedWatchSlug)}`
    : "https://fynekings.vercel.app/virtual-try-on";

  // Generate crisp, ISO-standard vector SVG QR code with High error correction
  useEffect(() => {
    let cancelled = false;

    QRCode.toString(targetUrl, {
      type: "svg",
      margin: 4,
      errorCorrectionLevel: "H",
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    })
      .then((svg) => {
        if (!cancelled) {
          setQrSvg(svg);
        }
      })
      .catch((err) => {
        console.error("QR Code generation error:", err);
      });

    return () => {
      cancelled = true;
    };
  }, [targetUrl]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(targetUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // silent fallback
    }
  };

  return (
    <div className="dqr-page">
      {/* ── Minimal nav bar ── */}
      <header className="dqr-nav">
        <Link href="/" className="dqr-logo">
          <Image
            src="/fynekings-crest-transparent.png"
            alt="Fynekings crest"
            width={26}
            height={26}
            className="dqr-logo-mark"
            priority
          />
          FYNE<span>KINGS</span>
        </Link>
        <Link href="/collection" className="dqr-nav-link">
          ← Collection
        </Link>
      </header>

      {/* ── Decorative top line ── */}
      <div className="dqr-top-rule" />

      {/* ── Main content ── */}
      <main className="dqr-main">
        {/* Left column – text */}
        <div className="dqr-left">
          <p className="dqr-eyebrow">Virtual Try-On · Atelier Experience</p>

          <h1 className="dqr-title">
            Crafted for the<br />
            <em>Mobile Wrist</em>
          </h1>

          <p className="dqr-subtitle">
            Our AR fitting room uses your phone&apos;s rear camera and MediaPipe
            hand-tracking. No app required — scan the QR code to open the experience on mobile.
          </p>

          {selectedWatchSlug && (
            <div className="dqr-watch-badge">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
              </svg>
              <span>Fitting link active for <strong>{selectedWatchSlug.replace(/-/g, " ")}</strong></span>
            </div>
          )}

          {/* Steps */}
          <ol className="dqr-steps">
            {[
              { n: "01", title: "Open Camera", body: "Launch the native camera app on your iOS or Android device." },
              { n: "02", title: "Scan the code", body: "Point your camera at the QR code and tap the banner that appears." },
              { n: "03", title: "Fit your watch", body: "Show the back of your wrist to the rear camera and hold steady." },
            ].map((s) => (
              <li key={s.n} className="dqr-step">
                <span className="dqr-step-n">{s.n}</span>
                <div>
                  <h4 className="dqr-step-title">{s.title}</h4>
                  <p className="dqr-step-body">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>

          {/* Action buttons */}
          <div className="dqr-actions">
            <button
              type="button"
              className="btn-primary dqr-copy-btn"
              onClick={handleCopyLink}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              <span>{copied ? "Link Copied!" : "Copy Mobile Link"}</span>
            </button>

            <Link href="/collection" className="btn-outline">
              <span>Browse Collection</span>
            </Link>
          </div>
        </div>

        {/* Right column – QR card */}
        <div className="dqr-right">
          <div className="dqr-qr-card">
            <div className="dqr-qr-frame">
              {qrSvg ? (
                <div
                  className="dqr-qr-container"
                  dangerouslySetInnerHTML={{ __html: qrSvg }}
                />
              ) : (
                <div className="dqr-qr-skeleton">
                  <span>Generating…</span>
                </div>
              )}
              {/* Corner decorators positioned outside quiet zone */}
              <div className="dqr-corner dqr-corner-tl" />
              <div className="dqr-corner dqr-corner-tr" />
              <div className="dqr-corner dqr-corner-bl" />
              <div className="dqr-corner dqr-corner-br" />
            </div>

            <div className="dqr-qr-label">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="5" y="2" width="14" height="20" rx="2" />
                <line x1="12" y1="18" x2="12.01" y2="18" strokeLinecap="round" strokeWidth="2.5" />
              </svg>
              <span>Scan with your phone&apos;s camera</span>
            </div>

            {/* Clickable direct link */}
            <a
              href={targetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="dqr-target-url"
              title="Click to test link directly"
            >
              {targetUrl}
            </a>

            <p className="dqr-qr-privacy">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              No sign-in. No data upload. Fully private.
            </p>
          </div>
        </div>
      </main>

      {/* ── Bottom rule ── */}
      <div className="dqr-bottom-rule">
        <span>FYNEKINGS INT LTD · Timepieces Redefined</span>
      </div>
    </div>
  );
}
