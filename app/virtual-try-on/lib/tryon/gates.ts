import {
  FOREARM_HINT_DEG,
  FRAME_MARGIN,
  GUIDANCE,
  HAND_BREADTH_FRAC_MAX,
  HAND_BREADTH_FRAC_MIN,
  MAX_FOREARM_PITCH_DEG,
  MAX_HAND_TILT_DEG,
  MAX_LUMINANCE,
  MIN_LUMINANCE,
  MIN_POSE_VISIBILITY,
  MIN_SHARPNESS,
  POSE_WRIST_AGREEMENT,
  STABILITY_DISPLACEMENT,
  STABILITY_FRAMES,
} from "./constants";
import {
  crownRotation,
  degreesFromHorizontal,
  forearmPitchDeg,
  handTiltDeg,
  insideFrame,
  isBackFacing,
  placementOf,
  requiredLandmarkPixels,
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

export function evaluateGates(
  hands: HandObservation[],
  rawHistory: HandObservation[],
  width: number,
  height: number,
  quality: QualitySample | null,
  mode: "live" | "still" = "live"
): GateEvaluation {
  const hint =
    hands.length === 1 &&
    degreesFromHorizontal(placementOf(hands[0], width, height).axis) > FOREARM_HINT_DEG;

  if (hands.length === 0 || (hands.length === 1 && !hands[0].poseWrist)) {
    return {
      gates: [gate("G1", false, GUIDANCE.noWrist)],
      messageId: "noWrist",
      allPassed: false,
      hint: false,
      hand: hands[0] ?? null,
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

  const poseWristPx = hand.poseWrist ? denorm(hand.poseWrist, width, height) : null;
  const wristAgree =
    poseWristPx !== null &&
    len2(sub2(poseWristPx, place.wrist)) <= POSE_WRIST_AGREEMENT * width &&
    hand.landmarks.length >= 21;
  const g1 = wristAgree;

  const posePoints = [hand.poseWrist, hand.poseIndex, hand.posePinky].filter(
    (point): point is NonNullable<typeof point> => point !== null
  );
  const poseVis =
    hand.poseWristVisibility >= MIN_POSE_VISIBILITY &&
    hand.poseIndexVisibility >= MIN_POSE_VISIBILITY &&
    hand.posePinkyVisibility >= MIN_POSE_VISIBILITY;
  const beyond = {
    x: place.placement.x + place.axis.x * place.estimatedWristPx,
    y: place.placement.y + place.axis.y * place.estimatedWristPx,
  };
  const points = [
    ...requiredLandmarkPixels(hand, width, height),
    place.placement,
    beyond,
    ...posePoints.map((point) => denorm(point, width, height)),
  ];
  const g2 = poseVis && points.every((point) => insideFrame(point, width, height, FRAME_MARGIN));

  const g3 = isBackFacing(hand);

  const tilt = handTiltDeg(hand);
  const pitch = forearmPitchDeg(hand);
  const g4 =
    tilt !== null &&
    tilt <= MAX_HAND_TILT_DEG &&
    (pitch === null || pitch <= MAX_FOREARM_PITCH_DEG);

  const frac = width > 0 ? place.breadthPx / width : 0;
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
  if (!g1 || !hand.poseWrist) messageId = g1 ? "inFrame" : "inFrame";
  else if (!g2) messageId = "inFrame";
  else if (!g3) messageId = "backOfHand";
  else if (!g4) messageId = "flat";
  else if (!g5) messageId = tooSmall ? "closer" : "farther";
  else if (mode === "live" && quality !== null && !lumaOk) messageId = "lighting";
  else if (mode === "live" && (!g6 || (quality !== null && !sharpOk))) messageId = "still";

  if (!g1) messageId = "inFrame";

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
