import { resolveHandedness } from "./geometry";
import type { Handedness, HandObservation, Vec2, Vec3 } from "./types";

export type RawLandmark = {
  x: number;
  y: number;
  z?: number;
  visibility?: number;
};

/* ── Original holistic types (kept for future swap-back) ── */

export type HolisticLike = {
  leftHandLandmarks: RawLandmark[][];
  rightHandLandmarks: RawLandmark[][];
  leftHandWorldLandmarks: RawLandmark[][];
  rightHandWorldLandmarks: RawLandmark[][];
  poseLandmarks: RawLandmark[][];
  poseWorldLandmarks: RawLandmark[][];
};

/* ── HandLandmarker result shape ── */

type Category = { categoryName?: string; displayName?: string };

export type HandLandmarkerResult = {
  landmarks: RawLandmark[][];
  worldLandmarks: RawLandmark[][];
  handedness: Category[][];
};

/* ── Helpers ── */

function to2(point: RawLandmark): Vec2 {
  return { x: point.x, y: point.y };
}

function to3(point: RawLandmark): Vec3 {
  return { x: point.x, y: point.y, z: point.z ?? 0 };
}

/* ── HandLandmarker → HandObservation[] ── */

/**
 * Convert HandLandmarker output to the snapshot system's HandObservation[].
 *
 * HandLandmarker does NOT produce pose landmarks, so every pose field is
 * null / 0. The gates and geometry modules already handle null pose data
 * gracefully (forearmAxis falls back to L0→L9, forearmPitchDeg returns null,
 * G1/G2 skip pose checks).
 *
 * `wrist` is the hand the user said they are using. When given it replaces
 * MediaPipe's left/right label. That label is unreliable when the back of the
 * hand faces the camera (it often reports a right hand's back as a left
 * hand's palm), and the back-of-hand check is only correct with the real hand.
 */
export function observationsFromHandLandmarker(
  result: HandLandmarkerResult,
  mirrored: boolean,
  wrist?: Handedness
): HandObservation[] {
  const hands: HandObservation[] = [];

  for (let i = 0; i < result.landmarks.length; i++) {
    const lm = result.landmarks[i];
    const wl = result.worldLandmarks[i];
    if (!lm || lm.length < 21 || !wl || wl.length < 21) continue;

    // HandLandmarker labels from the camera's perspective:
    // "Left" means the camera sees the viewer's right hand, etc.
    const rawLabel = result.handedness[i]?.[0]?.categoryName ?? "Left";
    const mediaPipeSide: Handedness =
      rawLabel.toLowerCase() === "right" ? "right" : "left";

    hands.push({
      handedness: wrist ?? resolveHandedness(mediaPipeSide, mirrored),
      landmarks: lm.slice(0, 21).map(to2),
      worldLandmarks: wl.slice(0, 21).map(to3),
      poseWrist: null,
      poseElbow: null,
      poseIndex: null,
      posePinky: null,
      poseWristVisibility: 0,
      poseElbowVisibility: 0,
      poseIndexVisibility: 0,
      posePinkyVisibility: 0,
      poseWristWorld: null,
      poseElbowWorld: null,
    });
  }

  return hands;
}

/**
 * Alias that matches the old import name used by useHolisticTracking and
 * pipeline.ts. Now delegates to the HandLandmarker converter.
 */
export function observationsFromHolistic(
  result: HandLandmarkerResult,
  mirrored: boolean,
  wrist?: Handedness
): HandObservation[] {
  return observationsFromHandLandmarker(result, mirrored, wrist);
}
