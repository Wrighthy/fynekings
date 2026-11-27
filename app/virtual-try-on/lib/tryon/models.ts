import {
  FilesetResolver,
  HandLandmarker,
  ImageSegmenter,
  type HandLandmarker as HandLandmarkerInstance,
  type ImageSegmenter as SegmenterInstance,
} from "@mediapipe/tasks-vision";
import { HAND_MODEL_URL, SELFIE_MODEL_URL, WASM_URL } from "./constants";

export type VisionProgress = (status: string) => void;

let handPromise: Promise<HandLandmarkerInstance> | null = null;
let segmenterPromise: Promise<SegmenterInstance> | null = null;
let skinIndex = 2;
let clothesIndex = 4;
let notedBytes = 0;

export function modelDownloadBytes(): number {
  return notedBytes;
}

async function contentLength(url: string): Promise<number> {
  try {
    const response = await fetch(url, { method: "HEAD" });
    const value = Number(response.headers.get("content-length"));
    return Number.isFinite(value) && value > 0 ? value : 0;
  } catch {
    return 0;
  }
}

async function createHandLandmarker(delegate: "GPU" | "CPU"): Promise<HandLandmarkerInstance> {
  const vision = await FilesetResolver.forVisionTasks(WASM_URL);
  return HandLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: HAND_MODEL_URL,
      delegate,
    },
    runningMode: "VIDEO",
    numHands: 2,
    minHandDetectionConfidence: 0.5,
    minHandPresenceConfidence: 0.5,
    minTrackingConfidence: 0.5,
  });
}

async function createWithFallback(onProgress?: VisionProgress): Promise<HandLandmarkerInstance> {
  onProgress?.("Loading vision runtime...");
  try {
    onProgress?.("Loading wrist tracking...");
    return await createHandLandmarker("GPU");
  } catch {
    onProgress?.("Switching to the compatible tracker...");
    return createHandLandmarker("CPU");
  }
}

/**
 * Returns a MediaPipe HandLandmarker instance configured for video tracking.
 */
export function getHandLandmarker(onProgress?: VisionProgress): Promise<HandLandmarkerInstance> {
  if (handPromise) return handPromise;

  handPromise = (async () => {
    const bytes = await contentLength(HAND_MODEL_URL);
    notedBytes += bytes;
    if (bytes > 0) {
      onProgress?.(`Wrist model · ${(bytes / (1024 * 1024)).toFixed(0)} MB`);
    }
    try {
      return await createWithFallback(onProgress);
    } catch (first) {
      onProgress?.("Retrying the wrist model...");
      try {
        return await createWithFallback(onProgress);
      } catch (second) {
        handPromise = null;
        throw second ?? first;
      }
    }
  })();

  return handPromise;
}

export function resetHandLandmarker(): void {
  handPromise = null;
}

/** Compatibility aliases */
export const getHolisticLandmarker = getHandLandmarker;
export const resetHolisticLandmarker = resetHandLandmarker;

async function createSegmenter(): Promise<SegmenterInstance> {
  const vision = await FilesetResolver.forVisionTasks(WASM_URL);
  const options = {
    baseOptions: {
      modelAssetPath: SELFIE_MODEL_URL,
      delegate: "GPU" as const,
    },
    runningMode: "IMAGE" as const,
    outputCategoryMask: true,
    outputConfidenceMasks: false,
  };
  try {
    return await ImageSegmenter.createFromOptions(vision, options);
  } catch {
    return ImageSegmenter.createFromOptions(vision, {
      ...options,
      baseOptions: { ...options.baseOptions, delegate: "CPU" },
    });
  }
}

/** Prefetch while the user is positioning. Failure does not block capture. */
export function prefetchSegmenter(): void {
  if (!segmenterPromise) {
    segmenterPromise = (async () => {
      const bytes = await contentLength(SELFIE_MODEL_URL);
      notedBytes += bytes;
      const segmenter = await createSegmenter();
      const labels = segmenter.getLabels().map((label) => label.toLowerCase());
      const skin = labels.findIndex((label) => label.includes("body-skin") || label === "body");
      const clothes = labels.findIndex((label) => label.includes("clothes") || label.includes("clothing"));
      if (skin >= 0) skinIndex = skin;
      if (clothes >= 0) clothesIndex = clothes;
      return segmenter;
    })().catch((err) => {
      segmenterPromise = null;
      throw err;
    });
  }
}

export async function getSegmenter(): Promise<SegmenterInstance> {
  prefetchSegmenter();
  return segmenterPromise as Promise<SegmenterInstance>;
}

export function categoryIndices(): { skin: number; clothes: number } {
  return { skin: skinIndex, clothes: clothesIndex };
}

export function resetSegmenter(): void {
  segmenterPromise = null;
}

export type HolisticInstance = HandLandmarkerInstance;
export type { HandLandmarkerInstance, SegmenterInstance };
