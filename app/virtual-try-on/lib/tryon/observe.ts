import { POSE } from "./constants";
import { resolveHandedness } from "./geometry";
import type { Handedness, HandObservation, Vec2, Vec3 } from "./types";

export type RawLandmark = {
  x: number;
  y: number;
  z?: number;
  visibility?: number;
};

export type HolisticLike = {
  leftHandLandmarks: RawLandmark[][];
  rightHandLandmarks: RawLandmark[][];
  leftHandWorldLandmarks: RawLandmark[][];
  rightHandWorldLandmarks: RawLandmark[][];
  poseLandmarks: RawLandmark[][];
  poseWorldLandmarks: RawLandmark[][];
};

function to2(point: RawLandmark): Vec2 {
  return { x: point.x, y: point.y };
}

function to3(point: RawLandmark): Vec3 {
  return { x: point.x, y: point.y, z: point.z ?? 0 };
}

function readPose(pose: RawLandmark[] | undefined, index: number): { point: Vec2; visibility: number } | null {
  const landmark = pose?.[index];
  if (!landmark) return null;
  return { point: to2(landmark), visibility: landmark.visibility ?? 0 };
}

function readWorld(pose: RawLandmark[] | undefined, index: number): Vec3 | null {
  const landmark = pose?.[index];
  return landmark ? to3(landmark) : null;
}

function oneSide(
  mediaPipeSide: Handedness,
  landmarks: RawLandmark[] | undefined,
  world: RawLandmark[] | undefined,
  pose: RawLandmark[] | undefined,
  poseWorld: RawLandmark[] | undefined,
  mirrored: boolean
): HandObservation | null {
  if (!landmarks || landmarks.length < 21 || !world || world.length < 21) return null;
  const elbowIndex = mediaPipeSide === "left" ? POSE.leftElbow : POSE.rightElbow;
  const wristIndex = mediaPipeSide === "left" ? POSE.leftWrist : POSE.rightWrist;
  const indexIndex = mediaPipeSide === "left" ? POSE.leftIndex : POSE.rightIndex;
  const pinkyIndex = mediaPipeSide === "left" ? POSE.leftPinky : POSE.rightPinky;
  const elbow = readPose(pose, elbowIndex);
  const wrist = readPose(pose, wristIndex);
  const index = readPose(pose, indexIndex);
  const pinky = readPose(pose, pinkyIndex);
  return {
    handedness: resolveHandedness(mediaPipeSide, mirrored),
    landmarks: landmarks.slice(0, 21).map(to2),
    worldLandmarks: world.slice(0, 21).map(to3),
    poseWrist: wrist?.point ?? null,
    poseElbow: elbow?.point ?? null,
    poseIndex: index?.point ?? null,
    posePinky: pinky?.point ?? null,
    poseWristVisibility: wrist?.visibility ?? 0,
    poseElbowVisibility: elbow?.visibility ?? 0,
    poseIndexVisibility: index?.visibility ?? 0,
    posePinkyVisibility: pinky?.visibility ?? 0,
    poseWristWorld: readWorld(poseWorld, wristIndex),
    poseElbowWorld: readWorld(poseWorld, elbowIndex),
  };
}

export function observationsFromHolistic(result: HolisticLike, mirrored: boolean): HandObservation[] {
  const pose = result.poseLandmarks[0];
  const poseWorld = result.poseWorldLandmarks[0];
  const hands = [
    oneSide(
      "left",
      result.leftHandLandmarks[0],
      result.leftHandWorldLandmarks[0],
      pose,
      poseWorld,
      mirrored
    ),
    oneSide(
      "right",
      result.rightHandLandmarks[0],
      result.rightHandWorldLandmarks[0],
      pose,
      poseWorld,
      mirrored
    ),
  ];
  return hands.filter((hand): hand is HandObservation => hand !== null);
}
