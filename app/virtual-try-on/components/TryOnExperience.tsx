"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { useHandTracking } from "../hooks/useHandTracking";
import {
  liveFrame,
  useTryOnStore,
  WATCH_OVERLAY_SIZE,
} from "../lib/tryOnStore";
import type { WristTransform } from "../lib/tryOnStore";

/** Delay before nudging the user to show their wrist (FR-08.2) */
const INSTRUCTION_DELAY_MS = 3000;

export default function TryOnExperience() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const [isWatchVisible, setIsWatchVisible] = useState(false);
  const [containerSize, setContainerSize] = useState({ w: 0, h: 0 });
  const [showInstructions, setShowInstructions] = useState(false);

  const instructionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasLockedRef = useRef(false);

  const selectedWatch = useTryOnStore((s) => s.selectedWatch);
  const isFrontCamera = useTryOnStore((s) => s.isFrontCamera);
  const watchScale = useTryOnStore((s) => s.watchScale);
  const cameraError = useTryOnStore((s) => s.cameraError);
  const setTrackingStatus = useTryOnStore((s) => s.setTrackingStatus);
  const setCameraReady = useTryOnStore((s) => s.setCameraReady);
  const setCameraError = useTryOnStore((s) => s.setCameraError);

  const clearInstructionTimer = useCallback(() => {
    if (instructionTimerRef.current) {
      clearTimeout(instructionTimerRef.current);
      instructionTimerRef.current = null;
    }
  }, []);

  const handleTrackingResult = useCallback(
    (t: WristTransform) => {
      // Publish for the screenshot compositor (non-reactive — see tryOnStore).
      liveFrame.transform = t;

      // Drive the overlay imperatively. Writing the transform straight to the
      // node keeps the LuxuryWatch subtree out of React's per-frame work — only
      // the composited transform changes, which is what `will-change` optimises.
      const el = overlayRef.current;
      if (el) {
        el.style.transform =
          `translate(${t.x}px, ${t.y}px) translate(-50%, -50%) ` +
          `rotate(${t.rotation}deg) scale(${t.scale})`;
      }

      // These setters no-op when the value is unchanged, so a steady lock costs
      // nothing beyond the transform write above.
      if (t.visible) {
        hasLockedRef.current = true;
        setIsWatchVisible(true);
        setTrackingStatus("locked");
        setShowInstructions(false);
        clearInstructionTimer();
      } else {
        setIsWatchVisible(false);
        setTrackingStatus(hasLockedRef.current ? "lost" : "searching");
        if (!instructionTimerRef.current) {
          instructionTimerRef.current = setTimeout(() => {
            setShowInstructions(true);
            instructionTimerRef.current = null;
          }, INSTRUCTION_DELAY_MS);
        }
      }
    },
    [setTrackingStatus, clearInstructionTimer]
  );

  const { start, stop, fps, error: trackingError } = useHandTracking(
    handleTrackingResult,
    containerSize.w,
    containerSize.h,
    isFrontCamera,
    watchScale
  );

  // Track container size — the transform is computed in container pixel space.
  useEffect(() => {
    const updateSize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      setContainerSize({ w, h });
      liveFrame.containerWidth = w;
      liveFrame.containerHeight = h;
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    window.addEventListener("orientationchange", updateSize);
    return () => {
      window.removeEventListener("resize", updateSize);
      window.removeEventListener("orientationchange", updateSize);
    };
  }, []);

  // Camera lifecycle — re-runs when the user flips the camera.
  useEffect(() => {
    let stream: MediaStream | null = null;
    let cancelled = false;

    const startCamera = async () => {
      try {
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: isFrontCamera ? "user" : "environment",
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
          });
        } catch {
          // Fall back to whatever camera the device will give us.
          stream = await navigator.mediaDevices.getUserMedia({ video: true });
        }

        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        const video = videoRef.current;
        if (!video) return;

        video.srcObject = stream;
        await video.play();

        liveFrame.video = video;
        setCameraError(null);
        setCameraReady(true);
        setTrackingStatus("searching");
        hasLockedRef.current = false;
        start(video);
      } catch (err) {
        if (!cancelled) setCameraError(getCameraErrorMessage(err));
      }
    };

    startCamera();

    return () => {
      cancelled = true;
      stop();
      clearInstructionTimer();
      liveFrame.video = null;
      setCameraReady(false);

      const active =
        stream ?? (videoRef.current?.srcObject as MediaStream | null);
      active?.getTracks().forEach((t) => t.stop());
      if (videoRef.current) videoRef.current.srcObject = null;
    };
    // `start`/`stop` are stable; re-running on camera flip is the intent.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFrontCamera]);

  // Publish FPS for the HUD to poll.
  useEffect(() => {
    liveFrame.fps = fps;
  }, [fps]);

  if (cameraError) {
    return (
      <div className="tryon-experience">
        <div className="tryon-camera-error">
          <div className="tryon-camera-error-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5">
              <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
              <circle cx="12" cy="13" r="4" />
              <line x1="4" y1="4" x2="20" y2="20" stroke="var(--crimson)" strokeWidth="2" />
            </svg>
          </div>
          <h3>Camera Access Required</h3>
          <p>{cameraError}</p>
          <button
            type="button"
            className="tryon-retry-btn"
            onClick={() => window.location.reload()}
          >
            Reload &amp; Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="tryon-experience">
      <video
        ref={videoRef}
        className={`tryon-video ${isFrontCamera ? "mirrored" : ""}`}
        autoPlay
        playsInline
        muted
      />

      {selectedWatch && (
        <div
          ref={overlayRef}
          className="tryon-watch-overlay"
          style={{
            width: `${WATCH_OVERLAY_SIZE}px`,
            height: `${WATCH_OVERLAY_SIZE}px`,
            opacity: isWatchVisible ? 1 : 0,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={selectedWatch.overlayUrl}
            alt={selectedWatch.name}
            className="tryon-watch-img"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              filter: "drop-shadow(0 4px 16px rgba(0,0,0,0.5))",
              pointerEvents: "none",
            }}
          />
        </div>
      )}

      {showInstructions && !isWatchVisible && (
        <div className="tryon-instructions">
          <div className="tryon-instructions-icon">
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1" opacity=".6">
              <path d="M18 11V6a4 4 0 00-4-4h-1a3.5 3.5 0 00-3 1.7A3.5 3.5 0 007 2H6a4 4 0 00-4 4v5" />
              <path d="M2 11v2a8 8 0 0016 0v-2" />
              <circle cx="10" cy="18" r="1" fill="var(--gold)" />
            </svg>
          </div>
          <h3>Show Your Wrist</h3>
          <p>Point your camera at your wrist to try on</p>
        </div>
      )}

      {trackingError && (
        <div className="tryon-instructions">
          <h3>Tracking Error</h3>
          <p>{trackingError}</p>
        </div>
      )}
    </div>
  );
}

function getCameraErrorMessage(err: unknown): string {
  if (err instanceof DOMException) {
    if (err.name === "NotAllowedError" || err.name === "SecurityError") {
      const ua = navigator.userAgent;
      if (/iPhone|iPad/.test(ua)) {
        return "Camera access was denied. Go to Settings → Safari → Camera & Microphone Access, then reload this page.";
      }
      if (/Android/.test(ua)) {
        return "Camera access was denied. Tap the lock icon in the address bar → Permissions → Camera → Allow.";
      }
      return "Camera access was denied. Click the camera icon in your browser's address bar to allow camera access, then reload.";
    }
    if (err.name === "NotFoundError" || err.name === "OverconstrainedError") {
      return "No camera found on this device. Please connect a camera and try again.";
    }
    if (err.name === "NotReadableError") {
      return "Camera is in use by another application. Please close other camera apps and try again.";
    }
  }
  if (!window.isSecureContext) {
    return "Camera access requires a secure connection (HTTPS). Please open this page over HTTPS.";
  }
  return "Could not access the camera. Please check your browser permissions.";
}


