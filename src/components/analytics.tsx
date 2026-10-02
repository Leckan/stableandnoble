"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export type AnalyticsEventName = "page_view" | "property_view" | "seller_form_started" | "seller_form_completed" | "investor_form_started" | "investor_form_completed" | "contact_form_submitted" | "property_analyzer_started" | "property_analyzer_completed";

export function trackEvent(event: AnalyticsEventName, route = typeof window === "undefined" ? "/" : window.location.pathname) {
  if (typeof window === "undefined" || route.startsWith("/admin")) return;
  return fetch("/api/analytics", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ event, route: route.slice(0, 200) }), keepalive: true
  }).catch(() => undefined);
}

export function AnalyticsListener() {
  const pathname = usePathname();
  const previousPath = useRef("");
  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin") || previousPath.current === pathname) return;
    previousPath.current = pathname;
    void trackEvent("page_view", pathname);
    if (/^\/portfolio\/[^/]+$/.test(pathname)) void trackEvent("property_view", pathname);
  }, [pathname]);
  return null;
}
