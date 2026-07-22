"use client";

import type { ReactNode } from "react";
import { useLocale } from "next-intl";
import { trackEvent } from "@/lib/analytics-client";

type Props = {
  href: string;
  target?: "_blank";
  publicationId?: string;
  title: string;
  fileType: string;
  children: ReactNode;
};

export function PublicationLink({ href, target, publicationId, title, fileType, children }: Props) {
  const locale = useLocale();

  return (
    <a
      className="text-link"
      href={href}
      target={target}
      rel={target ? "noreferrer" : undefined}
      onClick={() =>
        trackEvent({
          eventType: "publication_downloaded",
          eventCategory: "publication",
          label: title,
          targetUrl: href,
          locale,
          metadata: {
            publicationId,
            fileType,
            sourcePage: typeof window !== "undefined" ? window.location.pathname : undefined,
          },
        })
      }
    >
      {children}
    </a>
  );
}
