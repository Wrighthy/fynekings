import {
  FRAME_MARGIN,
  GUIDANCE,
  HAND_BREADTH_FRAC_MAX,
  HAND_BREADTH_FRAC_MIN,
  MAX_FOREARM_PITCH_DEG,
  MAX_HAND_TILT_DEG,
  MAX_LUMINANCE,
  MIN_LUMINANCE,
  MIN_SHARPNESS,
  POSE_WRIST_AGREEMENT,
  STABILITY_DISPLACEMENT,
  STABILITY_FRAMES,
} from "./constants";
import {
  crownRotation,
  forearmPitchDeg,
  handTiltDeg,
  insideFrame,
  isBackFacing,
  placementOf,
} from "./geometry";
import type { GateResult, GuidanceId, HandObservation, QualitySample } from "./types";
import { denorm, len2, sub2 } from "./vec";

export type GateEvaluation = {
  gates: GateResult[];
  messageId: GuidanceId;
  allPassed: boolean;
  hint: boolean;
  hand: HandObservation | null;
};

function gate(id: GateResult["id"], passed: boolean, message: string): GateResult {
  return { id, passed, message };
}

function meanStep(history: HandObservation[], width: number, height: number): number | null {
  if (history.length < 2) return null;
  const recent = history.slice(-STABILITY_FRAMES);
  let total = 0;
  let count = 0;
  for (let i = 1; i < recent.length; i++) {
    const prev = recent[i - 1];
    const curr = recent[i];
    if (prev.handedness !== curr.handedness) return null;
    for (const index of [0, 5, 9, 13, 17]) {
      const a = denorm(prev.landmarks[index], width, height);
      const b = denorm(curr.landmarks[index], width, height);
      total += len2(sub2(a, b));
      count += 1;
    }
  }
  return count === 0 ? null : total / count;
}

/** Whether pose landmarks are available for this observation. */
function hasPose(hand: HandObservation): boolean {
  return hand.poseWrist !== null;
}

export function evaluateGates(
  hands: HandObservation[],
  rawHistory: HandObservation[],
  width: number,
  height: number,
  quality: QualitySample | null,
  mode: "live" | "still" = "live"
): GateEvaluation {
  // Vertical wrist presentation is fully enabled on all devices (no 45° sideways requirement).
  const hint = false;

  if (hands.length === 0) {
    return {
      gates: [gate("G1", false, GUIDANCE.noWrist)],
      messageId: "noWrist",
      allPassed: false,
      hint: false,
      hand: null,
    };
  }

  if (hands.length !== 1) {
    return {
      gates: [gate("G1", false, GUIDANCE.oneWrist)],
      messageId: "oneWrist",
      allPassed: false,
      hint: false,
      hand: null,
    };
  }

  const hand = hands[0];
  const place = placementOf(hand, width, height);
  const diagonal = Math.hypot(width, height);

  // G1: MediaPipe HandLandmarker presence. Exactly one hand with 21 landmarks.
  let g1: boolean;
  if (hasPose(hand)) {
    const poseWristPx = denorm(hand.poseWrist!, width, height);
    g1 =
      len2(sub2(poseWristPx, place.wrist)) <= POSE_WRIST_AGREEMENT * width &&
      hand.landmarks.length >= 21;
  } else {
    // HandLandmarker tracking — verified by 21 hand landmarks
    g1 = hand.landmarks.length >= 21;
  }

  // G2: Wrist in frame. The wrist landmark and the watch placement position
  // must be inside the frame. The entire forearm is not required to be in frame.
  const wristInFrame = insideFrame(place.wrist, width, height, FRAME_MARGIN);
  const placementInFrame = insideFrame(place.placement, width, height, FRAME_MARGIN);
  const g2 = wristInFrame && placementInFrame;

  // G3: Back of hand facing the camera
  const g3 = isBackFacing(hand);

  const tilt = handTiltDeg(hand);
  const pitch = forearmPitchDeg(hand);
  const g4 =
    tilt !== null &&
    tilt <= MAX_HAND_TILT_DEG &&
    (pitch === null || pitch <= MAX_FOREARM_PITCH_DEG);

  // G5: Distance / Hand size.
  // Use the shorter dimension (width in portrait, height in landscape/desktop)
  // so vertical presentation on desktop webcams does not penalise the ratio.
  const refDim = Math.min(width, height);
  const frac = refDim > 0 ? place.breadthPx / refDim : 0;
  const g5 = frac >= HAND_BREADTH_FRAC_MIN && frac <= HAND_BREADTH_FRAC_MAX;
  const tooSmall = frac < HAND_BREADTH_FRAC_MIN;

  const step = meanStep(rawHistory, width, height);
  const g6 = mode === "still" || (step !== null && step < STABILITY_DISPLACEMENT * diagonal);

  const lumaOk =
    quality !== null &&
    quality.luminance >= MIN_LUMINANCE &&
    quality.luminance <= MAX_LUMINANCE;
  const sharpOk = quality !== null && quality.sharpness >= MIN_SHARPNESS;
  // G7 is recommended. A missing sample, or a still-image recheck, does not block.
  const g7 = mode === "still" || quality === null || (lumaOk && sharpOk);

  const gates: GateResult[] = [
    gate("G1", g1, GUIDANCE.inFrame),
    gate("G2", g2, GUIDANCE.inFrame),
    gate("G3", g3, GUIDANCE.backOfHand),
    gate("G4", g4, GUIDANCE.flat),
    gate("G5", g5, tooSmall ? GUIDANCE.closer : GUIDANCE.farther),
    gate("G6", g6, GUIDANCE.still),
    gate("G7", g7, !lumaOk ? GUIDANCE.lighting : GUIDANCE.still),
  ];

  let messageId: GuidanceId = "perfect";
  if (!g1) messageId = "inFrame";
  else if (!g2) messageId = "inFrame";
  else if (!g3) messageId = "backOfHand";
  else if (!g4) messageId = "flat";
  else if (!g5) messageId = tooSmall ? "closer" : "farther";
  else if (mode === "live" && quality !== null && !lumaOk) messageId = "lighting";
  else if (mode === "live" && (!g6 || (quality !== null && !sharpOk))) messageId = "still";

  return {
    gates,
    messageId,
    allPassed: gates.every((item) => item.passed),
    hint,
    hand,
  };
}

export function rotationFromHand(hand: HandObservation, width: number, height: number): number {
  return crownRotation(hand.handedness, placementOf(hand, width, height).finger);
}
