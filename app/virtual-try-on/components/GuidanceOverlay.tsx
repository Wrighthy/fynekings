"use client";

import { GUIDANCE, type GuidanceId } from "../lib/tryon/constants";

const ICONS: Record<string, string> = {
  noWrist: "M4 14c2-6 6-8 8-8s6 2 8 8",
  oneWrist: "M5 8h14M5 16h14",
  inFrame: "M4 8V4h4M16 4h4v4M20 16v4h-4M8 20H4v-4",
  backOfHand: "M12 4v10M8 10l4 4 4-4",
  flat: "M4 14h16",
  closer: "M12 5v14M5 12h14",
  farther: "M5 12h14",
  lighting: "M12 3v2M12 19v2M4 12H2M22 12h-2M6 6l1.5 1.5M16.5 16.5L18 18M18 6l-1.5 1.5M7.5 16.5L6 18",
  still: "M8 7h2v10H8zM14 7h2v10h-2z",
  perfect: "M5 12l4 4 10-8",
  flattenDepth: "M4 14h16",
};

type Props = {
  messageId: GuidanceId;
  ready: boolean;
  progress: number;
  hand: "left" | "right" | null;
  hint: boolean;
};

export default function GuidanceOverlay({ messageId, ready, progress, hand, hint }: Props) {
  const icon = ICONS[messageId] ?? ICONS.noWrist;
  const ring = 2 * Math.PI * 18;
  return (
    <div className="tryon-guide" aria-live="polite">
      <div className={`tryon-guide-banner ${ready ? "ready" : ""}`}>
        <svg className="tryon-guide-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d={icon} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
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
          {hand === "left" ? GUIDANCE.leftHand : GUIDANCE.rightHand}
        </p>
      )}
      {hint && <p className="tryon-guide-hint">{GUIDANCE.forearmHint}</p>}
      <svg className={`tryon-wrist-outline ${ready ? "ready" : ""}`} viewBox="0 0 200 280" aria-hidden="true">
        <path
          d="M70 250c-8-40-10-70-6-110 4-36 14-58 28-78 6-8 10-22 10-34 0-10 8-18 18-18h0c10 0 18 8 18 18 0 12 4 26 10 34 14 20 24 42 28 78 4 40 2 70-6 110"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
        <rect x="78" y="168" width="44" height="28" rx="8" fill="none" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    </div>
  );
}
