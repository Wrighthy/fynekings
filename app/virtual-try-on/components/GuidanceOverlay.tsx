"use client";

import { GUIDANCE, type GuidanceId } from "../lib/tryon/constants";
import { LEFT_HAND_ICON, RIGHT_HAND_ICON } from "./handIcons";

/**
 * Tilt of the on-screen hand guide, in degrees. The hand lies close to
 * horizontal, about 20° above it (fingers pointing across the screen, wrist
 * toward the lower side), which is how a forearm naturally sits in front of a
 * phone with the back of the wrist toward the camera. The left hand is a
 * mirror image, so it points the other way.
 */
const GUIDE_TILT_DEG = -70;

type Props = {
  messageId: GuidanceId;
  ready: boolean;
  progress: number;
  /** Hand detected in the current frame, if any. */
  hand: "left" | "right" | null;
  /** Wrist the user selected; drives the guide before a hand is detected. */
  wrist: "left" | "right";
  hint: boolean;
};

export default function GuidanceOverlay({ messageId, ready, progress, hand, wrist, hint }: Props) {
  const side = hand ?? wrist;
  const handIcon = side === "left" ? LEFT_HAND_ICON : RIGHT_HAND_ICON;
  const showCheck = ready || messageId === "perfect";
  const ring = 2 * Math.PI * 18;
  // Same lean as the outline: mirrored for the left hand.
  const iconTilt = side === "left" ? -GUIDE_TILT_DEG : GUIDE_TILT_DEG;

  return (
    <div className="tryon-guide" aria-live="polite">
      <div className={`tryon-guide-banner ${ready ? "ready" : ""}`}>
        <svg className="tryon-guide-icon" viewBox="0 0 24 24" aria-hidden="true">
          {showCheck ? (
            <path d="M5 12l4 4 10-8" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          ) : (
            <g transform={`rotate(${iconTilt} 12 12)`}>
              <path d={handIcon} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </g>
          )}
        </svg>
        <p>{GUIDANCE[messageId]}</p>
        {ready && (
          <svg className="tryon-guide-ring" viewBox="0 0 44 44" aria-hidden="true">
            <circle cx="22" cy="22" r="18" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.25" />
            <circle
              cx="22"
              cy="22"
              r="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray={`${ring}`}
              strokeDashoffset={`${ring * (1 - progress)}`}
              transform="rotate(-90 22 22)"
            />
          </svg>
        )}
      </div>
      {hand && (
        <p className="tryon-guide-chip">
          <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden="true">
            <path d={handIcon} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <span>{hand === "left" ? GUIDANCE.leftHand : GUIDANCE.rightHand}</span>
        </p>
      )}
      {hint && <p className="tryon-guide-hint">{GUIDANCE.forearmHint}</p>}
      {/* Wide box: the tilted hand spans roughly x -32..240, y 43..250. Centred on
          x = 100 so the left-hand mirror (about x = 100) stays inside it. */}
      <svg className={`tryon-wrist-outline ${ready ? "ready" : ""}`} viewBox="-50 35 300 225" aria-hidden="true">
        <g transform={side === "left" ? "translate(200, 0) scale(-1, 1)" : undefined}>
          <g transform={`rotate(${GUIDE_TILT_DEG} 100 150)`}>
            {/* Hand and wrist guide outline */}
            <path
              d="M72 265 C72 230 68 210 62 190 C52 165 36 155 36 135 C36 120 48 114 58 128 C68 142 72 158 75 164 C74 130 74 62 74 48 C74 38 86 38 86 48 C86 70 86 120 86 138 C88 110 93 42 98 32 C103 22 114 24 114 34 C114 60 112 115 112 138 C114 115 120 52 126 44 C132 36 142 40 140 52 C137 75 136 125 136 148 C140 128 148 85 156 78 C164 70 172 78 168 90 C162 112 154 165 148 185 C142 210 138 230 138 265"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            {/* Target watch position zone on wrist */}
            <rect x="74" y="202" width="52" height="34" rx="8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.8" />
            <circle cx="100" cy="219" r="14" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.6" />
          </g>
        </g>
      </svg>
    </div>
  );
}
