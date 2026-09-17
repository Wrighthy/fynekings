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

      // Determine which hand we're looking at.
      // MediaPipe reports handedness from the camera's perspective. With a
      // front-facing camera the image is mirrored, so the label is inverted
      // relative to the user's actual hand.
      let isLeftHand = false;
      if (results.handednesses && results.handednesses.length > 0) {
        const label = results.handednesses[0][0]?.categoryName ?? "Right";
        // MediaPipe label is from camera POV. Front camera flips it.
        isLeftHand = front
          ? label === "Right"   // camera sees "Right" → user's left
          : label === "Left";   // rear camera is un-mirrored
      }

      // Detect whether the BACK of the hand faces the camera using the
      // 2D cross product of wrist→indexMCP × wrist→pinkyMCP. The sign
      // of the z-component flips when the hand rotates from palm to back.
      // We use the RAW landmarks (before mirroring) so the geometric
      // relationship is consistent regardless of camera facing mode.
      const v1x = landmarks[5].x - landmarks[0].x;
      const v1y = landmarks[5].y - landmarks[0].y;
      const v2x = landmarks[17].x - landmarks[0].x;
      const v2y = landmarks[17].y - landmarks[0].y;
      const crossZ = v1x * v2y - v1y * v2x;

      // Raw MediaPipe label (camera POV, before our front-camera swap).
      const rawLabel =
        results.handednesses?.[0]?.[0]?.categoryName ?? "Right";
      // "Right" hand (camera POV): back faces camera when crossZ > 0.
      // "Left"  hand (camera POV): back faces camera when crossZ < 0.
      // A small dead-zone (0.002) avoids flicker when the hand is edge-on.
      //
      // With the rear camera the image is NOT mirrored, so the cross-product
      // sign for "back of hand" is the opposite of the front camera.
      const isBackOfHandRaw = rawLabel === "Right"
        ? crossZ > 0.002
        : crossZ < -0.002;
      const isBackOfHand = front ? isBackOfHandRaw : !isBackOfHandRaw;

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
      const rawX = wrist.x * cw - dirX * cw * 0.50 - 0.11;
      const rawY = wrist.y * ch - dirY * ch * 0.50;

      // Rotation (degrees) — the watch image has straps at 12/6 o'clock,
      // so strap direction == arm axis.
      // For the RIGHT hand the wrist→fingers vector points away from the
      // body, so we add 180° to flip the watch dial toward the wearer.
      // For the LEFT hand the geometry is mirrored and no offset is needed.
      //
      // IMPORTANT: with the rear camera (mobile) the hand is viewed from the
      // opposite side, so the offset that applies to the left hand on the
      // front camera applies to the right hand on the rear camera, and vice
      // versa.
      const angle = Math.atan2(dirY, dirX);
      const rotationOffset = front
        ? (isLeftHand ? 180 : 0)   // front camera
        : (isLeftHand ? 0 : 180);  // rear camera — inverted
      const rotationDeg = angle * (180 / Math.PI) + rotationOffset;

      // OLD CALCULATION (index MCP ↔ pinky MCP):
      // -----------------------------------------
      // const coverScale = Math.max(cw / video.videoWidth, ch / video.videoHeight);
      // const dxPx = (indexMCP.x - pinkyMCP.x) * video.videoWidth * coverScale;
      // const dyPx = (indexMCP.y - pinkyMCP.y) * video.videoHeight * coverScale;
      // const crossWristWidth = Math.sqrt(dxPx * dxPx + dyPx * dyPx);
      // -----------------------------------------

      // Scale — derive wrist width from landmarks 0 (wrist), 1 (thumb CMC),
      // and 17 (pinky MCP) using trigonometry.
      //
      // The distance from landmark 0 to a reference landmark is the
      // hypotenuse of a right-angled triangle. The angle θ is measured
      // between that vector and the arm axis (wrist→middleMCP). The
      // component perpendicular to the arm axis (hypotenuse × sin θ)
      // gives half the wrist width.
      //
      // For the RIGHT hand, the thumb CMC (landmark 1) projects well
      // laterally. For the LEFT hand, it collapses onto the arm axis in
      // 2D, so we also compute the projection from pinky MCP (landmark 17)
      // and take whichever is larger. Same trigonometry, automatically
      // robust for both hands.
      //
      // Convert normalised coords to TRUE on-screen pixels via the same
      // cover-scale the CSS `object-fit: cover` applies.
      const coverScale = Math.max(cw / video.videoWidth, ch / video.videoHeight);

      // Arm axis angle (wrist → middle MCP) — used as the reference direction
      const armAngle = Math.atan2(
        (middleMCP.y - wrist.y) * video.videoHeight * coverScale,
        (middleMCP.x - wrist.x) * video.videoWidth * coverScale
      );

      // --- Landmark 1 (thumb CMC) ---
      const thumbCMC: NormalizedLandmark = { ...landmarks[1] };
      if (front) {
        thumbCMC.x = 1 - thumbCMC.x;
      }
      const hypDx1 = (thumbCMC.x - wrist.x) * video.videoWidth * coverScale;
      const hypDy1 = (thumbCMC.y - wrist.y) * video.videoHeight * coverScale;
      const hypotenuse1 = Math.sqrt(hypDx1 * hypDx1 + hypDy1 * hypDy1);
      const theta1 = Math.atan2(hypDy1, hypDx1) - armAngle;
      const halfWidth1 = Math.abs(hypotenuse1 * Math.sin(theta1));

      // --- Landmark 17 (pinky MCP) ---
      const hypDx17 = (pinkyMCP.x - wrist.x) * video.videoWidth * coverScale;
      const hypDy17 = (pinkyMCP.y - wrist.y) * video.videoHeight * coverScale;
      const hypotenuse17 = Math.sqrt(hypDx17 * hypDx17 + hypDy17 * hypDy17);
      const theta17 = Math.atan2(hypDy17, hypDx17) - armAngle;
      const halfWidth17 = Math.abs(hypotenuse17 * Math.sin(theta17));

      // Use whichever landmark projects more laterally from the arm axis
      const halfWristWidth = Math.max(halfWidth1, halfWidth17);
      const crossWristWidth = (2 * halfWristWidth) / 1.09;

      // Dampened scaling — a pure linear ratio makes the watch balloon when
      // the hand is close to the camera.  We use a sqrt curve above a
      // reference width to compress the growth at close range while keeping
      // far-range (small widths) essentially linear.
      //
      //   referenceWidth ≈ the cross-wrist pixel width at a "normal" viewing
      //   distance.  Below it the ratio grows linearly; above it, growth is
      //   progressively softened via sqrt.
      const referenceWidth = 100;
      const ratio = crossWristWidth / referenceWidth;
      const dampedRatio = ratio <= 1
        ? ratio                                // linear at normal/far range
        : 1 + Math.sqrt(ratio - 1);            // sqrt compression at close range
      const rawScale = (dampedRatio * referenceWidth / WATCH_OVERLAY_SIZE) * 1.35 * uScale;
      const scale = clamp(rawScale, 0.4, 2.0);

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
        visible: isBackOfHand,
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
