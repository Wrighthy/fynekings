import type { LoadedWatch, MaskBuffer, SnapshotMeasurements } from "./types";

/** Non-reactive snapshot pixels. Not written to storage or the network. */
export const snapshotSession: {
  snapshot: HTMLCanvasElement | null;
  mask: MaskBuffer | null;
  measurements: SnapshotMeasurements | null;
  watch: LoadedWatch | null;
  composite: HTMLCanvasElement | null;
} = {
  snapshot: null,
  mask: null,
  measurements: null,
  watch: null,
  composite: null,
};

export function releaseSnapshotSession(): void {
  snapshotSession.snapshot = null;
  snapshotSession.mask = null;
  snapshotSession.measurements = null;
  snapshotSession.watch = null;
  if (snapshotSession.composite) {
    snapshotSession.composite.width = 0;
    snapshotSession.composite.height = 0;
  }
  snapshotSession.composite = null;
}
