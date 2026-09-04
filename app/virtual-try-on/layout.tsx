import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Virtual Try-On — FYNEKINGS INT LTD",
  description:
    "See any Fynekings timepiece on your wrist in real time. Powered by Google MediaPipe — no app needed.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#050505",
  // Lets the layout reach under notches so env(safe-area-inset-*) reports real
  // values for the control bar and HUD padding.
  viewportFit: "cover",
};

/**
 * The try-on route renders edge to edge with no site chrome. Nav, Footer and
 * Ticker live in the individual page files rather than the root layout, so this
 * layout only needs to pass children through — it exists to scope the metadata
 * and viewport above to this route.
 */
export default function TryOnLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
