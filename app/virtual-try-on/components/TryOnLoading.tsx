"use client";

type TryOnLoadingProps = {
  statusText?: string;
  /** Secondary line — the raw MediaPipe progress message. */
  detailText?: string;
  /** Plays the fade-out transition before the screen is unmounted. */
  isFadingOut?: boolean;
};

export default function TryOnLoading({
  statusText = "Loading AR engine...",
  detailText,
  isFadingOut = false,
}: TryOnLoadingProps) {
  return (
    <div
      className={`tryon-loading ${isFadingOut ? "fading" : ""}`}
      role="status"
      aria-live="polite"
    >
      <div className="tryon-loading-brand">Fynekings</div>
      <div className="tryon-loading-ring" />
      <div className="tryon-loading-status">{statusText}</div>
      {detailText && <div className="tryon-loading-detail">{detailText}</div>}
      <div className="tryon-loading-sub">Virtual Try-On</div>
    </div>
  );
}
