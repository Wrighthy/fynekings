import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FYNEKINGS INT LTD — Timepieces Redefined",
  description: "Handcrafted timepieces for the African collector. Precision at every second.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}