import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { evaluateGates } from "./gates";
import { crownRotation, handTiltDeg, isBackFacing, placementOf, resolveHandedness } from "./geometry";
import { depthFlatness } from "./depthFlatness";
import { measureWrist } from "./measure";
import { HAND_BREADTH_MM, WATCH_LATERAL_OFFSET_MM, WATCH_OFFSET_MM } from "./constants";
import type { HandObservation, Vec3 } from "./types";

function worldFor(tiltDeg: number, handedness: "left" | "right", palm: boolean): Vec3[] {
  const rad = (tiltDeg * Math.PI) / 180;
  const mag = Math.hypot(Math.sin(rad), Math.cos(rad));
  const nx = Math.sin(rad) / mag;
  const nz = Math.cos(rad) / mag;
  const sign = handedness === "right" ? -1 : 1;
  const facing = palm ? -sign : sign;
  const normal = { x: nx * facing, y: 0, z: nz * facing };
  const points = Array.from({ length: 21 }, () => ({ x: 0, y: 0, z: 0 }));
  points[5] = { x: 0, y: 1, z: 0 };
  points[17] = { x: -normal.z, y: 0, z: normal.x };
  return points;
}

function hand(partial: Partial<HandObservation> & Pick<HandObservation, "handedness">): HandObservation {
  const landmarks = Array.from({ length: 21 }, () => ({ x: 0.5, y: 0.5 }));
  landmarks[0] = { x: 0.5, y: 0.55 };
  landmarks[5] = { x: 0.4, y: 0.4 };
  landmarks[9] = { x: 0.5, y: 0.38 };
  landmarks[13] = { x: 0.55, y: 0.4 };
  landmarks[17] = { x: 0.6, y: 0.4 };
  return {
    landmarks,
    worldLandmarks: worldFor(0, partial.handedness, false),
    poseWrist: { x: 0.5, y: 0.55 },
    poseElbow: { x: 0.78, y: 0.55 },
    poseIndex: { x: 0.42, y: 0.42 },
    posePinky: { x: 0.58, y: 0.42 },
    poseWristVisibility: 1,
    poseElbowVisibility: 1,
    poseIndexVisibility: 1,
    posePinkyVisibility: 1,
    poseWristWorld: { x: 0, y: 0, z: 0 },
    poseElbowWorld: { x: 1, y: 0, z: 0 },
    ...partial,
  };
}

