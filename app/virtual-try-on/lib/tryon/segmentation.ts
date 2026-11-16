import { closeThenOpen, componentContaining, maskArea, resizeNearest } from "./mask";
import type { MaskBuffer } from "./types";

export function splitCategories(
  categories: Uint8Array,
  skinIndex: number,
  clothesIndex: number
): { skin: Uint8Array; clothes: Uint8Array } {
  const skin = new Uint8Array(categories.length);
  const clothes = new Uint8Array(categories.length);
  for (let i = 0; i < categories.length; i++) {
    if (categories[i] === skinIndex) skin[i] = 1;
    if (categories[i] === clothesIndex) clothes[i] = 1;
  }
  return { skin, clothes };
}

export function prepareSkinMask(
  skin: Uint8Array,
  clothes: Uint8Array | null,
  width: number,
  height: number,
  seedX: number,
  seedY: number,
  breadthPx: number,
  fallback: Uint8Array
): MaskBuffer {
  const cleaned = closeThenOpen(skin, width, height);
  const component = componentContaining(cleaned, width, height, seedX, seedY);
  const minArea = Math.max(80, 0.35 * breadthPx * breadthPx);
  if (!component || maskArea(component) < minArea) {
    return { skin: fallback, clothes, width, height, synthetic: true };
  }
  return { skin: component, clothes, width, height, synthetic: false };
}

export function fitMask(
  mask: Uint8Array,
  sourceWidth: number,
  sourceHeight: number,
  width: number,
  height: number
): Uint8Array {
  if (sourceWidth === width && sourceHeight === height) return mask;
  return resizeNearest(mask, sourceWidth, sourceHeight, width, height);
}
