/**
 * Snapshot try-on thresholds and copy.
 *
 * Hand detection uses MediaPipe HandLandmarker.
 * Model files are loaded from pinned URLs. Licenses are recorded in THIRD_PARTY_LICENSES.md.
 *
 * This is the virtual try-on method for the Fynekings snapshot experience.
 */

export const HOLD_MS = 1000;
/**
 * Maximum hand tilt in degrees (palm plane vs the screen). Wide enough that a
 * wrist held at a natural slant passes; scale is corrected for the tilt in
 * handBreadthPx, so a slanted hand does not shrink the watch.
 */
export const MAX_HAND_TILT_DEG = 55;
export const MAX_FOREARM_PITCH_DEG = 25;
export const FRAME_MARGIN = 0.05;
export const HAND_BREADTH_MM = 80;
export const WATCH_OFFSET_MM = 39;
/** Lateral shift along the wrist/screen plane in mm per hand. */
export const WATCH_LATERAL_OFFSET_MM = {
  right: 4,
  left: -9,
} as const;

export function getWatchLateralOffsetMm(handedness: "left" | "right"): number {
  return WATCH_LATERAL_OFFSET_MM[handedness] ?? (handedness === "right" ? 4 : -16);
}

/**
 * Knuckle breadth as a share of the frame's short side. The upper bound is
 * high so the wrist can be held close, with the fingers out of the frame.
 */
export const HAND_BREADTH_FRAC_MIN = 0.08;
export const HAND_BREADTH_FRAC_MAX = 0.6;
/** Upper limit on how much the tilt correction may enlarge the measured breadth. */
export const MAX_FORESHORTENING_CORRECTION = 2.5;
/** Relaxed depth flatness threshold. */
export const DEPTH_FLATNESS_MAX = 0.60;
export const ENABLE_DEPTH_SCALE_CORRECTION = false;
export const DEPTH_SCALE_MIN = 0.92;
export const DEPTH_SCALE_MAX = 1.08;
export const WRIST_RATIO_MIN = 0.55;
export const WRIST_RATIO_MAX = 1.0;
export const RIGHT_WRIST_CROWN_SIDE = "elbow" as const;
export const PROCESSING_TIMEOUT_MS = 15000;

/** Laplacian variance below this fails the sharpness check. Starting default. */
export const MIN_SHARPNESS = 15;
export const MIN_LUMINANCE = 40;
export const MAX_LUMINANCE = 220;

export const MIN_POSE_VISIBILITY = 0.5;
export const POSE_WRIST_AGREEMENT = 0.05;
export const STABILITY_FRAMES = 8;
export const STABILITY_DISPLACEMENT = 0.015;
export const FOREARM_HINT_DEG = 45;

/**
 * Front-camera preview is mirrored. MediaPipe labels hands as if the bitmap
 * were unmirrored, so labels are swapped when the bitmap matches the mirror.
 */
export const SWAP_HANDEDNESS_ON_MIRRORED_BITMAP = true;

/**
 * Back of the hand faces the camera when `n.z * sign > 0` in a MIRRORED
 * picture (front camera), where `sign` is for the real hand. An unmirrored
 * picture (rear camera) negates this; see isBackFacing in geometry.ts.
 * Axes assumed for world landmarks: x right, y down, z away from the camera
 * (MediaPipe: smaller z is closer).
 */
export const BACK_FACING_SIGN_LEFT = 1;
export const BACK_FACING_SIGN_RIGHT = -1;

export const PALM_NORMAL_DEADZONE = 0.02;

/** Synthetic forearm band and landmark-only wrist width, as a fraction of hand breadth. */
export const LANDMARK_WRIST_TO_BREADTH = 0.75;
/** Half-length of the fallback capsule, as a fraction of hand breadth. */
export const SYNTHETIC_BAND_HALF_LENGTH = 0.9;

export const MASK_KERNEL_FRAC = 0.015;
export const CROP_EXPAND = 0.25;
export const DEPTH_MIN_SHORT_SIDE = 518;
export const DEPTH_SIZE_MULTIPLE = 14;
export const FEATHER_SIGMA_FRAC = 0.006;
export const EDGE_SHADE_BAND_FRAC = 0.12;
export const EDGE_SHADE_MAX = 0.35;
export const SHADOW_OFFSET_FRAC = 0.03;
export const SHADOW_BLUR_FRAC = 0.04;
export const SHADOW_OPACITY = 0.3;
export const MAX_SNAPSHOT_EDGE = 1920;
export const OOM_RETRY_EDGE = 1280;

