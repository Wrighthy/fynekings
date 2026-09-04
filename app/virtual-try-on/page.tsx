"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import TryOnLoading from "./components/TryOnLoading";
import TryOnExperience from "./components/TryOnExperience";
import TryOnHUD from "./components/TryOnHUD";
import TryOnControls from "./components/TryOnControls";
import { getHandLandmarker, resetHandLandmarker } from "./lib/mediapipe";
import {
  resetLiveFrame,
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

  // ── Choose a sensible default camera ──
  // Mobile defaults to the rear camera so you can film your own wrist (FR-02.2);
  // a desktop webcam faces the user, so mirroring it reads as a mirror.
  useEffect(() => {
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    setFrontCamera(!isMobile);
  }, [setFrontCamera]);

  // ── Fetch the catalogue ──
  useEffect(() => {
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
  }, [selectWatch, attempt]);

  // ── Initialise MediaPipe ──
  useEffect(() => {
    let cancelled = false;

    getHandLandmarker((status) => {
      if (!cancelled) setModelProgress(status);
    })
      .then(() => {
        if (!cancelled) setIsModelReady(true);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        // A failed init must not be cached, or retrying would resolve the same
        // rejected promise forever.
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
  }, [attempt]);

  // ── Release everything on unmount ──
  useEffect(() => {
    return () => {
      useTryOnStore.getState().reset();
      resetLiveFrame();
      resetHandLandmarker();
    };
  }, []);

  // ── Dismiss the loading screen ──
  // The experience mounts underneath it as soon as the model is ready, so the
  // camera prompt appears while the loader is still covering the page.
  useEffect(() => {
    if (!showLoading) return;
    if (!isModelReady) return;
    if (!isCameraReady && !cameraError) return;

    setIsFadingOut(true);
    const id = setTimeout(() => setShowLoading(false), FADE_OUT_MS);
    return () => clearTimeout(id);
  }, [showLoading, isModelReady, isCameraReady, cameraError]);

  const handleRetry = useCallback(() => {
    resetHandLandmarker();
    resetLiveFrame();
    useTryOnStore.getState().reset();
    setLoadError(null);
    setModelProgress(undefined);
    setIsModelReady(false);
    setIsFadingOut(false);
    setShowLoading(true);
    setProducts([]);
    setAttempt((n) => n + 1);
  }, []);

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
      {isModelReady && (
        <>
          <TryOnExperience />
          <TryOnHUD />
          {!cameraError && products.length > 0 && (
            <TryOnControls products={products} />
          )}
        </>
      )}

      {showLoading && (
        <TryOnLoading
          statusText={statusText}
          detailText={!isModelReady ? modelProgress : undefined}
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


