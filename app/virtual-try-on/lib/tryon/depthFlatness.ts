import { DEPTH_FLATNESS_MAX } from "./constants";
import type { DepthCrop, Vec2 } from "./types";
import { percentile } from "./vec";

export type PlaneFit = {
  score: number;
  flatEnough: boolean;
};

function solve3(m: number[], b: number[]): number[] | null {
  const det = (a: number[]) =>
    a[0] * (a[4] * a[8] - a[5] * a[7]) -
    a[1] * (a[3] * a[8] - a[5] * a[6]) +
    a[2] * (a[3] * a[7] - a[4] * a[6]);
  const base = det(m);
  if (Math.abs(base) < 1e-8) return null;
  const replace = (col: number, values: number[]) => {
    const next = m.slice();
    next[col] = values[0];
    next[col + 3] = values[1];
    next[col + 6] = values[2];
    return det(next);
  };
  return [replace(0, b) / base, replace(1, b) / base, replace(2, b) / base];
}

function fit(points: { s: number; t: number; d: number }[]): { c0: number; c1: number; c2: number } | null {
  let n = 0;
  let s = 0;
  let t = 0;
  let d = 0;
  let ss = 0;
  let tt = 0;
  let st = 0;
  let sd = 0;
  let td = 0;
  for (const point of points) {
    n += 1;
    s += point.s;
    t += point.t;
    d += point.d;
    ss += point.s * point.s;
    tt += point.t * point.t;
    st += point.s * point.t;
    sd += point.s * point.d;
    td += point.t * point.d;
  }
  const solved = solve3([n, s, t, s, ss, st, t, st, tt], [d, sd, td]);
  if (!solved) return null;
  return { c0: solved[0], c1: solved[1], c2: solved[2] };
}

/**
 * Relative-depth flatness. Depth values are affine-invariant and are not
 * converted to millimetres. Returns null when there are too few samples.
 */
export function depthFlatness(
  depth: DepthCrop,
  mask: Uint8Array | null,
  maskWidth: number,
  placement: Vec2,
  axis: Vec2,
  perp: Vec2,
  wristWidthPx: number
): PlaneFit | null {
  const length = 1.5 * wristWidthPx;
  const band = 1.2 * wristWidthPx;
  const points: { s: number; t: number; d: number }[] = [];
  const limitX = mask ? maskWidth - 1 : Number.POSITIVE_INFINITY;
  const limitY = mask ? mask.length / maskWidth - 1 : Number.POSITIVE_INFINITY;
  const minX = Math.max(0, Math.floor(placement.x - length));
  const maxX = Math.min(limitX, Math.ceil(placement.x + length));
  const minY = Math.max(0, Math.floor(placement.y - length));
  const maxY = Math.min(limitY, Math.ceil(placement.y + length));

  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const ds = (x - placement.x) * axis.x + (y - placement.y) * axis.y;
      const dt = (x - placement.x) * perp.x + (y - placement.y) * perp.y;
      if (Math.abs(ds) > length / 2 || Math.abs(dt) > band / 2) continue;
      if (mask && !mask[y * maskWidth + x]) continue;
      const dx = x - depth.originX;
      const dy = y - depth.originY;
      if (dx < 0 || dy < 0 || dx >= depth.width || dy >= depth.height) continue;
      points.push({ s: ds, t: dt, d: depth.data[dy * depth.width + dx] });
    }
  }

  if (points.length < 40) return null;
  const first = fit(points);
  if (!first) return null;
  const residuals = points.map((point) =>
    Math.abs(point.d - (first.c0 + first.c1 * point.s + first.c2 * point.t))
  );
  const order = residuals
    .map((value, index) => ({ value, index }))
    .sort((a, b) => a.value - b.value);
  const keep = Math.max(10, Math.floor(order.length * 0.9));
  const trimmed = order.slice(0, keep).map((item) => points[item.index]);
  const plane = fit(trimmed) ?? first;

  const crop = Array.from(depth.data).sort((a, b) => a - b);
  const span = percentile(crop, 0.98) - percentile(crop, 0.02) || 1;
  const extent = Math.max(length, band);
  const score = (Math.hypot(plane.c1, plane.c2) * extent) / span;
  return { score, flatEnough: score <= DEPTH_FLATNESS_MAX };
}
