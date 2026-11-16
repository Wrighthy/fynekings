import {
  ENABLE_DEPTH_SCALE_CORRECTION,
  LANDMARK_WRIST_TO_BREADTH,
  WRIST_RATIO_MAX,
  WRIST_RATIO_MIN,
} from "./constants";
import { crownRotation, placementOf, trigonometricWristWidthPx } from "./geometry";
import { maskAt, scanWidth } from "./mask";
import type { HandObservation, SnapshotMeasurements } from "./types";
import { add2, median, scale2 } from "./vec";

export function depthScaleCorrection(): number {
  if (!ENABLE_DEPTH_SCALE_CORRECTION) return 1;
  return 1;
}

/**
 * Measures wrist geometry using trigonometry from anatomical landmarks
 * (L0 wrist, L1 thumb CMC, L9 middle MCP, L17 pinky MCP) combined with
 * segmentation mask verification and distance-dampened watch scaling.
 */
export function measureWrist(
  hand: HandObservation,
  width: number,
  height: number,
  mask: Uint8Array | null
): SnapshotMeasurements {
  const place = placementOf(hand, width, height);
  const trigWidth = trigonometricWristWidthPx(hand, width, height);
  let lowConfidence = false;
  let wristWidthPx = trigWidth > 0 ? trigWidth : place.estimatedWristPx;

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
      const scannedWidth = median(widths) ?? first;
      const ratio = trigWidth > 0 ? scannedWidth / trigWidth : 1;
      if (ratio < 0.65 || ratio > 1.4) {
        // Mask silhouette diverged from geometric wrist width -> use trigonometric measurement
        lowConfidence = true;
        wristWidthPx = trigWidth;
      } else {
        // High quality blend: trigonometric geometric baseline + skin mask silhouette
        wristWidthPx = trigWidth * 0.6 + scannedWidth * 0.4;
      }
    }
  } else {
    lowConfidence = true;
  }

  // Trigonometric scale calculation:
  // Average human wrist width is ~58mm.
  // We compute base pxPerMm from the trigonometric wrist width, blended with knuckle breadth.
  const wristPxPerMm = wristWidthPx / 58;
  const knucklePxPerMm = place.breadthPx / 80;
  const basePxPerMm = wristPxPerMm > 0 ? (wristPxPerMm * 0.7 + knucklePxPerMm * 0.3) : knucklePxPerMm;

  // Dampened scaling curve from the trigonometry method:
  // A pure linear ratio makes the watch balloon when the hand is close to the camera.
  // We use a sqrt curve above a reference width to compress the growth at close range
  // while keeping far-range (normal widths) essentially linear.
  const referenceWidth = Math.min(width, height) * 0.18;
  const ratio = wristWidthPx / (referenceWidth || 1);
  const dampedRatio = ratio <= 1 ? ratio : 1 + Math.sqrt(ratio - 1);
  const dampFactor = ratio > 0 ? dampedRatio / ratio : 1;
  const pxPerMm = basePxPerMm * dampFactor * depthScaleCorrection();

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
