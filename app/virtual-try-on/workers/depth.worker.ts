/// <reference lib="webworker" />

import { pipeline, env } from "@huggingface/transformers";
import { DEPTH_MIN_SHORT_SIDE, DEPTH_MODEL_ID, DEPTH_MODEL_REVISION, DEPTH_SIZE_MULTIPLE } from "../lib/tryon/constants";

env.allowLocalModels = false;

type Estimator = (input: CanvasImageSource) => Promise<{ depth: { data: ArrayLike<number>; width: number; height: number } }>;

type InMessage = {
  id: number;
  kind: "warmup" | "depth";
  width?: number;
  height?: number;
  buffer?: ArrayBuffer;
};

let estimatorPromise: Promise<Estimator> | null = null;

function multipleOf(value: number, unit: number): number {
  return Math.max(unit, Math.round(value / unit) * unit);
}

function modelSize(width: number, height: number): { width: number; height: number } {
  const short = Math.min(width, height);
  const scale = Math.max(1, DEPTH_MIN_SHORT_SIDE / short);
  let tw = multipleOf(width * scale, DEPTH_SIZE_MULTIPLE);
  let th = multipleOf(height * scale, DEPTH_SIZE_MULTIPLE);
  if (Math.min(tw, th) < DEPTH_MIN_SHORT_SIDE) {
    const bump = DEPTH_MIN_SHORT_SIDE / Math.min(tw, th);
    tw = multipleOf(Math.ceil(tw * bump), DEPTH_SIZE_MULTIPLE);
    th = multipleOf(Math.ceil(th * bump), DEPTH_SIZE_MULTIPLE);
  }
  return { width: tw, height: th };
}

async function loadEstimator(device: "webgpu" | "wasm"): Promise<Estimator> {
  const create = pipeline as unknown as (
    task: string,
    model: string,
    options: { revision: string; device: "webgpu" | "wasm" }
  ) => Promise<Estimator>;
  return create("depth-estimation", DEPTH_MODEL_ID, {
    revision: DEPTH_MODEL_REVISION,
    device,
  });
}

async function getEstimator(): Promise<Estimator> {
  if (!estimatorPromise) {
    estimatorPromise = loadEstimator("webgpu").catch(() => loadEstimator("wasm"));
  }
  return estimatorPromise;
}

function resizeDepth(source: Float32Array, sw: number, sh: number, dw: number, dh: number): Float32Array {
  const out = new Float32Array(dw * dh);
  for (let y = 0; y < dh; y++) {
    const sy = Math.min(sh - 1, Math.floor((y * sh) / dh));
    for (let x = 0; x < dw; x++) {
      const sx = Math.min(sw - 1, Math.floor((x * sw) / dw));
      out[y * dw + x] = source[sy * sw + sx];
    }
  }
  return out;
}

function normalize(values: Float32Array): Float32Array {
  const sorted = Float32Array.from(values).sort();
  const p2 = sorted[Math.floor(0.02 * (sorted.length - 1))] ?? 0;
  const p98 = sorted[Math.floor(0.98 * (sorted.length - 1))] ?? 1;
  const span = p98 - p2 || 1;
  const out = new Float32Array(values.length);
  for (let i = 0; i < values.length; i++) {
    out[i] = Math.min(1, Math.max(0, (values[i] - p2) / span));
  }
  return out;
}

self.onmessage = async (event: MessageEvent<InMessage>) => {
  const message = event.data;
  try {
    const estimator = await getEstimator();
    if (message.kind === "warmup") {
      self.postMessage({ id: message.id, ok: true, kind: "warmup" });
      return;
    }
    if (!message.buffer || !message.width || !message.height) {
      throw new Error("Missing depth crop");
    }
    const rgba = new Uint8ClampedArray(message.buffer);
    const size = modelSize(message.width, message.height);
    const canvas = new OffscreenCanvas(size.width, size.height);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not start depth processing");
    const source = new OffscreenCanvas(message.width, message.height);
    const sourceCtx = source.getContext("2d");
    if (!sourceCtx) throw new Error("Could not read the wrist crop");
    sourceCtx.putImageData(new ImageData(rgba, message.width, message.height), 0, 0);
    ctx.drawImage(source, 0, 0, size.width, size.height);

    const result = await estimator(canvas);
    const depth = result.depth;
    const raw = new Float32Array(depth.width * depth.height);
    for (let i = 0; i < raw.length; i++) raw[i] = Number(depth.data[i] ?? 0);
    const normalized = normalize(raw);
    const back = resizeDepth(normalized, depth.width, depth.height, message.width, message.height);
    self.postMessage(
      { id: message.id, ok: true, kind: "depth", width: message.width, height: message.height, buffer: back.buffer },
      [back.buffer]
    );
  } catch (err) {
    estimatorPromise = null;
    self.postMessage({
      id: message.id,
      ok: false,
      error: err instanceof Error ? err.message : "Depth failed",
    });
  }
};
