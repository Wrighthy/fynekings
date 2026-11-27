import { MASK_KERNEL_FRAC, SYNTHETIC_BAND_HALF_LENGTH } from "./constants";
import type { Vec2 } from "./types";
import { len2, sub2 } from "./vec";

function clampIndex(x: number, y: number, width: number, height: number): number | null {
  const ix = Math.round(x);
  const iy = Math.round(y);
  if (ix < 0 || iy < 0 || ix >= width || iy >= height) return null;
  return iy * width + ix;
}

function dilate(src: Uint8Array, width: number, height: number, radius: number): Uint8Array {
  const dst = new Uint8Array(src.length);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let on = 0;
      const y0 = Math.max(0, y - radius);
      const y1 = Math.min(height - 1, y + radius);
      const x0 = Math.max(0, x - radius);
      const x1 = Math.min(width - 1, x + radius);
      for (let yy = y0; yy <= y1 && !on; yy++) {
        const row = yy * width;
        for (let xx = x0; xx <= x1; xx++) {
          if (src[row + xx]) {
            on = 1;
            break;
          }
        }
      }
      dst[y * width + x] = on;
    }
  }
  return dst;
}

function erode(src: Uint8Array, width: number, height: number, radius: number): Uint8Array {
  const dst = new Uint8Array(src.length);
  for (let y = 0; y < height; y++) {
    const y0 = Math.max(0, y - radius);
    const y1 = Math.min(height - 1, y + radius);
    for (let x = 0; x < width; x++) {
      let ok = 1;
      const x0 = Math.max(0, x - radius);
      const x1 = Math.min(width - 1, x + radius);
      for (let yy = y0; yy <= y1 && ok; yy++) {
        const row = yy * width;
        for (let xx = x0; xx <= x1; xx++) {
          if (!src[row + xx]) {
            ok = 0;
            break;
          }
        }
      }
      dst[y * width + x] = ok;
    }
  }
  return dst;
}

function downsample(src: Uint8Array, width: number, height: number, factor: number): { data: Uint8Array; width: number; height: number } {
  const dw = Math.max(1, Math.round(width / factor));
  const dh = Math.max(1, Math.round(height / factor));
  const data = new Uint8Array(dw * dh);
  for (let y = 0; y < dh; y++) {
    for (let x = 0; x < dw; x++) {
      const sx = Math.min(width - 1, Math.floor(x * factor));
      const sy = Math.min(height - 1, Math.floor(y * factor));
      data[y * dw + x] = src[sy * width + sx];
    }
  }
  return { data, width: dw, height: dh };
}

export function resizeNearest(src: Uint8Array, sw: number, sh: number, width: number, height: number): Uint8Array {
  const data = new Uint8Array(width * height);
  for (let y = 0; y < height; y++) {
    const sy = Math.min(sh - 1, Math.floor((y * sh) / height));
    for (let x = 0; x < width; x++) {
      const sx = Math.min(sw - 1, Math.floor((x * sw) / width));
      data[y * width + x] = src[sy * sw + sx];
    }
  }
  return data;
}

/** Morphological close then open. Kernel is about 1.5% of the image width. */
export function closeThenOpen(src: Uint8Array, width: number, height: number): Uint8Array {
  const radius = Math.max(1, Math.round(width * MASK_KERNEL_FRAC));
  const maxEdge = 360;
  const factor = Math.max(1, Math.ceil(Math.max(width, height) / maxEdge));
  const smallR = Math.max(1, Math.round(radius / factor));
  const small = downsample(src, width, height, factor);
  const closed = erode(dilate(small.data, small.width, small.height, smallR), small.width, small.height, smallR);
  const opened = dilate(erode(closed, small.width, small.height, smallR), small.width, small.height, smallR);
  return resizeNearest(opened, small.width, small.height, width, height);
}

/** Largest foreground component that contains the seed pixel. */
export function componentContaining(
  src: Uint8Array,
  width: number,
  height: number,
  seedX: number,
  seedY: number
): Uint8Array | null {
  const sx = Math.round(seedX);
  const sy = Math.round(seedY);
  if (sx < 0 || sy < 0 || sx >= width || sy >= height) return null;

  const seen = new Uint8Array(src.length);
  let best: Uint8Array | null = null;
  let bestSize = 0;
  let seedSize = 0;
  const stack: number[] = [];

  for (let i = 0; i < src.length; i++) {
    if (!src[i] || seen[i]) continue;
    stack.push(i);
    seen[i] = 1;
    const component = new Uint8Array(src.length);
    let size = 0;
    let hasSeed = false;
    while (stack.length) {
      const idx = stack.pop() as number;
      component[idx] = 1;
      size += 1;
      const x = idx % width;
      const y = (idx - x) / width;
      if (x === sx && y === sy) hasSeed = true;
      const neighbors = [idx - 1, idx + 1, idx - width, idx + width];
      for (const next of neighbors) {
        if (next < 0 || next >= src.length || seen[next] || !src[next]) continue;
        const nx = next % width;
        if (Math.abs(nx - x) > 1) continue;
        seen[next] = 1;
        stack.push(next);
      }
    }
    if (hasSeed && size > seedSize) {
      seedSize = size;
      best = component;
      bestSize = size;
    } else if (!hasSeed && size > bestSize && best === null) {
      bestSize = size;
    }
  }

  if (seedSize === 0) return null;
  return best;
}

