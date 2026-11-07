import {
  BACK_FACING_SIGN_LEFT,
  BACK_FACING_SIGN_RIGHT,
  HAND_BREADTH_MM,
  LANDMARK_WRIST_TO_BREADTH,
  PALM_NORMAL_DEADZONE,
  POSE,
  RIGHT_WRIST_CROWN_SIDE,
  SWAP_HANDEDNESS_ON_MIRRORED_BITMAP,
  WATCH_OFFSET_MM,
} from "./constants";
import type { Handedness, HandObservation, Vec2, Vec3 } from "./types";
import { add2, cross, denorm, len2, len3, norm2, rot90, scale2, sub2, sub3 } from "./vec";

const HAND_INDEX = [0, 5, 9, 13, 17] as const;

export function resolveHandedness(mediaPipeSide: Handedness, mirrored: boolean): Handedness {
  if (mirrored && SWAP_HANDEDNESS_ON_MIRRORED_BITMAP) {
    return mediaPipeSide === "left" ? "right" : "left";
  }
  return mediaPipeSide;
}

export function backFacingSign(handedness: Handedness): number {
  return handedness === "left" ? BACK_FACING_SIGN_LEFT : BACK_FACING_SIGN_RIGHT;
}

/** Palm-plane normal from world landmarks. Null when the hand is degenerate. */
export function palmNormal(world: Vec3[]): Vec3 | null {
  if (world.length < 18) return null;
  const v1 = sub3(world[5], world[0]);
  const v2 = sub3(world[17], world[0]);
  const n = cross(v1, v2);
  if (len3(n) < 1e-8) return null;
  return n;
}

/**
 * True when the back of the hand faces the camera.
 * A dead-zone around n.z ≈ 0 is treated as not back-facing so an edge-on
 * hand does not pass.
 */
export function isBackFacing(hand: HandObservation): boolean {
  const n = palmNormal(hand.worldLandmarks);
  if (!n) return false;
  const signed = n.z * backFacingSign(hand.handedness);
  return signed > PALM_NORMAL_DEADZONE;
}

/** Degrees between the palm normal and the camera axis. 0 is flat to the screen. */
export function handTiltDeg(hand: HandObservation): number | null {
  const n = palmNormal(hand.worldLandmarks);
  if (!n) return null;
  const cos = Math.min(1, Math.abs(n.z) / len3(n));
  return (Math.acos(cos) * 180) / Math.PI;
}

/** Angle of the wrist-to-elbow vector out of the image plane, in degrees. */
export function forearmPitchDeg(hand: HandObservation): number | null {
  if (!hand.poseWristWorld || !hand.poseElbowWorld) return null;
  if (hand.poseElbowVisibility < 0.5) return null;
  const v = sub3(hand.poseElbowWorld, hand.poseWristWorld);
  const planar = Math.hypot(v.x, v.y);
  const pitch = Math.atan2(Math.abs(v.z), planar);
  return (pitch * 180) / Math.PI;
}

export function handBreadthPx(hand: HandObservation, width: number, height: number): number {
  const a = denorm(hand.landmarks[5], width, height);
  const b = denorm(hand.landmarks[17], width, height);
  return len2(sub2(a, b));
}

export function forearmAxis(hand: HandObservation, width: number, height: number): Vec2 {
  const wrist = denorm(hand.landmarks[0], width, height);
  if (hand.poseElbow && hand.poseElbowVisibility >= 0.5) {
    const elbow = denorm(hand.poseElbow, width, height);
    const towardElbow = norm2(sub2(elbow, wrist));
    if (towardElbow) return towardElbow;
  }
  const middle = denorm(hand.landmarks[9], width, height);
  return norm2(sub2(wrist, middle)) ?? { x: 1, y: 0 };
}

export type Placement = {
  wrist: Vec2;
  breadthPx: number;
  pxPerMm: number;
  axis: Vec2;
  finger: Vec2;
  perp: Vec2;
  placement: Vec2;
  estimatedWristPx: number;
};

export function placementOf(hand: HandObservation, width: number, height: number): Placement {
  const wrist = denorm(hand.landmarks[0], width, height);
  const breadthPx = handBreadthPx(hand, width, height);
  const pxPerMm = breadthPx / HAND_BREADTH_MM;
  const axis = forearmAxis(hand, width, height);
  const finger = scale2(axis, -1);
  const perp = rot90(axis);
  const placement = add2(wrist, scale2(axis, WATCH_OFFSET_MM * pxPerMm));
  return {
    wrist,
    breadthPx,
    pxPerMm,
    axis,
    finger,
    perp,
    placement,
    estimatedWristPx: LANDMARK_WRIST_TO_BREADTH * breadthPx,
  };
}

/** Crown rotation in radians. Right wrist adds π so the dial stays upright. */
export function crownRotation(handedness: Handedness, finger: Vec2): number {
  const base = Math.atan2(finger.y, finger.x);
  if (handedness === "right" && RIGHT_WRIST_CROWN_SIDE === "elbow") {
    return base + Math.PI;
  }
  return base;
}

/** 0 is horizontal, 90 is vertical. */
export function degreesFromHorizontal(axis: Vec2): number {
  const deg = Math.abs((Math.atan2(axis.y, axis.x) * 180) / Math.PI);
  return deg > 90 ? 180 - deg : deg;
}

export function insideFrame(point: Vec2, width: number, height: number, margin: number): boolean {
  return (
    point.x >= margin * width &&
    point.x <= width * (1 - margin) &&
    point.y >= margin * height &&
    point.y <= height * (1 - margin)
  );
}

export function requiredLandmarkPixels(hand: HandObservation, width: number, height: number): Vec2[] {
  return HAND_INDEX.map((index) => denorm(hand.landmarks[index], width, height));
}

export const POSE_INDEX = POSE;
