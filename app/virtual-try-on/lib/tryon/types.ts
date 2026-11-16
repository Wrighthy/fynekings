export type { GuidanceId } from "./constants";
import type { GuidanceId } from "./constants";

export type TryOnPhase =
  | "IDLE"
  | "CAMERA_PERMISSION"
  | "WATCH_SELECTED"
  | "DETECTING"
  | "READY"
  | "CAPTURING"
  | "PROCESSING"
  | "RESULT"
  | "ERROR";

export type Vec2 = { x: number; y: number };
export type Vec3 = { x: number; y: number; z: number };

export type Handedness = "left" | "right";

/** One detected hand plus the pose points that belong to it. */
export type HandObservation = {
  handedness: Handedness;
  /** 21 landmarks, normalised 0–1. */
  landmarks: Vec2[];
  worldLandmarks: Vec3[];
  poseWrist: Vec2 | null;
  poseElbow: Vec2 | null;
  poseIndex: Vec2 | null;
  posePinky: Vec2 | null;
  poseWristVisibility: number;
  poseElbowVisibility: number;
  poseIndexVisibility: number;
  posePinkyVisibility: number;
  poseWristWorld: Vec3 | null;
  poseElbowWorld: Vec3 | null;
};

export type QualitySample = {
  luminance: number;
  sharpness: number;
};

export type GateId = "G1" | "G2" | "G3" | "G4" | "G5" | "G6" | "G7";

export type GateResult = {
  id: GateId;
  passed: boolean;
  message: string;
};

export type ManualAdjustments = {
  /** Pixels along the forearm axis, in snapshot space. */
  alongPx: number;
  /** Pixels perpendicular to the forearm axis (lateral shift), in snapshot space. */
  lateralPx: number;
  rotationDeg: number;
  /** Multiplier around 1, limited to ±15%. */
  scale: number;
};

export const DEFAULT_ADJUSTMENTS: ManualAdjustments = {
  alongPx: 0,
  lateralPx: 0,
  rotationDeg: 0,
  scale: 1,
};

export type SnapshotMeasurements = {
  handedness: Handedness;
  pxPerMm: number;
  wristWidthPx: number;
  handBreadthPx: number;
  placementPoint: Vec2;
  forearmAxis: Vec2;
  fingerDirection: Vec2;
  perp: Vec2;
  /** Radians, clockwise in canvas space (y down). */
  rotation: number;
  lowConfidence: boolean;
  /** Estimated wrist width in millimetres. Approximate. */
  wristWidthMm: number;
};

export type WatchAsset = {
  id: string;
  caseDiameterMm: number;
  lugToLugMm: number;
  strapWidthMm: number;
  assetPxPerMm: number;
  caseLayerUrl: string;
  strapLayerUrl: string | null;
  anchor: Vec2;
  /** Single sticker with no strap layer (WA-3). */
  legacySticker: boolean;
  scaleFactor?: number;
  caseWidthFraction?: number;
};

export type LoadedWatch = {
  asset: WatchAsset;
  caseImage: CanvasImageSource;
  strapImage: CanvasImageSource | null;
  caseWidth: number;
  caseHeight: number;
};

export type MaskBuffer = {
  skin: Uint8Array;
  clothes: Uint8Array | null;
  width: number;
  height: number;
  synthetic: boolean;
};

export type DepthCrop = {
  data: Float32Array;
  width: number;
  height: number;
  originX: number;
  originY: number;
};

export type GuidanceState = {
  id: GuidanceId;
  allPassed: boolean;
  hint: boolean;
  hand: Handedness | null;
  holdProgress: number;
};
