"use client";

import { create } from "zustand";
import {
  DEFAULT_ADJUSTMENTS,
  type ManualAdjustments,
  type SnapshotMeasurements,
  type TryOnPhase,
} from "./tryon/types";

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
  /** Optional snapshot-method metadata. Absent watches use the legacy sticker. */
  caseDiameterMm?: number;
  lugToLugMm?: number;
  strapWidthMm?: number;
  assetPxPerMm?: number;
  caseLayerUrl?: string;
  strapLayerUrl?: string | null;
  anchor?: { x: number; y: number };
};

type TryOnState = {
  selectedWatch: TryOnProduct | null;
  isCameraReady: boolean;
  isFrontCamera: boolean;
  cameraError: string | null;
  phase: TryOnPhase;
  measurements: SnapshotMeasurements | null;
  adjustments: ManualAdjustments;
  lowConfidence: boolean;
  snapshotSize: { width: number; height: number } | null;

  selectWatch: (watch: TryOnProduct) => void;
  setCameraReady: (ready: boolean) => void;
  setFrontCamera: (front: boolean) => void;
  toggleCamera: () => void;
  setCameraError: (message: string | null) => void;
  setPhase: (phase: TryOnPhase) => void;
  setMeasurements: (measurements: SnapshotMeasurements | null) => void;
  setAdjustments: (adjustments: ManualAdjustments) => void;
  setLowConfidence: (lowConfidence: boolean) => void;
  setSnapshotSize: (size: { width: number; height: number } | null) => void;
  reset: () => void;
};

const INITIAL_STATE = {
  selectedWatch: null as TryOnProduct | null,
  isCameraReady: false,
  isFrontCamera: false,
  cameraError: null as string | null,
  phase: "IDLE" as TryOnPhase,
  measurements: null as SnapshotMeasurements | null,
  adjustments: DEFAULT_ADJUSTMENTS,
  lowConfidence: false,
  snapshotSize: null as { width: number; height: number } | null,
};

export const useTryOnStore = create<TryOnState>((set) => ({
  ...INITIAL_STATE,

  selectWatch: (watch) => set({ selectedWatch: watch }),
  setCameraReady: (ready) =>
    set((s) => (s.isCameraReady === ready ? s : { isCameraReady: ready })),
  setFrontCamera: (front) =>
    set((s) => (s.isFrontCamera === front ? s : { isFrontCamera: front })),
  toggleCamera: () => set((s) => ({ isFrontCamera: !s.isFrontCamera })),
  setCameraError: (message) => set({ cameraError: message }),
  setPhase: (phase) => set((s) => (s.phase === phase ? s : { phase })),
  setMeasurements: (measurements) => set({ measurements }),
  setAdjustments: (adjustments) => set({ adjustments }),
  setLowConfidence: (lowConfidence) =>
    set((s) => (s.lowConfidence === lowConfidence ? s : { lowConfidence })),
  setSnapshotSize: (snapshotSize) => set({ snapshotSize }),
  reset: () => set({ ...INITIAL_STATE, adjustments: { ...DEFAULT_ADJUSTMENTS } }),
}));

