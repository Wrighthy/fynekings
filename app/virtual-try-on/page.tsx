"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import TryOnLoading from "./components/TryOnLoading";
import SnapshotTryOn from "./components/SnapshotTryOn";
import DesktopQrView from "./components/DesktopQrView";
import { getHandLandmarker, prefetchSegmenter, resetHandLandmarker } from "./lib/tryon/models";
import { GUIDANCE } from "./lib/tryon/constants";
import { releaseSnapshotSession } from "./lib/tryon/snapshotSession";
import { resetDepthWorker } from "./lib/tryon/depthClient";
import {
  useTryOnStore,
  type TryOnProduct,
} from "./lib/tryOnStore";

/** Shape of the rows returned by GET /api/tryon-watches. */
type TryOnWatchResponse = TryOnProduct & Record<string, unknown>;

/** How long the loading screen keeps playing its fade before unmounting. */
const FADE_OUT_MS = 500;

export default function VirtualTryOnPage() {
  // useSearchParams needs a Suspense boundary to keep this route prerenderable.
  return (
    <Suspense fallback={<TryOnLoading />}>
      <VirtualTryOn />
    </Suspense>
  );
}

function VirtualTryOn() {
  const searchParams = useSearchParams();
  const requestedSlug = searchParams.get("watch");
  const forceMobile = searchParams.get("force") === "1" || searchParams.get("mobile") === "1";

  // Device detection state: null until checked on client
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  const [products, setProducts] = useState<TryOnProduct[]>([]);
  const [isModelReady, setIsModelReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [modelProgress, setModelProgress] = useState<string | undefined>();
  const [showLoading, setShowLoading] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [attempt, setAttempt] = useState(0);

  const isCameraReady = useTryOnStore((s) => s.isCameraReady);
  const cameraError = useTryOnStore((s) => s.cameraError);
  const selectWatch = useTryOnStore((s) => s.selectWatch);
  const setFrontCamera = useTryOnStore((s) => s.setFrontCamera);

  // Keep the latest slug available to the fetch effect without re-fetching when
  // the query string changes after products have already loaded.
  const requestedSlugRef = useRef(requestedSlug);
  requestedSlugRef.current = requestedSlug;

  // ── 1. Detect device type (Desktop vs Mobile) ──
  useEffect(() => {
    const ua = navigator.userAgent || "";
    const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
    const isTouchDevice = navigator.maxTouchPoints > 0;
    const isSmallScreen = window.innerWidth <= 1024;
    setIsMobile(isMobileUA || (isTouchDevice && isSmallScreen));
  }, []);

  const shouldShowTryOn = Boolean(isMobile || forceMobile);

  // ── 2. Choose default camera on mobile ──
  useEffect(() => {
    if (!shouldShowTryOn) return;
    const isMobileDevice = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    setFrontCamera(!isMobileDevice);
  }, [setFrontCamera, shouldShowTryOn]);

  // ── 3. Fetch the catalogue (only when running try-on) ──
  useEffect(() => {
    if (!shouldShowTryOn) return;
    let cancelled = false;

    const load = async () => {
      try {
        const res = await fetch("/api/tryon-watches");
        if (!res.ok) throw new Error(`Try-on watches request failed (${res.status})`);

        const data: TryOnWatchResponse[] = await res.json();
        if (cancelled) return;
        if (!Array.isArray(data) || data.length === 0) {
          throw new Error("No watches are available to try on right now.");
        }

        setProducts(data);

        const slug = requestedSlugRef.current;
        const match = (slug && data.find((p) => p.slug === slug)) || data[0];
        selectWatch(match);
      } catch (err) {
        if (!cancelled) {
          setLoadError(
            err instanceof Error ? err.message : "Could not load the watch collection."
          );
        }
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [selectWatch, attempt, shouldShowTryOn]);

  // ── 4. Initialise MediaPipe (only on mobile / allowed try-on) ──
  useEffect(() => {
    if (!shouldShowTryOn) return;
    let cancelled = false;

    getHandLandmarker((status) => {
      if (!cancelled) setModelProgress(status);
    })
      .then(() => {
        prefetchSegmenter();
        if (!cancelled) setIsModelReady(true);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        resetHandLandmarker();
        setLoadError(
          err instanceof Error
            ? `Could not load the AR engine: ${err.message}`
            : "Could not load the AR engine. Please check your connection."
        );
      });

    return () => {
      cancelled = true;
    };
  }, [attempt, shouldShowTryOn]);

  // ── Release everything on unmount ──
  useEffect(() => {
    return () => {
      useTryOnStore.getState().reset();
      resetHandLandmarker();
      resetDepthWorker();
      releaseSnapshotSession();
    };
  }, []);

  // ── Dismiss the loading screen ──
  useEffect(() => {
    if (!shouldShowTryOn) return;
    if (!showLoading) return;
    if (!isModelReady) return;
    if (!isCameraReady && !cameraError) return;

    setIsFadingOut(true);
    const id = setTimeout(() => setShowLoading(false), FADE_OUT_MS);
    return () => clearTimeout(id);
  }, [showLoading, isModelReady, isCameraReady, cameraError, shouldShowTryOn]);

  const handleRetry = useCallback(() => {
    resetHandLandmarker();
    resetDepthWorker();
    releaseSnapshotSession();
    useTryOnStore.getState().reset();
    setLoadError(null);
    setModelProgress(undefined);
    setIsModelReady(false);
    setIsFadingOut(false);
    setShowLoading(true);
    setProducts([]);
    setAttempt((n) => n + 1);
  }, []);

  // If still checking device on initial client mount, show minimal loader
  if (isMobile === null && !forceMobile) {
    return <TryOnLoading statusText="Checking device compatibility..." />;
  }

  // DESKTOP VIEW: Show dedicated QR Code screen for mobile scanning
  if (!shouldShowTryOn) {
    return <DesktopQrView selectedWatchSlug={requestedSlug} />;
  }

  if (loadError) {
    return <TryOnErrorScreen message={loadError} onRetry={handleRetry} />;
  }

  const statusText = !isModelReady
    ? "Loading AR engine..."
    : isCameraReady
      ? "Ready"
      : "Preparing camera...";

  return (
    <div className="tryon-page">
      {isModelReady && <SnapshotTryOn products={products} />}

      {showLoading && (
        <TryOnLoading
          statusText={statusText}
          detailText={!isModelReady ? modelProgress : undefined}
          note={GUIDANCE.privacy}
          isFadingOut={isFadingOut}
        />
      )}
    </div>
  );
}

// ============ ERROR SCREEN ============

function TryOnErrorScreen({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
  selectedWatchSlug?: string | null;
}) {
  return (
    <div className="tryon-page tryon-error-page">
      <div className="tryon-error-inner">
        <p className="tryon-error-tag">Virtual Try-On</p>
        <h2 className="tryon-error-title">
          Something went <em>wrong</em>
        </h2>
        <p className="tryon-error-msg">{message}</p>
        <div className="tryon-error-actions">
          <button type="button" className="tryon-retry-btn" onClick={onRetry}>
            Try Again
          </button>
          <Link href="/" className="tryon-error-link">
            ← Back to homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
