import { CAMERA } from "./constants";

export function getCameraErrorMessage(err: unknown): string {
  if (err instanceof RearCameraUnavailableError) return CAMERA.noRear;
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

/** Thrown when the only camera the browser hands us faces the user. */
export class RearCameraUnavailableError extends Error {
  constructor() {
    super("Rear camera unavailable");
    this.name = "RearCameraUnavailableError";
  }
}

function isPermissionError(err: unknown): boolean {
  return (
    typeof DOMException !== "undefined" &&
    err instanceof DOMException &&
    (err.name === "NotAllowedError" || err.name === "SecurityError")
  );
}

const BACK_LABEL = /back|rear|environment/i;
const FRONT_LABEL = /front|user|selfie|facetime/i;

/**
 * True unless the stream is known to come from a user-facing camera.
 * `facingMode` in getSettings() is the reliable signal; the device label is a
 * fallback for browsers that leave facingMode empty.
 */
function isRearStream(stream: MediaStream): boolean {
  const track = stream.getVideoTracks()[0];
  if (!track) return false;
  const facing = track.getSettings?.().facingMode;
  if (facing) return facing === "environment";
  const label = track.label ?? "";
  if (BACK_LABEL.test(label)) return true;
  return !FRONT_LABEL.test(label);
}

async function findRearDeviceId(): Promise<string | null> {
  if (typeof navigator === "undefined" || !navigator.mediaDevices?.enumerateDevices) return null;
  const devices = await navigator.mediaDevices.enumerateDevices();
  const back = devices.find((d) => d.kind === "videoinput" && BACK_LABEL.test(d.label));
  return back?.deviceId || null;
}

/**
 * Open the phone's back camera. The try-on only works on the back of the
 * wrist through an unmirrored rear-camera picture, so this never falls back to
 * the front camera: a front-facing stream makes the back-of-hand check pass
 * for the palm instead.
 */
export async function openCamera(): Promise<MediaStream> {
  const size = { width: { ideal: 1280 }, height: { ideal: 720 } };
  const attempts: Array<() => Promise<MediaStreamConstraints | null>> = [
    async () => ({ video: { facingMode: { exact: "environment" }, ...size } }),
    async () => ({ video: { facingMode: { exact: "environment" } } }),
    // Labels are only filled in once permission has been granted.
    async () => {
      const id = await findRearDeviceId();
      return id ? { video: { deviceId: { exact: id }, ...size } } : null;
    },
    async () => ({ video: { facingMode: "environment" } }),
  ];

  for (const attempt of attempts) {
    let constraints: MediaStreamConstraints | null = null;
    try {
      constraints = await attempt();
    } catch {
      continue;
    }
    if (!constraints) continue;
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia(constraints);
    } catch (err) {
      if (isPermissionError(err)) throw err;
      continue;
    }
    if (isRearStream(stream)) return stream;
    stream.getTracks().forEach((track) => track.stop());
  }

  throw new RearCameraUnavailableError();
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