export const DEFAULT_CASE_DIAMETER_MM = 40;
export const DEFAULT_LUG_TO_LUG_MM = 47;
export const DEFAULT_STRAP_WIDTH_MM = 20;
/**
 * Share of a legacy sticker's width that is the case, until WA-2 metadata exists.
 */
export const LEGACY_CASE_WIDTH_FRACTION = 0.42;

/**
 * Watch scale calibration multiplier per hand.
 */
export const WATCH_SCALE_CALIBRATION = {
  right: 0.95,
  left: 0.95,
} as const;

export function getWatchScaleCalibration(handedness: "left" | "right"): number {
  return WATCH_SCALE_CALIBRATION[handedness] ?? 0.95;
}

/**
 * Baseline rotation offset for the watch in degrees per hand.
 * Right hand: -12°
 * Left hand: +12° (mirrored symmetry for natural left wrist presentation)
 */
export const WATCH_ROTATION_OFFSET_DEG = {
  right: -12,
  left: 12,
} as const;

export function getWatchRotationOffsetDeg(handedness: "left" | "right"): number {
  return WATCH_ROTATION_OFFSET_DEG[handedness] ?? (handedness === "right" ? -12 : 12);
}

export const ADJUST_ROTATION_DEG = 15;
export const ADJUST_SCALE_MIN = 0.85;
export const ADJUST_SCALE_MAX = 1.15;

/** Pose indices in the 33-point MediaPipe pose. Kept for reference. */
export const POSE = {
  leftElbow: 13,
  rightElbow: 14,
  leftWrist: 15,
  rightWrist: 16,
  leftIndex: 19,
  rightIndex: 20,
  leftPinky: 21,
  rightPinky: 22,
} as const;

export const WASM_URL =
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1/wasm";

export const HAND_MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task";

export const HOLISTIC_MODEL_URL = HAND_MODEL_URL;

export const SELFIE_MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_multiclass_256x256/float32/1/selfie_multiclass_256x256.tflite";

/** Pinned Apache-2.0 checkpoint. See THIRD_PARTY_LICENSES.md. */
export const DEPTH_MODEL_ID = "onnx-community/depth-anything-v2-small";
export const DEPTH_MODEL_REVISION = "4472b7362082ad9968fee890ca0f1e5aca36b93d";

export const GUIDANCE = {
  noWrist: "Point the camera at the back of your wrist",
  oneWrist: "Show only one wrist",
  inFrame: "Bring your wrist into the frame. Your fingers can be cut off",
  backOfHand: "Turn your hand over to show the back of your wrist",
  flat: "Turn the back of your wrist a little more toward the camera",
  closer: "Move closer",
  farther: "Move back a little",
  lighting: "Find better lighting",
  still: "Hold still",
  perfect: "Perfect, hold still",
  forearmHint: "Hold your forearm sideways for the most natural view",
  leftHand: "Left hand detected",
  rightHand: "Right hand detected",
  analysing: "Analysing your wrist...",
  flattenDepth: "Flatten your wrist",
  lowConfidence: "Fit preview may be less accurate. Retake for best results",
  approximation: "This preview is an approximation.",
  privacy:
    "Your photo stays on this device. Nothing is uploaded unless you save it.",
  processingTimeout: "This is taking too long. Please try again.",
  genericProcessing: "The photo could not be processed. Please try again.",
} as const;

export type GuidanceId = keyof typeof GUIDANCE;

export const CAMERA = {
  deniedDesktop:
    "Camera access was denied. Click the camera icon in your browser's address bar to allow camera access, then reload.",
  deniedIos:
    "Camera access was denied. Go to Settings → Safari → Camera & Microphone Access, then reload this page.",
  deniedAndroid:
    "Camera access was denied. Tap the lock icon in the address bar → Permissions → Camera → Allow.",
  missing: "No camera found on this device. Please connect a camera and try again.",
  inUse:
    "Camera is in use by another application. Please close other camera apps and try again.",
  insecure:
    "Camera access requires a secure connection (HTTPS). Please open this page over HTTPS.",
  noRear:
    "Virtual try-on needs your phone's back camera, and we couldn't open it. Close other camera apps and try again.",
  generic: "Could not access the camera. Please check your browser permissions.",
} as const;
