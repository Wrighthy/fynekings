import type { Vec2, Vec3 } from "./types";

export function sub2(a: Vec2, b: Vec2): Vec2 {
  return { x: a.x - b.x, y: a.y - b.y };
}

export function sub3(a: Vec3, b: Vec3): Vec3 {
  return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

export function add2(a: Vec2, b: Vec2): Vec2 {
  return { x: a.x + b.x, y: a.y + b.y };
}

export function scale2(a: Vec2, s: number): Vec2 {
  return { x: a.x * s, y: a.y * s };
}

export function len2(a: Vec2): number {
  return Math.hypot(a.x, a.y);
}

export function len3(a: Vec3): number {
  return Math.hypot(a.x, a.y, a.z);
}

export function norm2(a: Vec2): Vec2 | null {
  const l = len2(a);
  if (l < 1e-6) return null;
  return { x: a.x / l, y: a.y / l };
}

export function denorm(p: Vec2, width: number, height: number): Vec2 {
  return { x: p.x * width, y: p.y * height };
}

export function cross(a: Vec3, b: Vec3): Vec3 {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
  };
}

/** Right angle of `a`, 90 degrees clockwise in y-down canvas space. */
export function rot90(a: Vec2): Vec2 {
  return { x: -a.y, y: a.x };
}

export function dot2(a: Vec2, b: Vec2): number {
  return a.x * b.x + a.y * b.y;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

export function percentile(sortedAsc: ArrayLike<number>, p: number): number {
  if (sortedAsc.length === 0) return 0;
  const idx = Math.min(
    sortedAsc.length - 1,
    Math.max(0, Math.floor(p * (sortedAsc.length - 1)))
  );
  return sortedAsc[idx];
}
