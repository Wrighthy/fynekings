"use client";

import { create } from "zustand";

/**
 * Rendered size of the watch overlay in CSS pixels, before the tracked scale is
 * applied. Must match `baseWatchSize` in useHandTracking so a scale of 1.0
 * means "life size", and is reused by the screenshot compositor.
 */
export const WATCH_OVERLAY_SIZE = 140;

// ============ TYPES ============

/** Tracking status of the hand detection pipeline */
export type TrackingStatus = "initializing" | "searching" | "locked" | "lost";

/** Minimal product data needed for try-on rendering */
export type TryOnProduct = {
  id: string;
  name: string;
  slug: string;
  series: string;
  price: number;
  overlayUrl: string;
  thumbnailUrl: string | null;
  productId: string | null;
};

/** Computed wrist transform applied to the watch overlay each frame */
export type WristTransform = {
  x: number;        // pixels from left
  y: number;        // pixels from top
  rotation: number; // degrees
  scale: number;    // multiplier
  visible: boolean; // whether to show the overlay
};

// ============ PER-FRAME DATA (NON-REACTIVE) ============

/** Live data written on every animation frame by TryOnExperience */
type LiveFrame = {
  video: HTMLVideoElement | null;
  transform: WristTransform;
  fps: number;
  containerWidth: number;
  containerHeight: number;
};

/**
 * Per-frame values live here rather than in the Zustand store on purpose.
 *
 * The wrist transform and FPS change ~30x per second. Routing them through
 * reactive state would re-render the controls bar (and every watch thumbnail
 * SVG inside it) on every frame. Consumers instead read this on demand — the
 * screenshot compositor reads it once per capture, the HUD polls the FPS on a
 * slow interval.
 */
export const liveFrame: LiveFrame = {
  video: null,
  transform: { x: 0, y: 0, rotation: 0, scale: 1, visible: false },
  fps: 0,
  containerWidth: 0,
  containerHeight: 0,
};

/** Restore `liveFrame` to its initial values. Call alongside `reset()`. */
export function resetLiveFrame(): void {
  liveFrame.video = null;
  liveFrame.transform = { x: 0, y: 0, rotation: 0, scale: 1, visible: false };
  liveFrame.fps = 0;
  liveFrame.containerWidth = 0;
  liveFrame.containerHeight = 0;
}

// ============ STORE ============

type TryOnState = {
  // State
  selectedWatch: TryOnProduct | null;
  watchScale: number;               // 0.6 – 1.4, default 1.0
  trackingStatus: TrackingStatus;
  isCameraReady: boolean;
  isFrontCamera: boolean;
  showDebug: boolean;
  screenshotData: string | null;
  cameraError: string | null;

  // Actions
  selectWatch: (watch: TryOnProduct) => void;
  setWatchScale: (scale: number) => void;
  setTrackingStatus: (status: TrackingStatus) => void;
  setCameraReady: (ready: boolean) => void;
  setFrontCamera: (front: boolean) => void;
  toggleCamera: () => void;
  toggleDebug: () => void;
  takeScreenshot: (dataUrl: string) => void;
  clearScreenshot: () => void;
  setCameraError: (message: string | null) => void;
  reset: () => void;
};

const INITIAL_STATE = {
  selectedWatch: null as TryOnProduct | null,
  watchScale: 1.0,
  trackingStatus: "initializing" as TrackingStatus,
  isCameraReady: false,
  isFrontCamera: false,
  showDebug: false,
  screenshotData: null as string | null,
  cameraError: null as string | null,
};

export const useTryOnStore = create<TryOnState>((set) => ({
  ...INITIAL_STATE,

  selectWatch: (watch) => set({ selectedWatch: watch }),
  setWatchScale: (scale) =>
    set({ watchScale: Math.max(0.6, Math.min(1.4, scale)) }),

  // The tracking loop calls this every frame. Returning the identical state
  // object when nothing changed makes Zustand skip the notification entirely,
  // so subscribers only re-render on real status transitions.
  setTrackingStatus: (status) =>
    set((s) => (s.trackingStatus === status ? s : { trackingStatus: status })),
  setCameraReady: (ready) =>
    set((s) => (s.isCameraReady === ready ? s : { isCameraReady: ready })),

  setFrontCamera: (front) =>
    set((s) => (s.isFrontCamera === front ? s : { isFrontCamera: front })),
  toggleCamera: () => set((s) => ({ isFrontCamera: !s.isFrontCamera })),
  toggleDebug: () => set((s) => ({ showDebug: !s.showDebug })),
  takeScreenshot: (dataUrl) => set({ screenshotData: dataUrl }),
  clearScreenshot: () => set({ screenshotData: null }),
  setCameraError: (message) => set({ cameraError: message }),
  reset: () => set(INITIAL_STATE),
}));