export function maskArea(mask: Uint8Array): number {
  let n = 0;
  for (let i = 0; i < mask.length; i++) if (mask[i]) n += 1;
  return n;
}

export function capsuleMask(
  width: number,
  height: number,
  center: Vec2,
  axis: Vec2,
  breadthPx: number
): Uint8Array {
  const data = new Uint8Array(width * height);
  const halfLength = SYNTHETIC_BAND_HALF_LENGTH * breadthPx;
  const halfWidth = (0.75 * breadthPx) / 2;
  const start = { x: center.x - axis.x * halfLength, y: center.y - axis.y * halfLength };
  const end = { x: center.x + axis.x * halfLength, y: center.y + axis.y * halfLength };
  const minX = Math.max(0, Math.floor(Math.min(start.x, end.x) - halfWidth - 1));
  const maxX = Math.min(width - 1, Math.ceil(Math.max(start.x, end.x) + halfWidth + 1));
  const minY = Math.max(0, Math.floor(Math.min(start.y, end.y) - halfWidth - 1));
  const maxY = Math.min(height - 1, Math.ceil(Math.max(start.y, end.y) + halfWidth + 1));
  const seg = sub2(end, start);
  const segLen2 = seg.x * seg.x + seg.y * seg.y || 1;

  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const px = x + 0.5;
      const py = y + 0.5;
      const t = Math.max(0, Math.min(1, ((px - start.x) * seg.x + (py - start.y) * seg.y) / segLen2));
      const cx = start.x + seg.x * t;
      const cy = start.y + seg.y * t;
      if (len2(sub2({ x: px, y: py }, { x: cx, y: cy })) <= halfWidth) {
        data[y * width + x] = 1;
      }
    }
  }
  return data;
}

/**
 * One box-blur pass along a line of `length` samples spaced `stride` apart,
 * using a running sum so the cost does not depend on the radius. Samples
 * outside the image are skipped (the average uses only in-bounds samples).
 */
function boxLine(
  input: Uint8Array,
  output: Uint8Array,
  start: number,
  stride: number,
  length: number,
  r: number,
  lift: boolean
) {
  const read = (i: number) => {
    const value = input[start + i * stride];
    return lift && value <= 1 ? value * 255 : value;
  };
  let sum = 0;
  const firstEnd = Math.min(length - 1, r);
  for (let i = 0; i <= firstEnd; i++) sum += read(i);
  for (let i = 0; i < length; i++) {
    const lo = Math.max(0, i - r);
    const hi = Math.min(length - 1, i + r);
    output[start + i * stride] = Math.round(sum / (hi - lo + 1));
    const enter = i + r + 1;
    if (enter < length) sum += read(enter);
    const leave = i - r;
    if (leave >= 0) sum -= read(leave);
  }
}

/** Box blur, three passes, approximating a gaussian. Radius is in pixels. */
export function blurMask(src: Uint8Array, width: number, height: number, radius: number): Uint8Array {
  const r = Math.max(1, Math.round(radius));
  let current = src;
  for (let pass = 0; pass < 3; pass++) {
    // The source mask may hold 0/1; lift it to 0/255 on the first pass.
    const lift = pass === 0;
    const horizontal = new Uint8Array(src.length);
    for (let y = 0; y < height; y++) boxLine(current, horizontal, y * width, 1, width, r, lift);
    const vertical = new Uint8Array(src.length);
    for (let x = 0; x < width; x++) boxLine(horizontal, vertical, x, width, height, r, false);
    current = vertical;
  }
  return current;
}

export function maskAt(mask: Uint8Array, width: number, height: number, x: number, y: number): boolean {
  const index = clampIndex(x, y, width, height);
  return index !== null && mask[index] > 0;
}

/** Width of the mask along `direction` through `origin`. `direction` is a unit vector. */
export function scanWidth(
  mask: Uint8Array,
  width: number,
  height: number,
  origin: Vec2,
  direction: Vec2
): number | null {
  if (!maskAt(mask, width, height, origin.x, origin.y)) return null;
  let positive = 0;
  let negative = 0;
  const limit = Math.max(width, height);
  for (let step = 1; step < limit; step++) {
    if (!maskAt(mask, width, height, origin.x + direction.x * step, origin.y + direction.y * step)) break;
    positive = step;
  }
  for (let step = 1; step < limit; step++) {
    if (!maskAt(mask, width, height, origin.x - direction.x * step, origin.y - direction.y * step)) break;
    negative = step;
  }
  return positive + negative;
}
