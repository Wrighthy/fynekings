import type { Metadata } from "next";
import "./globals.css";
import CustomCursor from "@/components/ui/CustomCursor";
import CookieConsent from "@/components/ui/CookieConsent";
import AuthModal from "@/components/ui/AuthModal";

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
      <body>
        <CustomCursor />
        {children}
        <CookieConsent />
        <AuthModal />
      </body>
    </html>
  );
}