"use client";

import { useEffect } from "react";
import { useLocale } from "next-intl";
import { usePathname, useSearchParams } from "next/navigation";
import { getOrCreateSessionId, trackEvent } from "@/lib/analytics-client";

/**
 * Mounted once in the locale layout. Fires exactly one page_view per
 * navigation (module-level dedupe in trackEvent absorbs React re-renders /
 * StrictMode double-invokes) and one session_started event per new session.
 */
export function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const locale = useLocale();

  useEffect(() => {
    const { isNewSession } = getOrCreateSessionId();
    if (isNewSession) {
      trackEvent({ eventType: "session_started", eventCategory: "session", locale });
    }
    trackEvent({ eventType: "page_view", eventCategory: "navigation", locale });
  }, [pathname, searchParams, locale]);

  return null;
}
