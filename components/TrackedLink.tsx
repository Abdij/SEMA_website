"use client";

import Link from "next/link";
import type { AnchorHTMLAttributes, MouseEvent, ReactNode } from "react";

type AnalyticsEventType = "nav_click" | "header_action_click" | "dashboard_open";

type TrackingProps = {
  children: ReactNode;
  eventType?: AnalyticsEventType;
  label: string;
  metadata?: Record<string, unknown>;
};

type TrackedLinkProps = TrackingProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
    href: string;
  };

function sendAnalytics(eventType: AnalyticsEventType, label: string, targetUrl: string, metadata?: Record<string, unknown>) {
  const payload = JSON.stringify({
    eventType,
    label,
    targetUrl,
    path: `${window.location.pathname}${window.location.search}`,
    metadata: metadata ?? {},
  });

  if ("sendBeacon" in navigator) {
    const blob = new Blob([payload], { type: "application/json" });
    navigator.sendBeacon("/api/analytics", blob);
    return;
  }

  void fetch("/api/analytics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: payload,
    keepalive: true,
  });
}

export function TrackedLink({
  children,
  eventType = "nav_click",
  href,
  label,
  metadata,
  onClick,
  ...props
}: TrackedLinkProps) {
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event);

    if (!event.defaultPrevented) {
      sendAnalytics(eventType, label, href, metadata);
    }
  }

  return (
    <Link href={href} onClick={handleClick} {...props}>
      {children}
    </Link>
  );
}

export function TrackedAnchor({
  children,
  eventType = "dashboard_open",
  href,
  label,
  metadata,
  onClick,
  ...props
}: TrackedLinkProps) {
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event);

    if (!event.defaultPrevented) {
      sendAnalytics(eventType, label, href, metadata);
    }
  }

  return (
    <a href={href} onClick={handleClick} {...props}>
      {children}
    </a>
  );
}
