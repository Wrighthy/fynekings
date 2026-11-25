import { CROP_EXPAND, GUIDANCE, PROCESSING_TIMEOUT_MS } from "./constants";
import { downscaleCanvas } from "./camera";
import { estimateDepth, resetDepthWorker } from "./depthClient";
import { depthFlatness } from "./depthFlatness";
import { placementOf } from "./geometry";
import { capsuleMask } from "./mask";
import { measureWrist } from "./measure";
import { categoryIndices, getSegmenter } from "./models";
import { renderComposite } from "./render";
import { snapshotSession } from "./snapshotSession";
import { setTrackingPaused } from "./trackingPause";
import { fitMask, prepareSkinMask, splitCategories } from "./segmentation";
import type { GuidanceId, Handedness, HandObservation, LoadedWatch, MaskBuffer } from "./types";
import { DEFAULT_ADJUSTMENTS } from "./types";

export type PipelineResult =
  | { ok: true }
  | { ok: false; messageId: GuidanceId };

type MaskLike = {
  width: number;
  height: number;
  getAsUint8Array: () => Uint8Array;
  close?: () => void;
};

function readCategories(mask: MaskLike): Uint8Array | null {
  const data = mask.getAsUint8Array();
  const pixels = mask.width * mask.height;
  if (data.length === pixels) return new Uint8Array(data);
  if (data.length === pixels * 4) {
    const out = new Uint8Array(pixels);
    for (let i = 0; i < pixels; i++) out[i] = data[i * 4];
    return out;
  }
  return null;
}

function maskBounds(mask: Uint8Array, width: number, height: number) {
  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;
  let any = false;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (!mask[y * width + x]) continue;
      any = true;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }
  if (!any) return null;
  const boxW = Math.max(1, maxX - minX);
  const boxH = Math.max(1, maxY - minY);
  const x = Math.max(0, Math.floor(minX - boxW * CROP_EXPAND));
  const y = Math.max(0, Math.floor(minY - boxH * CROP_EXPAND));
  const right = Math.min(width, Math.ceil(maxX + boxW * CROP_EXPAND));
  const bottom = Math.min(height, Math.ceil(maxY + boxH * CROP_EXPAND));
  return { x, y, width: right - x, height: bottom - y };
}

function isMemoryError(err: unknown): boolean {
  const message = err instanceof Error ? `${err.name} ${err.message}` : String(err);
  return /memory|allocation|oom/i.test(message);
}

async function segment(source: HTMLCanvasElement, hand: HandObservation): Promise<MaskBuffer> {
  const place = placementOf(hand, source.width, source.height);
  const fallback = capsuleMask(
    source.width,
    source.height,
    place.placement,
    place.axis,
    place.breadthPx
  );
  const synthetic = (): MaskBuffer => ({
    skin: fallback,
    clothes: null,
    width: source.width,
    height: source.height,
    synthetic: true,
  });

  try {
    const segmenter = await getSegmenter();
    const result = segmenter.segment(source) as { categoryMask?: MaskLike };
    const category = result.categoryMask;
    if (!category) return synthetic();
    const bytes = readCategories(category);
    category.close?.();
    if (!bytes) return synthetic();
    const fitted = fitMask(bytes, category.width, category.height, source.width, source.height);
    const indices = categoryIndices();
    const split = splitCategories(fitted, indices.skin, indices.clothes);
    return prepareSkinMask(
      split.skin,
      split.clothes,
      source.width,
      source.height,
      place.wrist.x,
      place.wrist.y,
      place.breadthPx,
      fallback
    );
  } catch {
    return synthetic();
  }
}

