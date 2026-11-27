import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { evaluateGates } from "./gates";
import { crownRotation, facingFromCurl, handTiltDeg, isBackFacing, placementOf, resolveHandedness } from "./geometry";
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
  it("keeps a flat or tilted back-of-hand pose and rejects a palm", () => {
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
    // Tilt no longer blocks a capture.
    assert.equal(tilted.allPassed, true);
    assert.ok((handTiltDeg(tilt45) ?? 0) > 35);

    const palmUp = hand({ handedness: "right", worldLandmarks: worldFor(0, "right", true) });
    const rejected = evaluateGates([palmUp], history, width, height, { luminance: 120, sharpness: 80 });
    assert.equal(rejected.messageId, "backOfHand");

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

  it("rejects the other hand's palm even though its outline matches the chosen wrist's back", () => {
    const width = 1000;
    const height = 1000;
    // Same outline as a passing right-hand back; only the finger depth differs.
    const withCurl = (fingerZ: number) => {
      const world = worldFor(0, "right", false);
      world[9] = { x: 0, y: 1, z: 0 };
      for (const i of [6, 7, 8, 10, 11, 12, 14, 15, 16, 18, 19, 20]) {
        world[i] = { x: 0.5, y: 1.3, z: fingerZ };
      }
      return hand({ handedness: "right", worldLandmarks: world });
    };
    // Fingers bend away from the camera: back of the hand.
    const back = withCurl(0.2);
    assert.equal(facingFromCurl(back), "back");
    const ok = evaluateGates([back], Array.from({ length: 8 }, () => back), width, height, { luminance: 120, sharpness: 80 });
    assert.equal(ok.allPassed, true);

    // Fingers bend toward the camera: a palm (the left hand, mislabelled as right).
    const palm = withCurl(-0.2);
    assert.equal(facingFromCurl(palm), "palm");
    const bad = evaluateGates([palm], Array.from({ length: 8 }, () => palm), width, height, { luminance: 120, sharpness: 80 });
    assert.equal(bad.allPassed, false);
    assert.equal(bad.messageId, "backOfHand");

    // A flat hand gives no curl cue and falls back to the outline test.
    assert.equal(facingFromCurl(withCurl(0)), null);
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

  it("passes an upright arm whose wrist sits near the bottom of the frame", () => {
    // Fingers up, forearm running down out of the picture (portrait phone).
    const width = 720;
    const height = 1280;
    const landmarks = Array.from({ length: 21 }, () => ({ x: 0.5, y: 0.7 }));
    landmarks[0] = { x: 0.5, y: 0.9 };
    landmarks[5] = { x: 0.38, y: 0.72 };
    landmarks[9] = { x: 0.5, y: 0.7 };
    landmarks[13] = { x: 0.56, y: 0.71 };
    landmarks[17] = { x: 0.62, y: 0.72 };
    const upright = hand({
      handedness: "right",
      landmarks,
      poseWrist: null,
      poseElbow: null,
      poseElbowVisibility: 0,
      poseWristWorld: null,
      poseElbowWorld: null,
    });
    const place = placementOf(upright, width, height);
    assert.ok(place.placement.y > place.wrist.y, "watch sits on the forearm side of the wrist");
    assert.ok(place.placement.y <= height * 0.95, "watch stays inside the frame");
    const result = evaluateGates(
      [upright],
      Array.from({ length: 8 }, () => upright),
      width,
      height,
      { luminance: 120, sharpness: 80 }
    );
    assert.equal(result.gates.find((g) => g.id === "G2")?.passed, true);
  });

  it("captures an upright, edge-on hand without tilting it", () => {
    const width = 1000;
    const height = 1000;
    // Thumb toward the camera: the knuckle line is almost a point on screen.
    const landmarks = Array.from({ length: 21 }, () => ({ x: 0.5, y: 0.45 }));
    landmarks[0] = { x: 0.5, y: 0.6 };
    landmarks[5] = { x: 0.48, y: 0.42 };
    landmarks[9] = { x: 0.5, y: 0.4 };
    landmarks[13] = { x: 0.51, y: 0.41 };
    landmarks[17] = { x: 0.52, y: 0.42 };
    const world = worldFor(88, "right", false);
    world[9] = { x: 0, y: 1.6, z: 0 };
    const edgeOn = hand({
      handedness: "right",
      landmarks,
      worldLandmarks: world,
      poseWrist: null,
      poseElbow: null,
      poseElbowVisibility: 0,
      poseWristWorld: null,
      poseElbowWorld: null,
    });
    assert.ok((handTiltDeg(edgeOn) ?? 0) > 80);
    const result = evaluateGates(
      [edgeOn],
      Array.from({ length: 8 }, () => edgeOn),
      width,
      height,
      { luminance: 120, sharpness: 80 }
    );
    assert.equal(result.messageId, "perfect");
    assert.equal(result.allPassed, true);
    // Breadth is rebuilt from the hand length, so the watch is not shrunk.
    const place = placementOf(edgeOn, width, height);
    assert.ok(place.breadthPx > 150);
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
