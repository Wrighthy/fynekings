"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    let sessionId = sessionStorage.getItem("fynekings-analytics-session");
    if (!sessionId) {
      sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      sessionStorage.setItem("fynekings-analytics-session", sessionId);
    }

    try {
      fetch("/api/analytics/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventName: "page_view",
          pageUrl: pathname,
          referrer: document.referrer || null,
          sessionId,
        }),
      });
    } catch {
      // Non-blocking
    }
  }, [pathname]);

  return null;
}