async function analyse(
  source: HTMLCanvasElement,
  watch: LoadedWatch,
  mirrored: boolean,
  onProgress: (step: string) => void,
  state: { cancelled: boolean },
  fallbackHand?: HandObservation | null,
  wrist?: Handedness
): Promise<PipelineResult> {
  onProgress("Reading the photo");
  const { observationsFromHandLandmarker } = await import("./observe");
  const { getHandLandmarker } = await import("./models");
  const landmarker = await getHandLandmarker();

  let hands: HandObservation[] = [];
  try {
    // Detect directly on the snapshot canvas without toggling runningMode to avoid state crashes
    const result = landmarker.detectForVideo(source, performance.now());
    hands = observationsFromHandLandmarker(result, mirrored, wrist);
  } catch (err) {
    console.warn("Snapshot landmarker detection fallback:", err);
  }

  // Use re-detected hand, or the verified hand that triggered the capture
  const hand = (hands.length > 0 ? hands[0] : null) ?? fallbackHand ?? null;
  if (!hand) {
    return { ok: false, messageId: "noWrist" };
  }

  if (state.cancelled) throw new Error(GUIDANCE.processingTimeout);

  onProgress("Finding the wrist");
  const mask = await segment(source, hand);

  onProgress("Checking the angle");
  const bounds = maskBounds(mask.skin, source.width, source.height);
  let depth = null;
  if (bounds) {
    try {
      const crop = document.createElement("canvas");
      crop.width = bounds.width;
      crop.height = bounds.height;
      const ctx = crop.getContext("2d", { willReadFrequently: true });
      ctx?.drawImage(source, bounds.x, bounds.y, bounds.width, bounds.height, 0, 0, bounds.width, bounds.height);
      const pixels = ctx?.getImageData(0, 0, bounds.width, bounds.height);
      if (pixels) {
        depth = await estimateDepth(pixels.data, bounds.width, bounds.height, bounds.x, bounds.y);
      }
    } catch {
      depth = null;
    }
  }

  const draft = measureWrist(hand, source.width, source.height, mask.skin);
  if (mask.synthetic) draft.lowConfidence = true;
  if (depth) {
    const flat = depthFlatness(
      depth,
      mask.skin,
      source.width,
      draft.placementPoint,
      draft.forearmAxis,
      draft.perp,
      draft.wristWidthPx
    );
    if (flat && !flat.flatEnough) {
      draft.lowConfidence = true;
    }
  }
  if (state.cancelled) throw new Error(GUIDANCE.processingTimeout);

  onProgress("Placing the watch");
  snapshotSession.snapshot = source;
  snapshotSession.mask = mask;
  snapshotSession.measurements = draft;
  snapshotSession.watch = watch;
  if (!snapshotSession.composite) snapshotSession.composite = document.createElement("canvas");
  renderComposite(snapshotSession.composite, {
    snapshot: source,
    width: source.width,
    height: source.height,
    watch,
    measurements: draft,
    adjustments: DEFAULT_ADJUSTMENTS,
    mask,
  });
  return { ok: true };
}

export async function runSnapshotPipeline(
  source: HTMLCanvasElement,
  watch: LoadedWatch,
  mirrored: boolean,
  onProgress: (step: string) => void,
  fallbackHand?: HandObservation | null,
  wrist?: Handedness
): Promise<PipelineResult> {
  const state = { cancelled: false };
  const run = () => analyse(source, watch, mirrored, onProgress, state, fallbackHand, wrist);
  let timer: ReturnType<typeof setTimeout> | undefined;
  setTrackingPaused(true);
  try {
    return await Promise.race([
      run(),
      new Promise<PipelineResult>((_, reject) => {
        timer = setTimeout(() => {
          state.cancelled = true;
          reject(new Error(GUIDANCE.processingTimeout));
        }, PROCESSING_TIMEOUT_MS);
      }),
    ]);
  } catch (err) {
    resetDepthWorker();
    if (err instanceof Error && err.message === GUIDANCE.processingTimeout) throw err;
    if (isMemoryError(err) && Math.max(source.width, source.height) > 1280) {
      const smaller = downscaleCanvas(source, 1280);
      return analyse(smaller, watch, mirrored, onProgress, state, fallbackHand, wrist);
    }
    console.error("runSnapshotPipeline failed:", err);
    throw new Error(GUIDANCE.genericProcessing);
  } finally {
    if (timer) clearTimeout(timer);
    setTrackingPaused(false);
  }
}

export function repaintSnapshot(adjustments: import("./types").ManualAdjustments): void {
  const { snapshot, mask, measurements, watch, composite } = snapshotSession;
  if (!snapshot || !measurements || !watch || !composite) return;
  renderComposite(composite, {
    snapshot,
    width: snapshot.width,
    height: snapshot.height,
    watch,
    measurements,
    adjustments,
    mask,
  });
}
