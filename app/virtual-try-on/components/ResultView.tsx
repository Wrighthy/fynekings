"use client";

import { useEffect, useRef } from "react";
import { ADJUST_ROTATION_DEG, ADJUST_SCALE_MAX, ADJUST_SCALE_MIN, GUIDANCE } from "../lib/tryon/constants";
import { snapshotSession } from "../lib/tryon/snapshotSession";
import type { ManualAdjustments, SnapshotMeasurements } from "../lib/tryon/types";

type Props = {
  paintKey: number;
  measurements: SnapshotMeasurements;
  adjustments: ManualAdjustments;
  lowConfidence: boolean;
  onAdjust: (next: ManualAdjustments) => void;
  onReset: () => void;
  onRetake: () => void;
  onSave: () => void;
};

export default function ResultView({
  paintKey,
  measurements,
  adjustments,
  lowConfidence,
  onAdjust,
  onReset,
  onRetake,
  onSave,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const source = snapshotSession.composite;
    const canvas = canvasRef.current;
    if (!source || !canvas) return;
    canvas.width = source.width;
    canvas.height = source.height;
    canvas.getContext("2d")?.drawImage(source, 0, 0);
  }, [paintKey]);

  // The watch position is fixed by the measurement; only rotation and size
  // can be adjusted (sliders below). The image itself is not draggable.
  return (
    <div className="tryon-result">
      <div className="tryon-result-stage">
        <canvas
          ref={canvasRef}
          className="tryon-result-canvas"
          aria-label="Watch fitted on your wrist"
        />
      </div>

      {lowConfidence && (
        <p className="tryon-result-warn" role="status">
          {GUIDANCE.lowConfidence}
        </p>
      )}

      <div className="tryon-result-panel">
        <div className="tryon-result-sliders">
          <label>
            <span className="tryon-result-slider-head">
              <span>Rotate</span>
              <span className="tryon-result-slider-value">{adjustments.rotationDeg}°</span>
            </span>
            <input
              type="range"
              min={-ADJUST_ROTATION_DEG}
              max={ADJUST_ROTATION_DEG}
              step={1}
              value={adjustments.rotationDeg}
              aria-label="Rotate the watch"
              onChange={(event) =>
                onAdjust({ ...adjustments, rotationDeg: Number(event.target.value) })
              }
            />
          </label>
          <label>
            <span className="tryon-result-slider-head">
              <span>Size</span>
              <span className="tryon-result-slider-value">{Math.round(adjustments.scale * 100)}%</span>
            </span>
            <input
              type="range"
              min={ADJUST_SCALE_MIN}
              max={ADJUST_SCALE_MAX}
              step={0.01}
              value={adjustments.scale}
              aria-label="Resize the watch"
              onChange={(event) =>
                onAdjust({ ...adjustments, scale: Number(event.target.value) })
              }
            />
          </label>
        </div>

        <p className="tryon-result-note">
          Wrist ≈ {Math.round(measurements.wristWidthMm)} mm (±10–15%). {GUIDANCE.approximation}
        </p>

        <div className="tryon-result-actions">
          <button type="button" className="tryon-result-btn" onClick={onRetake}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 12a8 8 0 1 0 2.4-5.7M4 4v4h4" />
            </svg>
            Retake
          </button>
          <button type="button" className="tryon-result-btn" onClick={onReset}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M3 12h4M17 12h4M12 3v4M12 17v4M12 12h.01" />
            </svg>
            Reset
          </button>
          <button type="button" className="tryon-result-btn primary" onClick={onSave}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 4v11M7 10l5 5 5-5M5 20h14" />
            </svg>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
