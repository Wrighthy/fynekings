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

export async function loadWatch(product: TryOnProduct): Promise<LoadedWatch> {
  const caseUrl = product.caseLayerUrl ?? product.overlayUrl;
  const caseImage = await loadBitmap(caseUrl);
  const strapImage = product.strapLayerUrl ? await loadBitmap(product.strapLayerUrl) : null;
  const caseDiameterMm = product.caseDiameterMm ?? DEFAULT_CASE_DIAMETER_MM;
  const asset: WatchAsset = {
    id: product.id,
    caseDiameterMm,
    lugToLugMm: product.lugToLugMm ?? DEFAULT_LUG_TO_LUG_MM,
    strapWidthMm: product.strapWidthMm ?? DEFAULT_STRAP_WIDTH_MM,
    assetPxPerMm:
      product.assetPxPerMm ??
      (caseImage.width * LEGACY_CASE_WIDTH_FRACTION) / caseDiameterMm,
    caseLayerUrl: caseUrl,
    strapLayerUrl: product.strapLayerUrl ?? null,
    anchor: product.anchor ?? { x: caseImage.width / 2, y: caseImage.height / 2 },
    legacySticker: !product.strapLayerUrl,
  };
  return {
    asset,
    caseImage,
    strapImage,
    caseWidth: caseImage.width,
    caseHeight: caseImage.height,
  };
}
