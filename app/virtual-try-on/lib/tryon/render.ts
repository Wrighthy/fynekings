import {
  EDGE_SHADE_BAND_FRAC,
  EDGE_SHADE_MAX,
  FEATHER_SIGMA_FRAC,
  SHADOW_BLUR_FRAC,
  SHADOW_OFFSET_FRAC,
  SHADOW_OPACITY,
  getWatchRotationOffsetDeg,
  getWatchScaleCalibration,
} from "./constants";
import { blurMask } from "./mask";
import type { LoadedWatch, ManualAdjustments, MaskBuffer, SnapshotMeasurements } from "./types";
import { add2, scale2 } from "./vec";

export type RenderInput = {
  snapshot: CanvasImageSource;
  width: number;
  height: number;
  watch: LoadedWatch;
  measurements: SnapshotMeasurements;
  adjustments: ManualAdjustments;
  mask: MaskBuffer | null;
};

function drawLayer(
  ctx: CanvasRenderingContext2D,
  image: CanvasImageSource,
  anchorX: number,
  anchorY: number,
  px: number,
  py: number,
  rotation: number,
  scale: number
) {
  ctx.save();
  ctx.translate(px, py);
  ctx.rotate(rotation);
  ctx.scale(scale, scale);
  ctx.drawImage(image, -anchorX, -anchorY);
  ctx.restore();
}

/** Pixel rectangle the watch (and its shadow) can touch on this paint. */
type Box = { x: number; y: number; w: number; h: number };

/**
 * Blurred skin masks depend only on the snapshot mask and the wrist width,
 * never on the user's drag/rotate/resize adjustments, so blur them once per
 * snapshot and reuse them for every repaint.
 */
const blurCache = new WeakMap<Uint8Array, Map<string, Uint8Array>>();

function cachedBlur(mask: Uint8Array, width: number, height: number, radius: number): Uint8Array {
  let byRadius = blurCache.get(mask);
  if (!byRadius) {
    byRadius = new Map();
    blurCache.set(mask, byRadius);
  }
  const key = `${width}x${height}:${Math.max(1, Math.round(radius))}`;
  let blurred = byRadius.get(key);
  if (!blurred) {
    blurred = blurMask(mask, width, height, radius);
    byRadius.set(key, blurred);
  }
  return blurred;
}

/** One scratch canvas reused across repaints instead of a new full-size one each time. */
let scratch: HTMLCanvasElement | null = null;

function scratchLayer(width: number, height: number): CanvasRenderingContext2D | null {
  if (!scratch) scratch = document.createElement("canvas");
  if (scratch.width !== width || scratch.height !== height) {
    scratch.width = width;
    scratch.height = height;
  }
  return scratch.getContext("2d", { willReadFrequently: true });
}

function sourceSize(image: CanvasImageSource): { w: number; h: number } {
  const sized = image as { naturalWidth?: number; naturalHeight?: number; width?: unknown; height?: unknown };
  const w = sized.naturalWidth || (typeof sized.width === "number" ? sized.width : 0);
  const h = sized.naturalHeight || (typeof sized.height === "number" ? sized.height : 0);
  return { w, h };
}

/** Bounding box of an image drawn by drawLayer, padded for its blurred shadow. */
function layerBox(
  images: CanvasImageSource[],
  anchorX: number,
  anchorY: number,
  px: number,
  py: number,
  scale: number,
  pad: number,
  width: number,
  height: number
): Box {
  let reach = 0;
  for (const image of images) {
    const { w, h } = sourceSize(image);
    for (const [cx, cy] of [[0, 0], [w, 0], [0, h], [w, h]]) {
      reach = Math.max(reach, Math.hypot(cx - anchorX, cy - anchorY));
    }
  }
  // Unknown image size: fall back to the whole frame.
  if (reach === 0) return { x: 0, y: 0, w: width, h: height };
  const r = reach * Math.abs(scale) + pad;
  const x = Math.max(0, Math.floor(px - r));
  const y = Math.max(0, Math.floor(py - r));
  const right = Math.min(width, Math.ceil(px + r));
  const bottom = Math.min(height, Math.ceil(py + r));
  return { x, y, w: Math.max(0, right - x), h: Math.max(0, bottom - y) };
}

function punchClothes(
  ctx: CanvasRenderingContext2D,
  clothes: Uint8Array,
  width: number,
  box: Box
) {
  if (box.w === 0 || box.h === 0) return;
  const image = ctx.getImageData(box.x, box.y, box.w, box.h);
  const data = image.data;
  for (let row = 0; row < box.h; row++) {
    const src = (box.y + row) * width + box.x;
    const dst = row * box.w;
    for (let col = 0; col < box.w; col++) {
      if (clothes[src + col]) data[(dst + col) * 4 + 3] = 0;
    }
  }
  ctx.putImageData(image, box.x, box.y);
}

