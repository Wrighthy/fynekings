import {
  DEFAULT_CASE_DIAMETER_MM,
  DEFAULT_LUG_TO_LUG_MM,
  DEFAULT_STRAP_WIDTH_MM,
  LEGACY_CASE_WIDTH_FRACTION,
} from "./constants";
import type { TryOnProduct } from "../tryOnStore";
import type { LoadedWatch, WatchAsset } from "./types";

const cache = new Map<string, ImageBitmap>();

async function loadBitmap(url: string): Promise<ImageBitmap> {
  const cached = cache.get(url);
  if (cached) return cached;
  const image = new Image();
  image.crossOrigin = "anonymous";
  image.src = url;
  await image.decode();
  const bitmap = await createImageBitmap(image);
  cache.set(url, bitmap);
  return bitmap;
}

/**
 * Automatically estimates the case width fraction from the alpha channel
 * of the watch sticker bitmap by scanning the widest row in the center band.
 */
function estimateCaseWidthFraction(image: ImageBitmap): number {
  try {
    if (typeof document === "undefined") return LEGACY_CASE_WIDTH_FRACTION;
    const canvas = document.createElement("canvas");
    canvas.width = Math.min(image.width, 300);
    canvas.height = Math.min(image.height, 300);
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return LEGACY_CASE_WIDTH_FRACTION;
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

    // Scan horizontal span of visible pixels in the vertical center 35%-65%
    const startY = Math.floor(canvas.height * 0.35);
    const endY = Math.floor(canvas.height * 0.65);
    let maxRowWidth = 0;

    for (let y = startY; y <= endY; y += 2) {
      let firstX = -1;
      let lastX = -1;
      for (let x = 0; x < canvas.width; x++) {
        const alpha = data[(y * canvas.width + x) * 4 + 3];
        if (alpha > 30) {
          if (firstX === -1) firstX = x;
          lastX = x;
        }
      }
      if (firstX !== -1 && lastX >= firstX) {
        maxRowWidth = Math.max(maxRowWidth, lastX - firstX + 1);
      }
    }

    if (maxRowWidth > 0) {
      const frac = maxRowWidth / canvas.width;
      // Clamp to a sensible fraction range (25% to 75% of asset width)
      return Math.max(0.25, Math.min(0.75, frac));
    }
  } catch {
    // Fallback if canvas is unavailable
  }
  return LEGACY_CASE_WIDTH_FRACTION;
}

export async function loadWatch(product: TryOnProduct): Promise<LoadedWatch> {
  const caseUrl = product.caseLayerUrl ?? product.overlayUrl;
  const caseImage = await loadBitmap(caseUrl);
  const strapImage = product.strapLayerUrl ? await loadBitmap(product.strapLayerUrl) : null;
  const caseDiameterMm = product.caseDiameterMm ?? DEFAULT_CASE_DIAMETER_MM;
  const caseWidthFraction =
    product.caseWidthFraction ?? estimateCaseWidthFraction(caseImage);
  const scaleFactor = product.scaleFactor ?? 1.0;

  const asset: WatchAsset = {
    id: product.id,
    caseDiameterMm,
    lugToLugMm: product.lugToLugMm ?? DEFAULT_LUG_TO_LUG_MM,
    strapWidthMm: product.strapWidthMm ?? DEFAULT_STRAP_WIDTH_MM,
    assetPxPerMm:
      product.assetPxPerMm ??
      (caseImage.width * caseWidthFraction) / (caseDiameterMm * scaleFactor),
    caseLayerUrl: caseUrl,
    strapLayerUrl: product.strapLayerUrl ?? null,
    anchor: product.anchor ?? { x: caseImage.width / 2, y: caseImage.height / 2 },
    legacySticker: !product.strapLayerUrl,
    scaleFactor,
    caseWidthFraction,
  };
  return {
    asset,
    caseImage,
    strapImage,
    caseWidth: caseImage.width,
    caseHeight: caseImage.height,
  };
}
