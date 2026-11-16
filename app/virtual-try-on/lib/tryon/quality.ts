import type { QualitySample } from "./types";

/** Mean luminance and Laplacian variance of an RGBA region. */
export function measureQuality(pixels: Uint8ClampedArray, width: number, height: number): QualitySample | null {
  if (width < 3 || height < 3) return null;
  const gray = new Float32Array(width * height);
  let luma = 0;
  const count = width * height;
  for (let i = 0; i < count; i++) {
    const offset = i * 4;
    const y = 0.2126 * pixels[offset] + 0.7152 * pixels[offset + 1] + 0.0722 * pixels[offset + 2];
    gray[i] = y;
    luma += y;
  }
  let sum = 0;
  let sumSq = 0;
  let n = 0;
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const i = y * width + x;
      const value = gray[i - width] + gray[i - 1] - 4 * gray[i] + gray[i + 1] + gray[i + width];
      sum += value;
      sumSq += value * value;
      n += 1;
    }
  }
  if (n === 0) return null;
  const mean = sum / n;
  return {
    luminance: luma / count,
    sharpness: sumSq / n - mean * mean,
  };
}
