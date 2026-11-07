import { EDGE_SHADE_BAND_FRAC, EDGE_SHADE_MAX, FEATHER_SIGMA_FRAC, SHADOW_BLUR_FRAC, SHADOW_OFFSET_FRAC, SHADOW_OPACITY } from "./constants";
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

function punchClothes(
  ctx: CanvasRenderingContext2D,
  clothes: Uint8Array,
  width: number,
  height: number
) {
  const image = ctx.getImageData(0, 0, width, height);
  const data = image.data;
  for (let i = 0; i < clothes.length; i++) {
    if (clothes[i]) data[i * 4 + 3] = 0;
  }
  ctx.putImageData(image, 0, 0);
}

function clipAndShadeStrap(
  ctx: CanvasRenderingContext2D,
  skin: Uint8Array,
  width: number,
  height: number,
  wristWidthPx: number
) {
  const featherRadius = Math.max(1, FEATHER_SIGMA_FRAC * wristWidthPx);
  const shadeRadius = Math.max(1, EDGE_SHADE_BAND_FRAC * wristWidthPx);
  const feather = blurMask(skin, width, height, featherRadius);
  const shade = blurMask(skin, width, height, shadeRadius);
  const image = ctx.getImageData(0, 0, width, height);
  const data = image.data;
  for (let i = 0; i < skin.length; i++) {
    const alpha = feather[i] / 255;
    if (alpha <= 0) {
      data[i * 4 + 3] = 0;
      continue;
    }
    const darkness = (1 - shade[i] / 255) * EDGE_SHADE_MAX;
    const keep = 1 - darkness;
    data[i * 4] = Math.round(data[i * 4] * keep);
    data[i * 4 + 1] = Math.round(data[i * 4 + 1] * keep);
    data[i * 4 + 2] = Math.round(data[i * 4 + 2] * keep);
    data[i * 4 + 3] = Math.round(data[i * 4 + 3] * alpha);
  }
  ctx.putImageData(image, 0, 0);
}

export function renderComposite(target: HTMLCanvasElement, input: RenderInput): void {
  const { width, height, measurements, adjustments, watch, mask } = input;
  target.width = width;
  target.height = height;
  const ctx = target.getContext("2d");
  if (!ctx) return;

  ctx.clearRect(0, 0, width, height);
  ctx.drawImage(input.snapshot, 0, 0, width, height);

  const placement = add2(
    measurements.placementPoint,
    scale2(measurements.forearmAxis, adjustments.alongPx)
  );
  const rotation = measurements.rotation + (adjustments.rotationDeg * Math.PI) / 180;
  const scale = (measurements.pxPerMm / watch.asset.assetPxPerMm) * adjustments.scale;
  const casePx = measurements.pxPerMm * watch.asset.caseDiameterMm;
  const shadowOff = SHADOW_OFFSET_FRAC * casePx;
  const shadowBlur = Math.max(1, SHADOW_BLUR_FRAC * casePx);

  const layer = document.createElement("canvas");
  layer.width = width;
  layer.height = height;
  const layerCtx = layer.getContext("2d");
  if (!layerCtx) return;

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
    clipAndShadeStrap(layerCtx, mask.skin, width, height, measurements.wristWidthPx);
    if (mask.clothes) punchClothes(layerCtx, mask.clothes, width, height);
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

  if (mask?.clothes) punchClothes(layerCtx, mask.clothes, width, height);
  ctx.drawImage(layer, 0, 0);
}
