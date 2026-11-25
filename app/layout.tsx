import type { Metadata } from "next";
import "./globals.css";
import CustomCursor from "@/components/ui/CustomCursor";
import CookieConsent from "@/components/ui/CookieConsent";
import CollectorInvite from "@/components/ui/CollectorInvite";
import AuthModal from "@/components/ui/AuthModal";
import AnalyticsTracker from "@/components/ui/AnalyticsTracker";
import Toast from "@/components/ui/Toast";

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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Raleway:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AnalyticsTracker />
        <CustomCursor />
        {children}
        <CookieConsent />
        <CollectorInvite />
        <AuthModal />
        <Toast />
      </body>
    </html>
  );
}