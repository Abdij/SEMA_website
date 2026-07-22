"use client";

import type { AnchorHTMLAttributes, MouseEvent, ReactNode } from "react";
import { useLocale } from "next-intl";
import { Link } from "@/lib/navigation";
import { trackEvent } from "@/lib/analytics-client";

type AnalyticsEventType =
  | "nav_click"
  | "header_action_click"
  | "dashboard_open"
  | "external_link_clicked";

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

export function TrackedLink({
  children,
  eventType = "nav_click",
  href,
  label,
  metadata,
  onClick,
  ...props
}: TrackedLinkProps) {
  const locale = useLocale();

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event);
    if (!event.defaultPrevented) {
      trackEvent({
        eventType,
        eventCategory: "navigation",
        label,
        targetUrl: href,
        locale,
        metadata,
      });
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
  const locale = useLocale();

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event);
    if (!event.defaultPrevented) {
      trackEvent({
        eventType,
        eventCategory: eventType === "external_link_clicked" ? "external" : "dashboard",
        label,
        targetUrl: href,
        locale,
        metadata,
      });
    }
  }

  return (
    <a href={href} onClick={handleClick} {...props}>
      {children}
    </a>
  );
}