describe("snapshot geometry", () => {
  it("keeps a flat back-of-hand pose and rejects a palm and a 30 degree tilt", () => {
    const width = 1000;
    const height = 1000;
    const right = hand({ handedness: "right" });
    const history = Array.from({ length: 8 }, () => right);
    const pass = evaluateGates([right], history, width, height, { luminance: 120, sharpness: 80 });
    assert.equal(pass.allPassed, true);
    assert.equal(pass.messageId, "perfect");
    assert.equal(pass.hand?.handedness, "right");

    const palm = hand({ handedness: "right", worldLandmarks: worldFor(0, "right", true) });
    assert.equal(isBackFacing(palm), false);

    const tilt45 = hand({ handedness: "right", worldLandmarks: worldFor(45, "right", false) });
    const tilted = evaluateGates([tilt45], history, width, height, { luminance: 120, sharpness: 80 });
    assert.equal(tilted.messageId, "flat");
    assert.ok((handTiltDeg(tilt45) ?? 0) > 35);

    const tilt15 = hand({ handedness: "left", worldLandmarks: worldFor(15, "left", false) });
    assert.equal(isBackFacing(tilt15), true);
    assert.ok((handTiltDeg(tilt15) ?? 99) <= 15.01);
    const left = evaluateGates(
      [tilt15],
      Array.from({ length: 8 }, () => tilt15),
      width,
      height,
      { luminance: 120, sharpness: 80 }
    );
    assert.equal(left.allPassed, true);
    assert.equal(left.hand?.handedness, "left");
  });

  it("tells the back of the wrist from the palm on the rear camera", () => {
    // Real right hand, fingers up, seen unmirrored by the rear camera.
    // Back of the hand: thumb side (index MCP) on the left of the picture.
    const pose = (indexX: number, pinkyX: number) => {
      const landmarks = Array.from({ length: 21 }, () => ({ x: 0.5, y: 0.5 }));
      landmarks[0] = { x: 0.5, y: 0.7 };
      landmarks[5] = { x: indexX, y: 0.4 };
      landmarks[17] = { x: pinkyX, y: 0.4 };
      const worldLandmarks = landmarks.map((p) => ({ x: p.x, y: p.y, z: 0 }));
      return { landmarks, worldLandmarks };
    };
    const back = pose(0.4, 0.6);
    const palm = pose(0.6, 0.4);

    assert.equal(isBackFacing(hand({ handedness: "right", ...back }), false), true);
    assert.equal(isBackFacing(hand({ handedness: "right", ...palm }), false), false);
    // A left hand is the mirror image: thumb on the right means its back.
    assert.equal(isBackFacing(hand({ handedness: "left", ...palm }), false), true);
    assert.equal(isBackFacing(hand({ handedness: "left", ...back }), false), false);

    // The same right-hand back, mirrored for a front camera, still passes.
    const mirroredBack = pose(0.6, 0.4);
    assert.equal(isBackFacing(hand({ handedness: "right", ...mirroredBack }), true), true);
  });

  it("names the hand from the mirrored bitmap", () => {
    assert.equal(resolveHandedness("left", true), "right");
    assert.equal(resolveHandedness("right", true), "left");
    assert.equal(resolveHandedness("left", false), "left");
  });

  it("scales from hand breadth and turns the crown upright", () => {
    const right = hand({ handedness: "right" });
    const place = placementOf(right, 1000, 1000);
    assert.ok(Math.abs(place.breadthPx - 200) < 1);
    assert.ok(Math.abs(place.pxPerMm - 200 / HAND_BREADTH_MM) < 1e-6);
    assert.ok(Math.abs(place.placement.x - (500 + (WATCH_OFFSET_MM + WATCH_LATERAL_OFFSET_MM.right) * place.pxPerMm)) < 1);

    const leftTurn = crownRotation("left", { x: -1, y: 0 });
    const rightTurn = crownRotation("right", { x: -1, y: 0 });
    assert.ok(Math.abs(Math.cos(leftTurn) + 1) < 1e-6);
    assert.ok(Math.abs(Math.cos(rightTurn) - 1) < 1e-6);
  });

  it("uses the mask width when the ratio is sane", () => {
    const sample = hand({ handedness: "right" });
    const place = placementOf(sample, 1000, 1000);
    const mask = new Uint8Array(1000 * 1000);
    const half = 70;
    for (let y = Math.round(place.placement.y - half); y <= place.placement.y + half; y++) {
      for (let x = 400; x < 800; x++) mask[y * 1000 + x] = 1;
    }
    const measured = measureWrist(sample, 1000, 1000, mask);
    assert.equal(measured.lowConfidence, false);
    assert.ok(measured.wristWidthPx > 100 && measured.wristWidthPx < 160);
    assert.ok(measured.wristWidthMm > 40 && measured.wristWidthMm < 70);
  });

  it("scores a flat depth crop as flat and a steep crop as not", () => {
    const flat = new Float32Array(80 * 80).fill(0.4);
    const flatScore = depthFlatness(
      { data: flat, width: 80, height: 80, originX: 470, originY: 510 },
      null,
      1000,
      { x: 510, y: 550 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
      40
    );
    assert.equal(flatScore?.flatEnough, true);

    const steep = new Float32Array(80 * 80);
    for (let y = 0; y < 80; y++) {
      for (let x = 0; x < 80; x++) steep[y * 80 + x] = x / 80;
    }
    const steepScore = depthFlatness(
      { data: steep, width: 80, height: 80, originX: 470, originY: 510 },
      null,
      1000,
      { x: 510, y: 550 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
      40
    );
    assert.equal(steepScore?.flatEnough, false);
  });
});
