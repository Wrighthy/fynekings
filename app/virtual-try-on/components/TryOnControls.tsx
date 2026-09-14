"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { fmt } from "@/lib/store";
import {
  liveFrame,
  useTryOnStore,
  WATCH_OVERLAY_SIZE,
} from "../lib/tryOnStore";
import type { TryOnProduct } from "../lib/tryOnStore";

type TryOnControlsProps = {
  products: TryOnProduct[];
};

const FLASH_DURATION_MS = 320;

export default function TryOnControls({ products }: TryOnControlsProps) {
  const [isFlashing, setIsFlashing] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [canShareFiles, setCanShareFiles] = useState(false);
  const flashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const selectedWatch = useTryOnStore((s) => s.selectedWatch);
  const watchScale = useTryOnStore((s) => s.watchScale);
  const isFrontCamera = useTryOnStore((s) => s.isFrontCamera);
  const screenshotData = useTryOnStore((s) => s.screenshotData);
  const selectWatch = useTryOnStore((s) => s.selectWatch);
  const setWatchScale = useTryOnStore((s) => s.setWatchScale);
  const takeScreenshot = useTryOnStore((s) => s.takeScreenshot);
  const clearScreenshot = useTryOnStore((s) => s.clearScreenshot);

  // Web Share with file payloads is not universal — only offer it where it works.
  useEffect(() => {
    try {
      const probe = new File([new Blob([""], { type: "image/png" })], "probe.png", {
        type: "image/png",
      });
      setCanShareFiles(Boolean(navigator.canShare?.({ files: [probe] })));
    } catch {
      setCanShareFiles(false);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
    };
  }, []);

  const handleCapture = useCallback(async () => {
    if (isCapturing) return;
    setIsCapturing(true);

    setIsFlashing(true);
    flashTimerRef.current = setTimeout(() => {
      setIsFlashing(false);
      flashTimerRef.current = null;
    }, FLASH_DURATION_MS);

    try {
      const dataUrl = await composeScreenshot(isFrontCamera);
      if (dataUrl) takeScreenshot(dataUrl);
    } finally {
      setIsCapturing(false);
    }
  }, [isCapturing, isFrontCamera, takeScreenshot]);

  return (
    <>
      {isFlashing && <div className="tryon-flash" aria-hidden="true" />}

      {screenshotData && (
        <ScreenshotPreview
          dataUrl={screenshotData}
          watchName={selectedWatch?.name}
          canShareFiles={canShareFiles}
          onClose={clearScreenshot}
        />
      )}

      <div className="tryon-controls">
        {/* ── Watch picker ── */}
        <div
          className="tryon-watch-picker"
          role="radiogroup"
          aria-label="Choose a watch to try on"
        >
          {products.map((product) => {
            const isActive = selectedWatch?.id === product.id;
            return (
              <button
                key={product.id}
                type="button"
                role="radio"
                aria-checked={isActive}
                className={`tryon-watch-thumb ${isActive ? "active" : ""}`}
                onClick={() => selectWatch(product)}
                title={`${product.name} — ${fmt(product.price)}`}
                aria-label={`${product.name} — ${fmt(product.price)}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={product.thumbnailUrl ?? product.overlayUrl}
                  alt={product.name}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    borderRadius: "inherit",
                  }}
                />
              </button>
            );
          })}
        </div>

        {/* ── Size slider (temporary — for testing) ── */}
        <div className="tryon-size-control">
          <label htmlFor="tryon-size" className="tryon-size-label">
            Size
            <span className="tryon-size-value">{Math.round(watchScale * 100)}%</span>
          </label>
          <input
            id="tryon-size"
            type="range"
            min="0.6"
            max="1.4"
            step="0.05"
            value={watchScale}
            onChange={(e) => setWatchScale(parseFloat(e.target.value))}
            className="tryon-size-slider"
            aria-label="Watch size adjustment"
          />
        </div>

        {/* ── Capture ── */}
        <button
          type="button"
          className="tryon-capture-btn"
          onClick={handleCapture}
          disabled={isCapturing}
          aria-label="Take screenshot"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
            <circle cx="12" cy="13" r="4" />
          </svg>
        </button>
      </div>
    </>
  );
}

// ============ SCREENSHOT PREVIEW ============

type ScreenshotPreviewProps = {
  dataUrl: string;
  watchName?: string;
  canShareFiles: boolean;
  onClose: () => void;
};

function ScreenshotPreview({
  dataUrl,
  watchName,
  canShareFiles,
  onClose,
}: ScreenshotPreviewProps) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const handleShare = async () => {
    try {
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], "fynekings-try-on.png", { type: "image/png" });
      await navigator.share({
        files: [file],
        title: "Fynekings Virtual Try-On",
        text: watchName ? `Trying on the ${watchName}` : undefined,
      });
    } catch {
      // User dismissed the share sheet, or sharing is unavailable — no action.
    }
  };

  return (
    <div className="tryon-shot" role="dialog" aria-modal="true" aria-label="Your try-on photo">
      <div className="tryon-shot-inner">
        <p className="tryon-shot-tag">Your Try-On</p>
        {/* Data URL from our own canvas — next/image would add no value here. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={dataUrl} alt="Your virtual try-on photo" className="tryon-shot-img" />

        <div className="tryon-shot-actions">
          <a href={dataUrl} download="fynekings-try-on.png" className="tryon-shot-btn primary">
            Download
          </a>
          {canShareFiles && (
            <button type="button" onClick={handleShare} className="tryon-shot-btn">
              Share
            </button>
          )}
          <button type="button" onClick={onClose} className="tryon-shot-btn">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ============ CANVAS COMPOSITING ============

/**
 * Composite the current camera frame and watch overlay into a PNG data URL.
 *
 * The canvas is sized in container (CSS) pixels rather than the camera's native
 * resolution, because the wrist transform is computed in container space. The
 * video is drawn with the same crop `object-fit: cover` applies on screen, so
 * the watch lands exactly where the user sees it.
 */
async function composeScreenshot(isFrontCamera: boolean): Promise<string | null> {
  const { video, transform, containerWidth, containerHeight } = liveFrame;
  if (!video || !video.videoWidth || !video.videoHeight) return null;

  const width = containerWidth || video.videoWidth;
  const height = containerHeight || video.videoHeight;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.scale(dpr, dpr);
  ctx.fillStyle = "#050505";
  ctx.fillRect(0, 0, width, height);

  // Replicate object-fit: cover.
  const coverScale = Math.max(width / video.videoWidth, height / video.videoHeight);
  const drawWidth = video.videoWidth * coverScale;
  const drawHeight = video.videoHeight * coverScale;
  const drawX = (width - drawWidth) / 2;
  const drawY = (height - drawHeight) / 2;

  ctx.save();
  if (isFrontCamera) {
    // The <video> is CSS-mirrored on screen; landmark X is mirrored to match, so
    // only the video needs flipping here — not the overlay.
    ctx.translate(width, 0);
    ctx.scale(-1, 1);
  }
  ctx.drawImage(video, drawX, drawY, drawWidth, drawHeight);
  ctx.restore();

  // Draw the live overlay (product image or SVG) at its tracked transform.
  if (transform.visible) {
    const overlayImg = document.querySelector<HTMLImageElement>(".tryon-watch-overlay img");
    const overlaySvg = document.querySelector<SVGSVGElement>(".tryon-watch-overlay svg");
    let overlaySource: HTMLImageElement | null = null;

    if (overlayImg) {
      // Product image is being used — draw it directly.
      overlaySource = overlayImg;
    } else if (overlaySvg) {
      // SVG fallback — rasterise it.
      overlaySource = await rasteriseSvg(overlaySvg, WATCH_OVERLAY_SIZE);
    }

    if (overlaySource) {
      const half = WATCH_OVERLAY_SIZE / 2;
      ctx.save();
      ctx.translate(transform.x, transform.y);
      ctx.rotate((transform.rotation * Math.PI) / 180);
      ctx.scale(transform.scale, transform.scale);
      ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
      ctx.shadowBlur = 20;
      ctx.shadowOffsetY = 4;
      ctx.drawImage(overlaySource, -half, -half, WATCH_OVERLAY_SIZE, WATCH_OVERLAY_SIZE);
      ctx.restore();
    }
  }

  drawWatermark(ctx, width, height);

  return canvas.toDataURL("image/png");
}

/** Serialise a live SVG node to an <img> that canvas can draw. */
function rasteriseSvg(
  svg: SVGSVGElement,
  size: number
): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const clone = svg.cloneNode(true) as SVGSVGElement;
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    clone.setAttribute("width", String(size));
    clone.setAttribute("height", String(size));
    // The source SVG sizes itself with inline width/height:100%, which resolves
    // to nothing once detached — override it so the raster has real dimensions.
    clone.style.width = `${size}px`;
    clone.style.height = `${size}px`;

    const markup = new XMLSerializer().serializeToString(clone);
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}`;
  });
}

function drawWatermark(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): void {
  ctx.save();
  ctx.textAlign = "right";
  ctx.textBaseline = "alphabetic";

  ctx.font = 'italic 20px "Playfair Display", Georgia, serif';
  ctx.fillStyle = "rgba(196, 169, 98, 0.9)";
  ctx.fillText("Fynekings", width - 20, height - 26);

  ctx.font = '9px "Raleway", system-ui, sans-serif';
  ctx.fillStyle = "rgba(244, 239, 228, 0.55)";
  ctx.fillText("V I R T U A L   T R Y - O N", width - 20, height - 12);

  ctx.restore();
}
