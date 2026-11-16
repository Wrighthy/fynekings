let paused = false;

export function setTrackingPaused(value: boolean): void {
  paused = value;
}

export function isTrackingPaused(): boolean {
  return paused;
}
