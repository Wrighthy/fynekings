import {
  FRAME_MARGIN,
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
 *
 * How it works: n = (index MCP − wrist) × (pinky MCP − wrist). Its z part
 * only depends on x and y, so it tells us which side of the hand the thumb is
 * on in the picture, nothing more. That becomes "palm or back" only once we
 * know the REAL hand: in an unmirrored picture (rear camera) the back of a
 * right hand has the thumb on the left (n.z > 0), while its palm has the thumb
 * on the right (n.z < 0). A left hand is the opposite, and mirroring the
 * picture (front camera) flips both.
 *
 * So `hand.handedness` must be the real hand (the wrist the user chose), not
 * MediaPipe's guess — that guess often swaps left/right exactly when the back
 * of the hand is shown, which makes a palm pass this check.
 *
 * BACK_FACING_SIGN_* are calibrated for a mirrored picture, so an unmirrored
 * (rear camera) picture negates them.
 */
export function isBackFacing(hand: HandObservation, mirrored = true): boolean {
  const signMultiplier = mirrored ? 1 : -1;

  const n = palmNormal(hand.worldLandmarks);
  if (n) {
    const l = len3(n);
    if (l > 1e-8) {
      const unitZ = n.z / l;
      const signed = unitZ * backFacingSign(hand.handedness) * signMultiplier;
      return signed > PALM_NORMAL_DEADZONE;
    }
  }

  // 2D image-space fallback using landmarks (wrist 0 -> index 5 x wrist 0 -> pinky 17).
  // Same chirality test as above, so the same sign rules apply.
  if (hand.landmarks && hand.landmarks.length >= 18) {
    const v1x = hand.landmarks[5].x - hand.landmarks[0].x;
    const v1y = hand.landmarks[5].y - hand.landmarks[0].y;
    const v2x = hand.landmarks[17].x - hand.landmarks[0].x;
    const v2y = hand.landmarks[17].y - hand.landmarks[0].y;
    const crossZ = v1x * v2y - v1y * v2x;
    const mag = Math.hypot(v1x, v1y) * Math.hypot(v2x, v2y);
    if (mag > 1e-6) {
      const signed = (crossZ / mag) * backFacingSign(hand.handedness) * signMultiplier;
      return signed > PALM_NORMAL_DEADZONE;
    }
  }

  return false;
}

/**
 * True only when the PALM clearly faces the camera. An edge-on (upright) hand
 * sits in the dead-zone and is not treated as palm-facing, so it may be captured.
 */
export function isPalmFacing(hand: HandObservation, mirrored = true): boolean {
  const signMultiplier = mirrored ? 1 : -1;
  const n = palmNormal(hand.worldLandmarks);
  if (n) {
    const l = len3(n);
    if (l > 1e-8) {
      const signed = (n.z / l) * backFacingSign(hand.handedness) * signMultiplier;
      return signed < -PALM_FACING_MIN;
    }
  }
  if (hand.landmarks && hand.landmarks.length >= 18) {
    const v1x = hand.landmarks[5].x - hand.landmarks[0].x;
    const v1y = hand.landmarks[5].y - hand.landmarks[0].y;
    const v2x = hand.landmarks[17].x - hand.landmarks[0].x;
    const v2y = hand.landmarks[17].y - hand.landmarks[0].y;
    const mag = Math.hypot(v1x, v1y) * Math.hypot(v2x, v2y);
    if (mag > 1e-6) {
      const signed = ((v1x * v2y - v1y * v2x) / mag) * backFacingSign(hand.handedness) * signMultiplier;
      return signed < -PALM_FACING_MIN;
    }
  }
  return false;
}

/**
 * Only reject as "palm" when the palm is turned well toward the camera
 * (more than ~60° from edge-on). Edge-on noise must not flip this.
 */
const PALM_FACING_MIN = 0.5;

const PALM_POINTS = [0, 5, 9, 13, 17] as const;
// PIP, DIP and tip of the four fingers (thumb excluded: it bends sideways).
const FINGER_JOINTS = [6, 7, 8, 10, 11, 12, 14, 15, 16, 18, 19, 20] as const;
/** Finger bend toward the palm must exceed this fraction of the palm length. */
const CURL_MIN_FRACTION = 0.05;
/** Below this |n.z| the hand is edge-on and palm vs back has no meaning. */
const CURL_MIN_FACING = 0.3;

/**
 * Which side of the hand faces the camera, judged from 3D finger curl alone,
 * with no use of left/right.
 *
 * The 2D thumb-side test in isBackFacing cannot tell a right PALM from a left
 * BACK: they are mirror images with the same outline. Fingers, though, always
 * bend toward the palm. MediaPipe world z grows away from the camera, so if
 * the finger joints sit nearer the camera than the palm plane, the palm faces
 * the camera, whichever hand it is.
 *
 * Returns null when the cue is too weak to trust (hand nearly flat, or
 * edge-on).
 */
export function facingFromCurl(hand: HandObservation): "palm" | "back" | null {
  const world = hand.worldLandmarks;
  if (!world || world.length < 21) return null;
  const n = palmNormal(world);
  if (!n) return null;
  const nLen = len3(n);
  const unit = { x: n.x / nLen, y: n.y / nLen, z: n.z / nLen };
  if (Math.abs(unit.z) < CURL_MIN_FACING) return null;

  const centroid = (indices: readonly number[]) => {
    const sum = { x: 0, y: 0, z: 0 };
    for (const i of indices) {
      sum.x += world[i].x;
      sum.y += world[i].y;
      sum.z += world[i].z;
    }
    return { x: sum.x / indices.length, y: sum.y / indices.length, z: sum.z / indices.length };
  };
  const offset = sub3(centroid(FINGER_JOINTS), centroid(PALM_POINTS));
  // Distance of the fingers off the palm plane, signed along the normal.
  const along = offset.x * unit.x + offset.y * unit.y + offset.z * unit.z;
  const palmLength = len3(sub3(world[9], world[0]));
  if (palmLength < 1e-6 || Math.abs(along) < CURL_MIN_FRACTION * palmLength) return null;
  // Depth change of the curl as seen by the camera: negative is toward it.
  const curlZ = along * unit.z;
  return curlZ < 0 ? "palm" : "back";
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

/**
 * Knuckle breadth (index MCP → pinky MCP) in pixels.
 *
 * Seen edge-on (hand upright, thumb or pinky toward the camera) the knuckle
 * line shrinks toward zero on screen. The wrist → middle-MCP line runs along
 * the hand and does not shrink when the hand rolls, so we rebuild the breadth
 * from it using the hand's own 3D proportions (world landmarks), and take the
 * larger of the two.
 */
export function handBreadthPx(hand: HandObservation, width: number, height: number): number {
  const a = denorm(hand.landmarks[5], width, height);
  const b = denorm(hand.landmarks[17], width, height);
  const projected = len2(sub2(a, b));
  const world = hand.worldLandmarks;
  if (!world || world.length < 18) return projected;
  const worldBreadth = len3(sub3(world[17], world[5]));
  const worldLength = len3(sub3(world[9], world[0]));
  if (worldBreadth < 1e-6 || worldLength < 1e-6) return projected;
  const wrist = denorm(hand.landmarks[0], width, height);
  const middle = denorm(hand.landmarks[9], width, height);
  const fromLength = len2(sub2(middle, wrist)) * (worldBreadth / worldLength);
  return Math.max(projected, fromLength);
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

/** Inset kept between a clamped watch placement and the frame edge. */
// Slightly inside the G2 margin so a clamped point never fails that check on rounding.
const PLACEMENT_EDGE_INSET = FRAME_MARGIN + 0.005;

/**
 * Largest t in [0, desired] such that origin + axis * t stays inside the frame
 * (inset by PLACEMENT_EDGE_INSET). If the origin itself is outside, returns 0.
 */
export function clampOffsetToFrame(
  origin: Vec2,
  axis: Vec2,
  desired: number,
  width: number,
  height: number
): number {
  if (width <= 0 || height <= 0) return desired;
  const minX = PLACEMENT_EDGE_INSET * width;
  const maxX = width * (1 - PLACEMENT_EDGE_INSET);
  const minY = PLACEMENT_EDGE_INSET * height;
  const maxY = height * (1 - PLACEMENT_EDGE_INSET);
  let t = desired;
  const limit = (p: number, d: number, lo: number, hi: number) => {
    if (d > 1e-9) t = Math.min(t, (hi - p) / d);
    else if (d < -1e-9) t = Math.min(t, (lo - p) / d);
  };
  limit(origin.x, axis.x, minX, maxX);
  limit(origin.y, axis.y, minY, maxY);
  return Math.max(0, t);
}

export function placementOf(hand: HandObservation, width: number, height: number): Placement {
  const wrist = denorm(hand.landmarks[0], width, height);
  const breadthPx = handBreadthPx(hand, width, height);
  const pxPerMm = breadthPx / HAND_BREADTH_MM;
  const axis = forearmAxis(hand, width, height);
  const finger = scale2(axis, -1);
  const perp = rot90(axis);
  const lateralMm = getWatchLateralOffsetMm(hand.handedness);
  const lateralPx = lateralMm * pxPerMm;
  // Shorten the wrist→watch offset when it would leave the frame. With the arm
  // upright the offset points down the forearm toward the bottom edge, where
  // the arm enters the picture, and the full 39mm often lands off-screen.
  const offsetPx = clampOffsetToFrame(
    { x: wrist.x + lateralPx, y: wrist.y },
    axis,
    WATCH_OFFSET_MM * pxPerMm,
    width,
    height
  );
  const basePlacement = add2(wrist, scale2(axis, offsetPx));
  const placement = {
    x: basePlacement.x + lateralPx,
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
