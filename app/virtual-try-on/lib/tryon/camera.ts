import { CAMERA } from "./constants";

export function getCameraErrorMessage(err: unknown): string {
  if (typeof DOMException !== "undefined" && err instanceof DOMException) {
    if (err.name === "NotAllowedError" || err.name === "SecurityError") {
      const ua = navigator.userAgent;
      if (/iPhone|iPad/.test(ua)) return CAMERA.deniedIos;
      if (/Android/.test(ua)) return CAMERA.deniedAndroid;
      return CAMERA.deniedDesktop;
    }
    if (err.name === "NotFoundError" || err.name === "OverconstrainedError") {
      return CAMERA.missing;
    }
    if (err.name === "NotReadableError" || err.name === "TrackStartError") {
      return CAMERA.inUse;
    }
  }
  if (typeof window !== "undefined" && !window.isSecureContext) return CAMERA.insecure;
  return CAMERA.generic;
}

export async function openCamera(front: boolean): Promise<MediaStream> {
  const video = {
    facingMode: front ? "user" : "environment",
    width: { ideal: 1280, max: 1920 },
    height: { ideal: 720, max: 1080 },
  };
  try {
    return await navigator.mediaDevices.getUserMedia({ video });
  } catch (err) {
    if (err instanceof DOMException && err.name === "NotAllowedError") throw err;
    return navigator.mediaDevices.getUserMedia({ video: true });
  }
}

/** Draw the video in the same orientation the user sees. */
export function paintDisplayFrame(
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement,
  mirrored: boolean
): boolean {
  const width = video.videoWidth;
  const height = video.videoHeight;
  if (!width || !height) return false;
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return false;
  ctx.save();
  if (mirrored) {
    ctx.translate(width, 0);
    ctx.scale(-1, 1);
  }
  ctx.drawImage(video, 0, 0, width, height);
  ctx.restore();
  return true;
}

export function downscaleCanvas(source: HTMLCanvasElement, maxEdge: number): HTMLCanvasElement {
  const longest = Math.max(source.width, source.height);
  if (longest <= maxEdge) return source;
  const scale = maxEdge / longest;
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(source.width * scale);
  canvas.height = Math.round(source.height * scale);
  const ctx = canvas.getContext("2d");
  ctx?.drawImage(source, 0, 0, canvas.width, canvas.height);
  return canvas;
}
