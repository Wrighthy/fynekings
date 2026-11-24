"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { fmt } from "@/lib/store";
import GuidanceOverlay from "./GuidanceOverlay";
import ResultView from "./ResultView";
import { useHandTracking } from "../hooks/useHandTracking";
import { downscaleCanvas, getCameraErrorMessage, openCamera } from "../lib/tryon/camera";
import { GUIDANCE, HOLD_MS, MAX_SNAPSHOT_EDGE, type GuidanceId } from "../lib/tryon/constants";
import { warmupDepth } from "../lib/tryon/depthClient";
import { evaluateGates } from "../lib/tryon/gates";
import { repaintSnapshot, runSnapshotPipeline } from "../lib/tryon/pipeline";
import { releaseSnapshotSession, snapshotSession } from "../lib/tryon/snapshotSession";
import { loadWatch } from "../lib/tryon/watchAsset";
import { useTryOnStore, type TryOnProduct } from "../lib/tryOnStore";
import { DEFAULT_ADJUSTMENTS, type HandObservation, type ManualAdjustments } from "../lib/tryon/types";

type Props = { products: TryOnProduct[] };

export default function SnapshotTryOn({ products }: Props) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);
  const historyRef = useRef<HandObservation[]>([]);
  const lastHandRef = useRef<HandObservation | null>(null);
  const holdStartRef = useRef<number | null>(null);
  const busyRef = useRef(false);
  const phaseRef = useRef(useTryOnStore.getState().phase);
  const captureRef = useRef<(manual: boolean) => Promise<void>>(async () => {});
  const showLiveRef = useRef(true);
  const forcedRef = useRef<GuidanceId | null>(null);
  const renderedWatchRef = useRef<string | null>(null);

  const [guidanceId, setGuidanceId] = useState<GuidanceId>("noWrist");
  const [forcedId, setForcedId] = useState<GuidanceId | null>(null);
  const [ready, setReady] = useState(false);
  const [progress, setProgress] = useState(0);
  const [hand, setHand] = useState<"left" | "right" | null>(null);
  const [hint, setHint] = useState(false);
  const [flash, setFlash] = useState(false);
  const [step, setStep] = useState<string>(GUIDANCE.analysing);
  const [paintKey, setPaintKey] = useState(0);
  const [processError, setProcessError] = useState<string | null>(null);
  const [cameraAttempt, setCameraAttempt] = useState(0);

  const selectedWatch = useTryOnStore((s) => s.selectedWatch);
  const isFrontCamera = useTryOnStore((s) => s.isFrontCamera);
  const wrist = useTryOnStore((s) => s.wrist);
  const setWrist = useTryOnStore((s) => s.setWrist);
  const cameraError = useTryOnStore((s) => s.cameraError);
  const phase = useTryOnStore((s) => s.phase);
  const measurements = useTryOnStore((s) => s.measurements);
  const adjustments = useTryOnStore((s) => s.adjustments);
  const lowConfidence = useTryOnStore((s) => s.lowConfidence);
  const setCameraReady = useTryOnStore((s) => s.setCameraReady);
  const setCameraError = useTryOnStore((s) => s.setCameraError);
  const setPhase = useTryOnStore((s) => s.setPhase);
  const setMeasurements = useTryOnStore((s) => s.setMeasurements);
  const setAdjustments = useTryOnStore((s) => s.setAdjustments);
  const setLowConfidence = useTryOnStore((s) => s.setLowConfidence);
  const setSnapshotSize = useTryOnStore((s) => s.setSnapshotSize);
  const selectWatch = useTryOnStore((s) => s.selectWatch);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  const showLive = phase !== "RESULT" && phase !== "PROCESSING" && phase !== "CAPTURING";

  const { start, stop, grabFrame, error: trackingError } = useHandTracking(
    (frame) => {
      if (!showLiveRef.current || busyRef.current) return;
      const raw = frame.hands.length === 1 ? frame.hands[0] : null;
      if (raw) {
        historyRef.current = [...historyRef.current, raw].slice(-8);
        lastHandRef.current = frame.smoothed[0] ?? raw;
      } else {
        historyRef.current = [];
      }
      const gates = evaluateGates(
        frame.smoothed,
        historyRef.current,
        frame.width,
        frame.height,
        frame.quality,
        "live",
        isFrontCamera
      );
      const messageId = forcedRef.current && forcedRef.current !== gates.messageId
        ? gates.messageId
        : forcedRef.current ?? gates.messageId;
      if (forcedRef.current && forcedRef.current !== gates.messageId) {
        forcedRef.current = null;
        setForcedId(null);
      }
      setGuidanceId(messageId);
      setHand(gates.hand?.handedness ?? null);
      setHint(gates.hint);
      setReady(gates.allPassed);
      if (gates.allPassed) {
        if (holdStartRef.current === null) holdStartRef.current = performance.now();
        const held = Math.min(1, (performance.now() - holdStartRef.current) / HOLD_MS);
        setProgress(held);
        setPhase("READY");
        if (held >= 1) void captureRef.current(false);
      } else {
        holdStartRef.current = null;
        setProgress(0);
        if (phaseRef.current === "READY" || phaseRef.current === "DETECTING" || phaseRef.current === "WATCH_SELECTED") {
          setPhase("DETECTING");
        }
      }
    },
    { mirrored: isFrontCamera, enabled: showLive, wrist }
  );

  // Switching wrists invalidates the stability history and the hold timer.
  useEffect(() => {
    historyRef.current = [];
    lastHandRef.current = null;
    holdStartRef.current = null;
  }, [wrist]);

  const capture = useCallback(async (manual: boolean) => {
    if (busyRef.current) return;
    if (!ready && manual) return;
    if (!useTryOnStore.getState().selectedWatch) return;
    const frame = grabFrame();
    if (!frame) return;
    busyRef.current = true;
    holdStartRef.current = null;
    setFlash(true);
    window.setTimeout(() => setFlash(false), 320);
    setPhase("CAPTURING");
    setProcessError(null);
    const source = downscaleCanvas(frame, MAX_SNAPSHOT_EDGE);
    setPhase("PROCESSING");
    setStep(GUIDANCE.analysing);
    try {
      const product = useTryOnStore.getState().selectedWatch;
      if (!product) throw new Error(GUIDANCE.genericProcessing);
      const watch = await loadWatch(product);
      const outcome = await runSnapshotPipeline(source, watch, isFrontCamera, setStep, lastHandRef.current, wrist);
      if (!outcome.ok) {
        forcedRef.current = outcome.messageId;
        setForcedId(outcome.messageId);
        setGuidanceId(outcome.messageId);
        setPhase("DETECTING");
        busyRef.current = false;
        return;
      }
      const measured = snapshotSession.measurements;
      renderedWatchRef.current = product.id;
      setMeasurements(measured);
      setLowConfidence(Boolean(measured?.lowConfidence));
      setSnapshotSize(snapshotSession.snapshot ? { width: snapshotSession.snapshot.width, height: snapshotSession.snapshot.height } : null);
      setAdjustments(DEFAULT_ADJUSTMENTS);
      setPaintKey((value) => value + 1);
      setPhase("RESULT");
    } catch (err) {
      setProcessError(err instanceof Error ? err.message : GUIDANCE.genericProcessing);
      setPhase("DETECTING");
    } finally {
      busyRef.current = false;
    }
  }, [grabFrame, isFrontCamera, ready, wrist, setAdjustments, setLowConfidence, setMeasurements, setPhase, setSnapshotSize]);

  showLiveRef.current = showLive;
  forcedRef.current = forcedId;
  captureRef.current = capture;

  useEffect(() => {
    if (!showLive) return;
    let stream: MediaStream | null = null;
    let cancelled = false;
    const run = async () => {
      try {
        setPhase("CAMERA_PERMISSION");
        stream = await openCamera(isFrontCamera);
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        const video = videoRef.current;
        if (!video) return;
        video.srcObject = stream;
        await video.play();
        setCameraError(null);
        setCameraReady(true);
        setPhase("DETECTING");
        warmupDepth();
        await start(video);
      } catch (err) {
        if (!cancelled) setCameraError(getCameraErrorMessage(err));
      }
    };
    void run();
    return () => {
      cancelled = true;
      stop();
      stream?.getTracks().forEach((track) => track.stop());
      const video = videoRef.current;
      if (video) video.srcObject = null;
    };
  }, [showLive, isFrontCamera, cameraAttempt, setCameraError, setCameraReady, setPhase, start, stop]);

  useEffect(() => {
    if (phase !== "RESULT" || !selectedWatch) return;
    if (renderedWatchRef.current === selectedWatch.id) return;
    let cancelled = false;
    renderedWatchRef.current = selectedWatch.id;
    loadWatch(selectedWatch).then((watch) => {
      if (cancelled || !snapshotSession.measurements) return;
      snapshotSession.watch = watch;
      repaintSnapshot(useTryOnStore.getState().adjustments);
      setPaintKey((value) => value + 1);
    }).catch(() => {
      if (!cancelled) setProcessError(GUIDANCE.genericProcessing);
    });
    return () => {
      cancelled = true;
    };
  }, [phase, selectedWatch]);

  const updateAdjustments = (next: ManualAdjustments) => {
    setAdjustments(next);
    repaintSnapshot(next);
    setPaintKey((value) => value + 1);
  };

  const retake = () => {
    releaseSnapshotSession();
    renderedWatchRef.current = null;
    lastHandRef.current = null;
    setMeasurements(null);
    setLowConfidence(false);
    setSnapshotSize(null);
    setAdjustments(DEFAULT_ADJUSTMENTS);
    setProcessError(null);
    setForcedId(null);
    forcedRef.current = null;
    setPhase("DETECTING");
  };

  const save = () => {
    const canvas = snapshotSession.composite;
    if (!canvas) return;
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "fynekings-try-on.png";
      link.click();
      URL.revokeObjectURL(url);
    }, "image/png");
  };

  if (cameraError) {
    return (
      <div className="tryon-experience">
        <div className="tryon-camera-error">
          <h3>Camera access required</h3>
          <p>{cameraError}</p>
          <button type="button" className="tryon-retry-btn" onClick={() => setCameraAttempt((value) => value + 1)}>
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="tryon-experience">
      <video
        ref={videoRef}
        className={`tryon-video ${isFrontCamera ? "mirrored" : ""} ${showLive ? "" : "tryon-hidden"}`}
        autoPlay
        playsInline
        muted
      />
      {showLive && (
        <GuidanceOverlay
          messageId={forcedId ?? guidanceId}
          ready={ready && !forcedId}
          progress={progress}
          hand={hand}
          hint={hint}
        />
      )}
      {showLive && <p className="tryon-privacy">{GUIDANCE.privacy}</p>}
      {phase === "PROCESSING" && (
        <div className="tryon-processing" role="status" aria-live="polite">
          <div className="tryon-loading-ring" />
          <p>{GUIDANCE.analysing}</p>
          <p className="tryon-processing-step">{step}</p>
        </div>
      )}
      {phase === "RESULT" && measurements && (
        <ResultView
          paintKey={paintKey}
          measurements={measurements}
          adjustments={adjustments}
          lowConfidence={lowConfidence}
          onAdjust={updateAdjustments}
          onReset={() => updateAdjustments(DEFAULT_ADJUSTMENTS)}
          onRetake={retake}
          onSave={save}
        />
      )}
      {flash && <div className="tryon-flash" aria-hidden="true" />}
      {(processError || trackingError) && showLive && (
        <div className="tryon-inline-error" role="alert">
          <p>{processError ?? trackingError}</p>
          <button type="button" className="tryon-retry-btn" onClick={() => { setProcessError(null); setCameraAttempt((value) => value + 1); }}>
            Try again
          </button>
        </div>
      )}

      <div className="tryon-hud">
        <div className="tryon-hud-tl">
          <button
            type="button"
            className="tryon-back-btn"
            onClick={() => (window.history.length > 1 ? router.back() : router.push("/"))}
          >
            Back
          </button>
        </div>
        <div className="tryon-hud-tr">
          {selectedWatch && (
            <div className="tryon-watch-info">
              <span className="tryon-watch-info-name">{selectedWatch.name}</span>
              <span className="tryon-watch-info-price">{fmt(selectedWatch.price)}</span>
            </div>
          )}
          {showLive && (
            <div className="tryon-wrist-toggle" role="radiogroup" aria-label="Which wrist are you trying the watch on?">
              {(["left", "right"] as const).map((side) => (
                <button
                  key={side}
                  type="button"
                  role="radio"
                  aria-checked={wrist === side}
                  className={wrist === side ? "active" : ""}
                  onClick={() => setWrist(side)}
                >
                  {side === "left" ? "Left wrist" : "Right wrist"}
                </button>
              ))}
            </div>
          )}

        </div>
      </div>

      <div className="tryon-controls">
        <div ref={pickerRef} className="tryon-watch-picker" role="radiogroup" aria-label="Choose a watch to try on">
          {products.map((product) => {
            const active = selectedWatch?.id === product.id;
            return (
              <button
                key={product.id}
                type="button"
                role="radio"
                aria-checked={active}
                className={`tryon-watch-thumb ${active ? "active" : ""}`}
                onClick={() => selectWatch(product)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={product.thumbnailUrl ?? product.overlayUrl} alt={product.name} />
              </button>
            );
          })}
        </div>
        {phase === "RESULT" ? (
          <button type="button" className="tryon-shot-btn" onClick={() => pickerRef.current?.querySelector("button")?.focus()}>
            Change watch
          </button>
        ) : (
          <button
            type="button"
            className="tryon-capture-btn"
            disabled={!ready || Boolean(forcedId)}
            aria-label="Capture snapshot"
            onClick={() => void capture(true)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="13" r="4" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
