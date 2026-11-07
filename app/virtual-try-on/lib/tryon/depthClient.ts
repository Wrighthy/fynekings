import type { DepthCrop } from "./types";

type DepthResponse = {
  id: number;
  ok: boolean;
  kind?: string;
  width?: number;
  height?: number;
  buffer?: ArrayBuffer;
  error?: string;
};

let worker: Worker | null = null;
let nextId = 1;

function getWorker(): Worker {
  if (!worker) {
    worker = new Worker(new URL("../../workers/depth.worker.ts", import.meta.url));
  }
  return worker;
}

export function resetDepthWorker(): void {
  worker?.terminate();
  worker = null;
}

function request(payload: Record<string, unknown>, transfer?: Transferable[]): Promise<DepthResponse> {
  const id = nextId++;
  const current = getWorker();
  return new Promise((resolve, reject) => {
    const onMessage = (event: MessageEvent<DepthResponse>) => {
      if (event.data.id !== id) return;
      current.removeEventListener("message", onMessage);
      current.removeEventListener("error", onError);
      resolve(event.data);
    };
    const onError = () => {
      current.removeEventListener("message", onMessage);
      current.removeEventListener("error", onError);
      resetDepthWorker();
      reject(new Error("Depth worker failed"));
    };
    current.addEventListener("message", onMessage);
    current.addEventListener("error", onError);
    current.postMessage({ id, ...payload }, transfer ?? []);
  });
}

/** Start the download while the user is still positioning. */
export function warmupDepth(): void {
  request({ kind: "warmup" }).catch(() => {
    resetDepthWorker();
  });
}

/**
 * Relative depth for a crop. On failure the worker is destroyed and the
 * caller continues without depth.
 */
export async function estimateDepth(
  rgba: Uint8ClampedArray,
  width: number,
  height: number,
  originX: number,
  originY: number
): Promise<DepthCrop | null> {
  try {
    const copy = rgba.buffer.slice(rgba.byteOffset, rgba.byteOffset + rgba.byteLength);
    const response = await request(
      { kind: "depth", width, height, buffer: copy },
      [copy]
    );
    if (!response.ok || !response.buffer || !response.width || !response.height) {
      resetDepthWorker();
      return null;
    }
    return {
      data: new Float32Array(response.buffer),
      width: response.width,
      height: response.height,
      originX,
      originY,
    };
  } catch {
    resetDepthWorker();
    return null;
  }
}
