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
  getWatchLateralOffsetMm,
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
  if (n) {
    const l = len3(n);
    if (l > 1e-8) {
      const unitZ = n.z / l;
      const signed = unitZ * backFacingSign(hand.handedness);
      return signed > PALM_NORMAL_DEADZONE;
    }
  }

  // 2D image-space fallback using landmarks (wrist 0 -> index 5 x wrist 0 -> pinky 17)
  if (hand.landmarks && hand.landmarks.length >= 18) {
    const v1x = hand.landmarks[5].x - hand.landmarks[0].x;
    const v1y = hand.landmarks[5].y - hand.landmarks[0].y;
    const v2x = hand.landmarks[17].x - hand.landmarks[0].x;
    const v2y = hand.landmarks[17].y - hand.landmarks[0].y;
    const crossZ = v1x * v2y - v1y * v2x;
    const mag = Math.hypot(v1x, v1y) * Math.hypot(v2x, v2y);
    if (mag > 1e-6) {
      const signed = (crossZ / mag) * backFacingSign(hand.handedness);
      return signed > PALM_NORMAL_DEADZONE;
    }
  }

  return false;
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

/**
 * Derives wrist width in pixels from landmarks 0 (wrist), 1 (thumb CMC),
 * and 17 (pinky MCP) using trigonometry.
 *
 * The distance from landmark 0 to a reference landmark is the hypotenuse
 * of a right-angled triangle. Angle θ is measured between that vector and
 * the arm axis (wrist → middleMCP, landmark 9). The component perpendicular
 * to the arm axis (hypotenuse × sin θ) gives the lateral projection.
 *
 * We take whichever projection is larger (thumb CMC or pinky MCP) for robustness
 * across both hands, and scale by 2 / 1.09.
 */
export function trigonometricWristWidthPx(
  hand: HandObservation,
  width: number,
  height: number
): number {
  if (!hand.landmarks || hand.landmarks.length < 18) {
    return LANDMARK_WRIST_TO_BREADTH * handBreadthPx(hand, width, height);
  }

  const wrist = denorm(hand.landmarks[0], width, height);
  const thumbCMC = denorm(hand.landmarks[1], width, height);
  const middleMCP = denorm(hand.landmarks[9], width, height);
  const pinkyMCP = denorm(hand.landmarks[17], width, height);

  // Arm axis direction (wrist → middle MCP)
  const armAngle = Math.atan2(middleMCP.y - wrist.y, middleMCP.x - wrist.x);

  // --- Landmark 1 (thumb CMC) ---
  const hypDx1 = thumbCMC.x - wrist.x;
  const hypDy1 = thumbCMC.y - wrist.y;
  const hypotenuse1 = Math.hypot(hypDx1, hypDy1);
  const theta1 = Math.atan2(hypDy1, hypDx1) - armAngle;
  const halfWidth1 = Math.abs(hypotenuse1 * Math.sin(theta1));

  // --- Landmark 17 (pinky MCP) ---
  const hypDx17 = pinkyMCP.x - wrist.x;
  const hypDy17 = pinkyMCP.y - wrist.y;
  const hypotenuse17 = Math.hypot(hypDx17, hypDy17);
  const theta17 = Math.atan2(hypDy17, hypDx17) - armAngle;
  const halfWidth17 = Math.abs(hypotenuse17 * Math.sin(theta17));

  const halfWristWidth = Math.max(halfWidth1, halfWidth17);
  const crossWristWidth = (2 * halfWristWidth) / 1.09;

  return crossWristWidth;
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
  const lateralMm = getWatchLateralOffsetMm(hand.handedness);
  const basePlacement = add2(wrist, scale2(axis, WATCH_OFFSET_MM * pxPerMm));
  const placement = {
    x: basePlacement.x + lateralMm * pxPerMm,
    y: basePlacement.y,
  };
  const trigWidth = trigonometricWristWidthPx(hand, width, height);
  const estimatedWristPx = trigWidth > 0 ? trigWidth : LANDMARK_WRIST_TO_BREADTH * breadthPx;
  return {
    wrist,
    breadthPx,
    pxPerMm,
    axis,
    finger,
    perp,
    placement,
    estimatedWristPx,
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
