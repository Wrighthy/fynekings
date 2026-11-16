"use client";

import { useEffect, useRef, type PointerEvent } from "react";
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
  const dragRef = useRef<{ x: number; y: number; along: number; lateral: number } | null>(null);

  useEffect(() => {
    const source = snapshotSession.composite;
    const canvas = canvasRef.current;
    if (!source || !canvas) return;
    canvas.width = source.width;
    canvas.height = source.height;
    canvas.getContext("2d")?.drawImage(source, 0, 0);
  }, [paintKey]);

  const onPointerDown = (event: PointerEvent<HTMLCanvasElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      x: event.clientX,
      y: event.clientY,
      along: adjustments.alongPx,
      lateral: adjustments.lateralPx ?? 0,
    };
  };

  const onPointerMove = (event: PointerEvent<HTMLCanvasElement>) => {
    const drag = dragRef.current;
    const canvas = canvasRef.current;
    if (!drag || !canvas) return;
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const dx = ((event.clientX - drag.x) * canvas.width) / rect.width;
    const dy = ((event.clientY - drag.y) * canvas.height) / rect.height;
    const dAlong = dx * measurements.forearmAxis.x + dy * measurements.forearmAxis.y;
    const dLateral = dx * measurements.perp.x + dy * measurements.perp.y;
    const along = drag.along + dAlong;
    const lateral = drag.lateral + dLateral;
    const alongLimit = Math.max(60, measurements.wristWidthPx * 1.5);
    const lateralLimit = Math.max(60, measurements.wristWidthPx * 1.2);
    onAdjust({
      ...adjustments,
      alongPx: Math.max(-alongLimit, Math.min(alongLimit, along)),
      lateralPx: Math.max(-lateralLimit, Math.min(lateralLimit, lateral)),
    });
  };

  return (
    <div className="tryon-result">
      <canvas
        ref={canvasRef}
        className="tryon-result-canvas"
        aria-label="Watch fitted on your wrist"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={() => {
          dragRef.current = null;
        }}
      />
      <p className="tryon-result-note">{GUIDANCE.approximation}</p>
      <p className="tryon-result-note">
        Estimated wrist width {Math.round(measurements.wristWidthMm)} mm. This can be off by about 10 to 15 percent.
      </p>
      <p className="tryon-result-note">
        Drag the watch on your wrist to adjust its position.
      </p>
      {lowConfidence && (
        <p className="tryon-result-warn" role="status">
          {GUIDANCE.lowConfidence}
        </p>
      )}
      <div className="tryon-result-sliders">
        <label>
          Rotate
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
          Size
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
      <div className="tryon-shot-actions">
        <button type="button" className="tryon-shot-btn" onClick={onRetake}>
          Retake
        </button>
        <button type="button" className="tryon-shot-btn" onClick={onReset}>
          Reset
        </button>
        <button type="button" className="tryon-shot-btn primary" onClick={onSave}>
          Save image
        </button>
      </div>
    </div>
  );
}
