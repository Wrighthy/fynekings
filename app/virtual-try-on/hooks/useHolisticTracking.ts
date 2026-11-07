"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { paintDisplayFrame } from "../lib/tryon/camera";
import { measureQuality } from "../lib/tryon/quality";
import { OneEuroFilter } from "../lib/tryon/oneEuro";
import { observationsFromHolistic, type HolisticLike } from "../lib/tryon/observe";
import { getHolisticLandmarker } from "../lib/tryon/models";
import { isTrackingPaused } from "../lib/tryon/trackingPause";
import type { HandObservation, QualitySample, Vec2 } from "../lib/tryon/types";

export type TrackingFrame = {
  hands: HandObservation[];
  smoothed: HandObservation[];
  width: number;
  height: number;
  quality: QualitySample | null;
};

type Options = {
  mirrored: boolean;
  enabled: boolean;
};

function channel(bank: OneEuroFilter[], slot: number, value: number, t: number): number {
  const filter = bank[slot] ?? new OneEuroFilter();
  bank[slot] = filter;
  return filter.filter(value, t);
}

function smoothHand(hand: HandObservation, bank: OneEuroFilter[], t: number): HandObservation {
  let slot = 0;
  const landmarks = hand.landmarks.map((point) => ({
    x: channel(bank, slot++, point.x, t),
    y: channel(bank, slot++, point.y, t),
  }));
  const worldLandmarks = hand.worldLandmarks.map((point) => ({
    x: channel(bank, slot++, point.x, t),
    y: channel(bank, slot++, point.y, t),
    z: channel(bank, slot++, point.z, t),
  }));
  const pose = (point: Vec2 | null): Vec2 | null => {
    if (!point) {
      slot += 2;
      return null;
    }
    return {
      x: channel(bank, slot++, point.x, t),
      y: channel(bank, slot++, point.y, t),
    };
  };
  return {
    ...hand,
    landmarks,
    worldLandmarks,
    poseWrist: pose(hand.poseWrist),
    poseElbow: pose(hand.poseElbow),
    poseIndex: pose(hand.poseIndex),
    posePinky: pose(hand.posePinky),
  };
}

function sampleQuality(canvas: HTMLCanvasElement, hand: HandObservation): QualitySample | null {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  const points = [0, 5, 9, 13, 17].map((index) => hand.landmarks[index]);
  let minX = canvas.width;
  let minY = canvas.height;
  let maxX = 0;
  let maxY = 0;
  for (const point of points) {
    const x = point.x * canvas.width;
    const y = point.y * canvas.height;
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  }
  const x = Math.max(0, Math.floor(minX));
  const y = Math.max(0, Math.floor(minY));
  const width = Math.min(canvas.width - x, Math.ceil(maxX - minX));
  const height = Math.min(canvas.height - y, Math.ceil(maxY - minY));
  if (width < 3 || height < 3) return null;
  const pixels = ctx.getImageData(x, y, width, height);
  return measureQuality(pixels.data, width, height);
}

export function useHolisticTracking(onFrame: (frame: TrackingFrame) => void, options: Options) {
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const landmarkerRef = useRef<Awaited<ReturnType<typeof getHolisticLandmarker>> | null>(null);
  const rafRef = useRef(0);
  const bankRef = useRef<OneEuroFilter[]>([]);
  const onFrameRef = useRef(onFrame);
  const optionsRef = useRef(options);
  const lastInferRef = useRef(0);
  const skipRef = useRef(false);
  const qualityTick = useRef(0);

  useEffect(() => {
    onFrameRef.current = onFrame;
  }, [onFrame]);

  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  const loop = useCallback(() => {
    rafRef.current = requestAnimationFrame(loop);
    if (!optionsRef.current.enabled || isTrackingPaused()) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2) return;
    if (lastInferRef.current > 66 && skipRef.current) {
      skipRef.current = false;
      return;
    }

    const started = performance.now();
    if (!paintDisplayFrame(video, canvas, optionsRef.current.mirrored)) return;

    const landmarker = landmarkerRef.current;
    if (!landmarker) return;
    let hands: HandObservation[] = [];
    try {
      const result = landmarker.detectForVideo(canvas, started);
      hands = observationsFromHolistic(result as HolisticLike, optionsRef.current.mirrored);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wrist tracking stopped");
      return;
    }
    const smoothed = hands.length === 1 ? [smoothHand(hands[0], bankRef.current, started / 1000)] : hands;
    qualityTick.current += 1;
    const quality =
      smoothed.length === 1 && qualityTick.current % 4 === 0
        ? sampleQuality(canvas, smoothed[0])
        : null;
    lastInferRef.current = performance.now() - started;
    if (lastInferRef.current > 66) skipRef.current = true;
    onFrameRef.current({
      hands,
      smoothed,
      width: canvas.width,
      height: canvas.height,
      quality,
    });
  }, []);

  const start = useCallback(async (video: HTMLVideoElement) => {
    const landmarker = await getHolisticLandmarker();
    landmarkerRef.current = landmarker;
    videoRef.current = video;
    if (!canvasRef.current) canvasRef.current = document.createElement("canvas");
    bankRef.current = [];
    setError(null);
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(loop);
  }, [loop]);

  const stop = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    rafRef.current = 0;
    videoRef.current = null;
  }, []);

  const grabFrame = useCallback((): HTMLCanvasElement | null => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return null;
    if (!paintDisplayFrame(video, canvas, optionsRef.current.mirrored)) return null;
    const copy = document.createElement("canvas");
    copy.width = canvas.width;
    copy.height = canvas.height;
    copy.getContext("2d")?.drawImage(canvas, 0, 0);
    return copy;
  }, []);

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  return { start, stop, grabFrame, error, setError };
}
