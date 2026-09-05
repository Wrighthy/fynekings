"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fmt } from "@/lib/store";
import { liveFrame, useTryOnStore } from "../lib/tryOnStore";
import type { TrackingStatus } from "../lib/tryOnStore";



const STATUS_TEXT: Record<TrackingStatus, string> = {
  initializing: "Loading AR engine...",
  searching: "Searching for hand...",
  locked: "Wrist Locked ✓",
  lost: "Hand lost — show your wrist",
};

/** The status dot reuses the amber "searching" treatment while initialising. */
const STATUS_DOT_CLASS: Record<TrackingStatus, string> = {
  initializing: "searching",
  searching: "searching",
  locked: "locked",
  lost: "lost",
};

export default function TryOnHUD() {
  const router = useRouter();
  const [fps, setFps] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  const selectedWatch = useTryOnStore((s) => s.selectedWatch);
  const trackingStatus = useTryOnStore((s) => s.trackingStatus);
  const showDebug = useTryOnStore((s) => s.showDebug);
  const toggleDebug = useTryOnStore((s) => s.toggleDebug);
  const toggleCamera = useTryOnStore((s) => s.toggleCamera);

  // Camera flip is only meaningful where there are two cameras (FR-02.7).
  useEffect(() => {
    setIsMobile(/Android|iPhone|iPad|iPod/i.test(navigator.userAgent));
  }, []);

  // Poll the FPS rather than subscribing to it — a readout that updates twice a
  // second is easier to read than one that changes every frame, and it keeps the
  // HUD out of the per-frame render path.
  useEffect(() => {
    const id = setInterval(() => setFps(liveFrame.fps), 500);
    return () => clearInterval(id);
  }, []);

  const handleBack = () => {
    // History API may be empty when the page was opened directly.
    if (window.history.length > 1) router.back();
    else router.push("/");
  };

  return (
    <div className="tryon-hud">
      {/* ── Top-left: back, status, FPS ── */}
      <div className="tryon-hud-tl">
        <button
          type="button"
          className="tryon-back-btn"
          onClick={handleBack}
          aria-label="Go back to previous page"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Back
        </button>

        <div className="tryon-status" role="status" aria-live="polite">
          <span className={`tryon-status-dot ${STATUS_DOT_CLASS[trackingStatus]}`} />
          <span>{STATUS_TEXT[trackingStatus]}</span>
        </div>

        <button
          type="button"
          className="tryon-fps"
          onClick={toggleDebug}
          aria-label={showDebug ? "Hide tracking details" : "Show tracking details"}
          aria-pressed={showDebug}
        >
          {fps} FPS
        </button>

        {showDebug && <DebugReadout />}
      </div>

      {/* ── Top-right: watch info, camera flip ── */}
      <div className="tryon-hud-tr">
        {selectedWatch && (
          <div className="tryon-watch-info">
            <span className="tryon-watch-info-name">{selectedWatch.name}</span>
            <span className="tryon-watch-info-price">{fmt(selectedWatch.price)}</span>
          </div>
        )}

        {isMobile && (
          <button
            type="button"
            className="tryon-flip-btn"
            onClick={toggleCamera}
            aria-label="Switch camera"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M15 4h3a2 2 0 012 2v3" />
              <path d="M20 15v3a2 2 0 01-2 2h-3" />
              <path d="M9 20H6a2 2 0 01-2-2v-3" />
              <path d="M4 9V6a2 2 0 012-2h3" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

/** Raw transform values, revealed by tapping the FPS counter. */
function DebugReadout() {
  const [snapshot, setSnapshot] = useState(() => ({ ...liveFrame.transform }));

  useEffect(() => {
    const id = setInterval(() => setSnapshot({ ...liveFrame.transform }), 250);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="tryon-debug">
      <span>x {Math.round(snapshot.x)}</span>
      <span>y {Math.round(snapshot.y)}</span>
      <span>rot {Math.round(snapshot.rotation)}°</span>
      <span>scale {snapshot.scale.toFixed(2)}</span>
    </div>
  );
}

