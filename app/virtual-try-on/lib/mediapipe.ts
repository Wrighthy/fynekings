"use client";

import {
  FilesetResolver,
  HandLandmarker,
} from "@mediapipe/tasks-vision";

// Re-export types for consumer convenience
export type { HandLandmarkerResult, NormalizedLandmark } from "@mediapipe/tasks-vision";

let landmarkerPromise: Promise<HandLandmarker> | null = null;

/**
 * Lazy-initialise the MediaPipe HandLandmarker and return a cached singleton.
 * Subsequent calls return the same promise/instance.
 *
 * @param onProgress – optional callback to update a loading UI
 */
export async function getHandLandmarker(
  onProgress?: (status: string) => void
): Promise<HandLandmarker> {
  if (landmarkerPromise) return landmarkerPromise;

  landmarkerPromise = (async () => {
    onProgress?.("Loading vision runtime...");

    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
    );

    onProgress?.("Loading hand detection model...");

    const landmarker = await HandLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath:
          "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
        delegate: "GPU",
      },
      runningMode: "VIDEO", // Synchronous results within rAF — simpler React integration
      numHands: 1,
      minHandDetectionConfidence: 0.7,
      minHandPresenceConfidence: 0.7,
      minTrackingConfidence: 0.5,
    });

    onProgress?.("Ready");
    return landmarker;
  })();

  return landmarkerPromise;
}

/** Reset the singleton so the next call re-initialises. Call on page unmount. */
export function resetHandLandmarker(): void {
  landmarkerPromise = null;
}
