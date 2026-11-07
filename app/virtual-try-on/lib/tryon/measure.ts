import {
  ENABLE_DEPTH_SCALE_CORRECTION,
  LANDMARK_WRIST_TO_BREADTH,
  WRIST_RATIO_MAX,
  WRIST_RATIO_MIN,
} from "./constants";
import { crownRotation, placementOf } from "./geometry";
import { maskAt, scanWidth } from "./mask";
import type { HandObservation, SnapshotMeasurements } from "./types";
import { add2, median, scale2 } from "./vec";

export function depthScaleCorrection(): number {
  // The spec clamps a correction and leaves it off. No formula is given
  // beyond that clamp, so the factor stays 1 while the flag is false.
  if (!ENABLE_DEPTH_SCALE_CORRECTION) return 1;
  return 1;
}

export function measureWrist(
  hand: HandObservation,
  width: number,
  height: number,
  mask: Uint8Array | null
): SnapshotMeasurements {
  const place = placementOf(hand, width, height);
  let lowConfidence = false;
  let wristWidthPx = LANDMARK_WRIST_TO_BREADTH * place.breadthPx;

  if (mask) {
    const first = scanWidth(mask, width, height, place.placement, place.perp);
    if (first === null || first < 2) {
      lowConfidence = true;
    } else {
      const widths = [first];
      for (const offset of [-0.2, -0.1, 0.1, 0.2]) {
        const origin = add2(place.placement, scale2(place.axis, first * offset));
        const sample = scanWidth(mask, width, height, origin, place.perp);
        if (sample !== null) widths.push(sample);
      }
      wristWidthPx = median(widths) ?? first;
      const ratio = place.breadthPx > 0 ? wristWidthPx / place.breadthPx : 0;
      if (ratio < WRIST_RATIO_MIN || ratio > WRIST_RATIO_MAX) {
        lowConfidence = true;
        wristWidthPx = LANDMARK_WRIST_TO_BREADTH * place.breadthPx;
      }
    }
  } else {
    lowConfidence = true;
  }

  const pxPerMm = place.pxPerMm * depthScaleCorrection();
  const rotation = crownRotation(hand.handedness, place.finger);

  return {
    handedness: hand.handedness,
    pxPerMm,
    wristWidthPx,
    handBreadthPx: place.breadthPx,
    placementPoint: place.placement,
    forearmAxis: place.axis,
    fingerDirection: place.finger,
    perp: place.perp,
    rotation,
    lowConfidence,
    wristWidthMm: pxPerMm > 0 ? wristWidthPx / pxPerMm : 0,
  };
}

export function wristSeedInMask(
  mask: Uint8Array,
  width: number,
  height: number,
  hand: HandObservation
): boolean {
  const place = placementOf(hand, width, height);
  return maskAt(mask, width, height, place.wrist.x, place.wrist.y);
}
