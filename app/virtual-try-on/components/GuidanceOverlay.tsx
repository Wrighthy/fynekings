"use client";

import { GUIDANCE, type GuidanceId } from "../lib/tryon/constants";


// Right hand icon (dorsal view, thumb on left)
const RIGHT_HAND_ICON =
  "M18 11V6a2 2 0 0 0-2-2 2 2 0 0 0-2 2v0 M14 10V4a2 2 0 0 0-2-2 2 2 0 0 0-2 2v2 M10 10.5V6a2 2 0 0 0-2-2 2 2 0 0 0-2 2v8 M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15";

// Left hand icon (dorsal view, thumb on right)
const LEFT_HAND_ICON =
  "M6 11V6a2 2 0 0 1 2-2 2 2 0 0 1 2 2v0 M10 10V4a2 2 0 0 1 2-2 2 2 0 0 1 2 2v2 M14 10.5V6a2 2 0 0 1 2-2 2 2 0 0 1 2 2v8 M6 8a2 2 0 1 0-4 0v6a8 8 0 0 0 8 8h2c2.8 0 4.5-.86 5.99-2.34l3.6-3.6a2 2 0 0 0-2.83-2.82L17 15";

type Props = {
  messageId: GuidanceId;
  ready: boolean;
  progress: number;
  hand: "left" | "right" | null;
  hint: boolean;
};

export default function GuidanceOverlay({ messageId, ready, progress, hand, hint }: Props) {
  // Select hand icon based directly on the detected hand
  const handIcon = hand === "left" ? LEFT_HAND_ICON : RIGHT_HAND_ICON;
  // Banner icon shows checkmark when ready/perfect, otherwise the active hand icon
  const bannerIcon = ready || messageId === "perfect" ? "M5 12l4 4 10-8" : handIcon;
  const ring = 2 * Math.PI * 18;

  return (
    <div className="tryon-guide" aria-live="polite">
      <div className={`tryon-guide-banner ${ready ? "ready" : ""}`}>
        <svg className="tryon-guide-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d={bannerIcon} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
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
        <p className="tryon-guide-chip" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
          <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden="true">
            <path d={handIcon} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <span>{hand === "left" ? GUIDANCE.leftHand : GUIDANCE.rightHand}</span>
        </p>
      )}
      {hint && <p className="tryon-guide-hint">{GUIDANCE.forearmHint}</p>}
      <svg className={`tryon-wrist-outline ${ready ? "ready" : ""}`} viewBox="0 0 200 280" aria-hidden="true">
        <g transform={hand === "left" ? "translate(200, 0) scale(-1, 1)" : undefined}>
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
      </svg>
    </div>
  );
}
