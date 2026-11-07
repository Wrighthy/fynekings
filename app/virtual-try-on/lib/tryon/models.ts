import {
  FilesetResolver,
  HolisticLandmarker,
  ImageSegmenter,
  type HolisticLandmarker as HolisticInstance,
  type ImageSegmenter as SegmenterInstance,
} from "@mediapipe/tasks-vision";
import { HOLISTIC_MODEL_URL, SELFIE_MODEL_URL, WASM_URL } from "./constants";

export type VisionProgress = (status: string) => void;

let holisticPromise: Promise<HolisticInstance> | null = null;
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

async function createHolistic(delegate: "GPU" | "CPU"): Promise<HolisticInstance> {
  const vision = await FilesetResolver.forVisionTasks(WASM_URL);
  return HolisticLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: HOLISTIC_MODEL_URL,
      delegate,
    },
    runningMode: "VIDEO",
    outputFaceBlendshapes: false,
    outputPoseSegmentationMasks: false,
    minHandLandmarksConfidence: 0.5,
    minPoseDetectionConfidence: 0.5,
    minPosePresenceConfidence: 0.5,
  });
}

async function createHolisticWithFallback(onProgress?: VisionProgress): Promise<HolisticInstance> {
  onProgress?.("Loading vision runtime...");
  try {
    onProgress?.("Loading wrist tracking...");
    return await createHolistic("GPU");
  } catch {
    onProgress?.("Switching to the compatible tracker...");
    return createHolistic("CPU");
  }
}

export function getHolisticLandmarker(onProgress?: VisionProgress): Promise<HolisticInstance> {
  if (holisticPromise) return holisticPromise;

  holisticPromise = (async () => {
    const bytes = await contentLength(HOLISTIC_MODEL_URL);
    notedBytes += bytes;
    if (bytes > 0) {
      onProgress?.(`Wrist model · ${(bytes / (1024 * 1024)).toFixed(0)} MB`);
    }
    try {
      return await createHolisticWithFallback(onProgress);
    } catch (first) {
      onProgress?.("Retrying the wrist model...");
      try {
        return await createHolisticWithFallback(onProgress);
      } catch (second) {
        holisticPromise = null;
        throw second ?? first;
      }
    }
  })();

  return holisticPromise;
}

export function resetHolisticLandmarker(): void {
  holisticPromise = null;
}

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

export type { HolisticInstance, SegmenterInstance };
