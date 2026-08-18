"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Fires one beacon per page view. Client-side rather than counted during
 * render, because server-side counting also counts crawlers, prefetches and
 * the dashboard's own preview loads.
 */
export function ViewBeacon() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof navigator === "undefined") return;

    // Never record the dashboard's own traffic.
    if (pathname.startsWith("/admin")) return;

    const payload = JSON.stringify({ path: pathname, referrer: document.referrer });

    // sendBeacon survives the page being closed mid-request; fetch is the
    // fallback where it is unavailable.
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/track", new Blob([payload], { type: "application/json" }));
      return;
    }

    void fetch("/api/track", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: payload,
      keepalive: true,
    }).catch(() => {
      // A failed beacon must never surface to the reader.
    });
  }, [pathname]);

  return null;
}