function clipAndShadeStrap(
  ctx: CanvasRenderingContext2D,
  skin: Uint8Array,
  width: number,
  height: number,
  wristWidthPx: number,
  box: Box
) {
  if (box.w === 0 || box.h === 0) return;
  const featherRadius = Math.max(1, FEATHER_SIGMA_FRAC * wristWidthPx);
  const shadeRadius = Math.max(1, EDGE_SHADE_BAND_FRAC * wristWidthPx);
  const feather = cachedBlur(skin, width, height, featherRadius);
  const shade = cachedBlur(skin, width, height, shadeRadius);
  // The layer is transparent outside the watch box, so only that box needs work.
  const image = ctx.getImageData(box.x, box.y, box.w, box.h);
  const data = image.data;
  for (let row = 0; row < box.h; row++) {
    const src = (box.y + row) * width + box.x;
    const dst = row * box.w;
    for (let col = 0; col < box.w; col++) {
      const i = src + col;
      const p = (dst + col) * 4;
      if (data[p + 3] === 0) continue;
      const alpha = feather[i] / 255;
      if (alpha <= 0) {
        data[p + 3] = 0;
        continue;
      }
      const keep = 1 - (1 - shade[i] / 255) * EDGE_SHADE_MAX;
      data[p] = Math.round(data[p] * keep);
      data[p + 1] = Math.round(data[p + 1] * keep);
      data[p + 2] = Math.round(data[p + 2] * keep);
      data[p + 3] = Math.round(data[p + 3] * alpha);
    }
  }
  ctx.putImageData(image, box.x, box.y);
}

export function renderComposite(target: HTMLCanvasElement, input: RenderInput): void {
  const { width, height, measurements, adjustments, watch, mask } = input;
  // Resizing a canvas reallocates its backing store, so only do it when needed.
  if (target.width !== width || target.height !== height) {
    target.width = width;
    target.height = height;
  }
  const ctx = target.getContext("2d");
  if (!ctx) return;

  ctx.clearRect(0, 0, width, height);
  ctx.drawImage(input.snapshot, 0, 0, width, height);

  const alongOffset = scale2(measurements.forearmAxis, adjustments.alongPx);
  const lateralOffset = scale2(measurements.perp, adjustments.lateralPx ?? 0);
  const placement = add2(add2(measurements.placementPoint, alongOffset), lateralOffset);
  const handSide = measurements.handedness;
  const rotationOffset = getWatchRotationOffsetDeg(handSide);
  const rotation =
    measurements.rotation +
    ((rotationOffset + adjustments.rotationDeg) * Math.PI) / 180;
  const scaleCalibration = getWatchScaleCalibration(handSide);
  const scale =
    (measurements.pxPerMm / watch.asset.assetPxPerMm) *
    adjustments.scale *
    scaleCalibration;
  const casePx = measurements.pxPerMm * watch.asset.caseDiameterMm * scaleCalibration;
  const shadowOff = SHADOW_OFFSET_FRAC * casePx;
  const shadowBlur = Math.max(1, SHADOW_BLUR_FRAC * casePx);

  const layerCtx = scratchLayer(width, height);
  if (!layerCtx) return;
  const layer = layerCtx.canvas;
  // Everything the watch or its shadow can reach; pixel work stays inside it.
  const box = layerBox(
    watch.strapImage ? [watch.caseImage, watch.strapImage] : [watch.caseImage],
    watch.asset.anchor.x,
    watch.asset.anchor.y,
    placement.x,
    placement.y,
    scale,
    Math.abs(shadowOff) * 1.5 + shadowBlur * 3 + 2,
    width,
    height
  );

  if (watch.strapImage && mask) {
    layerCtx.clearRect(0, 0, width, height);
    layerCtx.save();
    layerCtx.filter = `blur(${shadowBlur}px)`;
    layerCtx.globalAlpha = SHADOW_OPACITY;
    drawLayer(
      layerCtx,
      watch.strapImage,
      watch.asset.anchor.x,
      watch.asset.anchor.y,
      placement.x + shadowOff,
      placement.y + shadowOff,
      rotation,
      scale
    );
    layerCtx.restore();
    drawLayer(
      layerCtx,
      watch.strapImage,
      watch.asset.anchor.x,
      watch.asset.anchor.y,
      placement.x,
      placement.y,
      rotation,
      scale
    );
    clipAndShadeStrap(layerCtx, mask.skin, width, height, measurements.wristWidthPx, box);
    if (mask.clothes) punchClothes(layerCtx, mask.clothes, width, box);
    ctx.drawImage(layer, 0, 0);
  }

  layerCtx.clearRect(0, 0, width, height);
  layerCtx.save();
  layerCtx.filter = `blur(${shadowBlur}px)`;
  layerCtx.globalAlpha = SHADOW_OPACITY;
  drawLayer(
    layerCtx,
    watch.caseImage,
    watch.asset.anchor.x,
    watch.asset.anchor.y,
    placement.x + shadowOff,
    placement.y + shadowOff,
    rotation,
    scale
  );
  layerCtx.restore();
  drawLayer(
    layerCtx,
    watch.caseImage,
    watch.asset.anchor.x,
    watch.asset.anchor.y,
    placement.x,
    placement.y,
    rotation,
    scale
  );

  layerCtx.save();
  layerCtx.globalAlpha = 0.18;
  const highlight = layerCtx.createRadialGradient(
    placement.x - casePx * 0.12,
    placement.y - casePx * 0.16,
    casePx * 0.02,
    placement.x,
    placement.y,
    casePx * 0.45
  );
  highlight.addColorStop(0, "rgba(255,255,255,0.9)");
  highlight.addColorStop(1, "rgba(255,255,255,0)");
  layerCtx.fillStyle = highlight;
  layerCtx.beginPath();
  layerCtx.arc(placement.x, placement.y, casePx * 0.45, 0, Math.PI * 2);
  layerCtx.fill();
  layerCtx.restore();

  if (mask?.clothes) punchClothes(layerCtx, mask.clothes, width, box);
  ctx.drawImage(layer, 0, 0);
}
