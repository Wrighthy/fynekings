"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { getHandLandmarker } from "../lib/mediapipe";
import { WATCH_OVERLAY_SIZE } from "../lib/tryOnStore";
import type { WristTransform } from "../lib/tryOnStore";
import type { HandLandmarker, NormalizedLandmark } from "@mediapipe/tasks-vision";

// ============ HELPERS ============

/** Exponential Moving Average */
function ema(previous: number, current: number, alpha: number): number {
  return previous + alpha * (current - previous);
}

/** Euclidean distance between two normalised landmarks */
function dist(a: NormalizedLandmark, b: NormalizedLandmark): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

/** Clamp a value between min and max */
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

// ============ TYPES ============

export type UseHandTrackingReturn = {
  isLoading: boolean;
  isTracking: boolean;
  fps: number;
  error: string | null;
  start: (video: HTMLVideoElement) => Promise<void>;
  stop: () => void;
};

type HandTrackingCallback = (transform: WristTransform) => void;

// ============ HOOK ============

export function useHandTracking(
  onResult: HandTrackingCallback,
  containerWidth: number,
  containerHeight: number,
  isFrontCamera: boolean,
  userScale: number
): UseHandTrackingReturn {
  const [isLoading, setIsLoading] = useState(true);
  const [isTracking, setIsTracking] = useState(false);
  const [fps, setFps] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const landmarkerRef = useRef<HandLandmarker | null>(null);
  const rafIdRef = useRef<number>(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Smoothed values
  const smoothRef = useRef({
    x: 0,
    y: 0,
    rotation: 0,
    scale: 1,
    lastSeenTime: 0,
    initialised: false,
  });

  // FPS calculation
  const fpsRef = useRef({
    lastFrameTime: performance.now(),
    buffer: [] as number[],
  });

  // Frame skip tracking
  const frameCountRef = useRef(0);
  const skipFramesRef = useRef(false);

  // Store latest props in refs so the rAF loop always sees current values
  const propsRef = useRef({ containerWidth, containerHeight, isFrontCamera, userScale });
  useEffect(() => {
    propsRef.current = { containerWidth, containerHeight, isFrontCamera, userScale };
  }, [containerWidth, containerHeight, isFrontCamera, userScale]);

  const onResultRef = useRef(onResult);
  useEffect(() => {
    onResultRef.current = onResult;
  }, [onResult]);

  // Detect if we should skip frames
  useEffect(() => {
    const isMobile = /Android|iPhone|iPad/i.test(navigator.userAgent);
    const isLowEnd = (navigator.hardwareConcurrency || 4) <= 4;
    skipFramesRef.current = isMobile || isLowEnd;
  }, []);

  const processFrame = useCallback(() => {
    const video = videoRef.current;
    const landmarker = landmarkerRef.current;
    if (!video || !landmarker || video.readyState < 2) {
      rafIdRef.current = requestAnimationFrame(processFrame);
      return;
    }

    frameCountRef.current++;

    // Skip every other frame on low-end devices
    if (skipFramesRef.current && frameCountRef.current % 2 !== 0) {
      rafIdRef.current = requestAnimationFrame(processFrame);
      return;
    }

    // FPS calculation
    const now = performance.now();
    const delta = now - fpsRef.current.lastFrameTime;
    fpsRef.current.lastFrameTime = now;
    if (delta > 0) {
      fpsRef.current.buffer.push(1000 / delta);
      if (fpsRef.current.buffer.length > 30) fpsRef.current.buffer.shift();
      const avgFps = Math.round(
        fpsRef.current.buffer.reduce((a, b) => a + b, 0) / fpsRef.current.buffer.length
      );
      setFps(avgFps);
    }

    // MediaPipe inference
    const results = landmarker.detectForVideo(video, now);
    const { containerWidth: cw, containerHeight: ch, isFrontCamera: front, userScale: uScale } = propsRef.current;
    const smooth = smoothRef.current;

    if (results.landmarks && results.landmarks.length > 0) {
      const landmarks = results.landmarks[0];
      const wrist: NormalizedLandmark = { ...landmarks[0] };
      const indexMCP: NormalizedLandmark = { ...landmarks[5] };
      const middleMCP: NormalizedLandmark = { ...landmarks[9] };
      const pinkyMCP: NormalizedLandmark = { ...landmarks[17] };

      // Mirror X if front camera
      if (front) {
        wrist.x = 1 - wrist.x;
        indexMCP.x = 1 - indexMCP.x;
        middleMCP.x = 1 - middleMCP.x;
        pinkyMCP.x = 1 - pinkyMCP.x;
      }

      // Direction from wrist toward fingers (arm axis)
      const dirX = middleMCP.x - wrist.x;
      const dirY = middleMCP.y - wrist.y;

      // Position (pixels) — offset AWAY from fingers, toward the forearm.
      // A larger multiplier pushes the watch further down the arm so it sits
      // where a real watch would be (below the wrist joint, not on top of it).
      const rawX = wrist.x * cw - dirX * cw * 0.35;
      const rawY = wrist.y * ch - dirY * ch * 0.35;

      // Rotation (degrees) — the watch image has straps at 12/6 o'clock,
      // so strap direction == arm axis. No perpendicular offset needed.
      const angle = Math.atan2(dirY, dirX);
      const rotationDeg = angle * (180 / Math.PI) + 180;

      // Scale — use cross-wrist width (index MCP ↔ pinky MCP) for a more
      // anatomically accurate size reference.
      const crossWristWidth = dist(indexMCP, pinkyMCP) * cw;
      const rawScale = (crossWristWidth / WATCH_OVERLAY_SIZE) * 1.6 * uScale;
      const scale = clamp(rawScale, 0.4, 2.5);

      // Apply EMA smoothing
      if (!smooth.initialised) {
        smooth.x = rawX;
        smooth.y = rawY;
        smooth.rotation = rotationDeg;
        smooth.scale = scale;
        smooth.initialised = true;
      } else {
        smooth.x = ema(smooth.x, rawX, 0.3);
        smooth.y = ema(smooth.y, rawY, 0.3);
        smooth.rotation = ema(smooth.rotation, rotationDeg, 0.2);
        smooth.scale = ema(smooth.scale, scale, 0.25);
      }

      smooth.lastSeenTime = now;

      onResultRef.current({
        x: smooth.x,
        y: smooth.y,
        rotation: smooth.rotation,
        scale: smooth.scale,
        visible: true,
      });
    } else {
      // Hand lost — hold position for 500ms then hide
      const elapsed = now - smooth.lastSeenTime;
      if (smooth.lastSeenTime > 0 && elapsed < 500) {
        onResultRef.current({
          x: smooth.x,
          y: smooth.y,
          rotation: smooth.rotation,
          scale: smooth.scale,
          visible: true,
        });
      } else {
        onResultRef.current({
          x: smooth.x,
          y: smooth.y,
          rotation: smooth.rotation,
          scale: smooth.scale,
          visible: false,
        });
      }
    }

    rafIdRef.current = requestAnimationFrame(processFrame);
  }, []);

  const start = useCallback(async (video: HTMLVideoElement) => {
    try {
      setIsLoading(true);
      setError(null);

      const landmarker = await getHandLandmarker();
      landmarkerRef.current = landmarker;
      videoRef.current = video;

      setIsLoading(false);
      setIsTracking(true);

      // Reset smoothing state
      smoothRef.current = {
        x: 0,
        y: 0,
        rotation: 0,
        scale: 1,
        lastSeenTime: 0,
        initialised: false,
      };

      // Start rAF loop
      rafIdRef.current = requestAnimationFrame(processFrame);
    } catch (err) {
      setIsLoading(false);
      setError(err instanceof Error ? err.message : "Failed to initialise hand tracking");
    }
  }, [processFrame]);

  const stop = useCallback(() => {
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = 0;
    }
    setIsTracking(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);

  return { isLoading, isTracking, fps, error, start, stop };
}
