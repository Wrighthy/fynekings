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
  // ── Rear / back camera (required for mobile back-of-wrist AR) ──
  if (!front) {
    // 1. If device labels are already available, locate a back/rear camera directly
    try {
      if (typeof navigator !== "undefined" && navigator.mediaDevices?.enumerateDevices) {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter((d) => d.kind === "videoinput");
        const backDevice = videoDevices.find((d) => {
          const label = d.label.toLowerCase();
          return (
            label.includes("back") ||
            label.includes("rear") ||
            label.includes("environment") ||
            label.includes("facing back")
          );
        });

        if (backDevice?.deviceId) {
          try {
            return await navigator.mediaDevices.getUserMedia({
              video: {
                deviceId: { exact: backDevice.deviceId },
                width: { ideal: 1280 },
                height: { ideal: 720 },
              },
            });
          } catch {
            // If deviceId constraint fails, continue to facingMode
          }
        }
      }
    } catch {
      // Permission might not be granted yet, continue
    }

    // 2. Request back camera using exact environment facingMode
    try {
      return await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { exact: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
    } catch (err) {
      if (err instanceof DOMException && (err.name === "NotAllowedError" || err.name === "SecurityError")) {
        throw err;
      }
    }

    // 3. Request back camera using ideal environment facingMode (without rigid max dimensions)
    try {
      return await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
    } catch (err) {
      if (err instanceof DOMException && (err.name === "NotAllowedError" || err.name === "SecurityError")) {
        throw err;
      }
    }

    // 4. Request with bare ideal environment constraint
    try {
      return await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
        },
      });
    } catch (err) {
      if (err instanceof DOMException && (err.name === "NotAllowedError" || err.name === "SecurityError")) {
        throw err;
      }
    }

    // 5. Enumerate devices now that permission may have been granted to find the rear camera
    try {
      if (typeof navigator !== "undefined" && navigator.mediaDevices?.enumerateDevices) {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter((d) => d.kind === "videoinput");
        const backDevice = videoDevices.find((d) => {
          const label = d.label.toLowerCase();
          return (
            label.includes("back") ||
            label.includes("rear") ||
            label.includes("environment") ||
            label.includes("facing back")
          );
        });
        if (backDevice?.deviceId) {
          return await navigator.mediaDevices.getUserMedia({
            video: { deviceId: { exact: backDevice.deviceId } },
          });
        }
      }
    } catch {
      // ignore
    }

    // 6. Last fallback — strictly keep facingMode: "environment", NEVER plain { video: true }
    return navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" },
    });
  }

  // ── Front camera (fallback for devices with only front camera) ──
  try {
    return await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: "user",
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
    });
  } catch (err) {
    if (err instanceof DOMException && (err.name === "NotAllowedError" || err.name === "SecurityError")) {
      throw err;
    }
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
