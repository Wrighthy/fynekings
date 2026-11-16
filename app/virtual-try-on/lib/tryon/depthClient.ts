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

function getWorker(): Worker | null {
  if (typeof window === "undefined" || typeof Worker === "undefined") return null;
  if (!worker) {
    try {
      worker = new Worker(new URL("../../workers/depth.worker.ts", import.meta.url));
    } catch {
      worker = null;
    }
  }
  return worker;
}

export function resetDepthWorker(): void {
  try {
    worker?.terminate();
  } catch {}
  worker = null;
}

function request(payload: Record<string, unknown>, transfer?: Transferable[]): Promise<DepthResponse> {
  const id = nextId++;
  const current = getWorker();
  if (!current) {
    return Promise.resolve({ id, ok: false, error: "No worker available" });
  }

  return new Promise((resolve) => {
    // 2.5s maximum timeout so depth never delays the capture flow
    const timer = setTimeout(() => {
      cleanup();
      resolve({ id, ok: false, error: "Depth request timed out" });
    }, 2500);

    const onMessage = (event: MessageEvent<DepthResponse>) => {
      if (event.data.id !== id) return;
      cleanup();
      resolve(event.data);
    };

    const onError = () => {
      cleanup();
      resetDepthWorker();
      resolve({ id, ok: false, error: "Depth worker failed" });
    };

    function cleanup() {
      clearTimeout(timer);
      current?.removeEventListener("message", onMessage);
      current?.removeEventListener("error", onError);
    }

    current.addEventListener("message", onMessage);
    current.addEventListener("error", onError);

    try {
      current.postMessage({ id, ...payload }, transfer ?? []);
    } catch (err) {
      cleanup();
      resolve({ id, ok: false, error: String(err) });
    }
  });
}

/** Start download/warmup if available. Never throws or blocks. */
export function warmupDepth(): void {
  try {
    request({ kind: "warmup" }).catch(() => resetDepthWorker());
  } catch {}
}

/**
 * Relative depth for a crop. On failure or timeout, returns null cleanly
 * so the capture pipeline continues without interruption.
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
    return null;
  }
}
