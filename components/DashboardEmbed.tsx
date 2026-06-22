import { ExternalLink } from "lucide-react";
import { TrackedAnchor } from "@/components/TrackedLink";

type DashboardEmbedProps = {
  title: string;
  description: string;
  url: string;
  provider?: string;
  public_safe?: boolean;
  status?: string;
  notes?: string;
};

export function DashboardEmbed({ title, description, url, provider }: DashboardEmbedProps) {
  return (
    <section className="dashboard-panel">
      <div className="dashboard-copy">
        <p className="eyebrow">Dashboard</p>
        <h2>{title}</h2>
        <p>{description}</p>
        {url ? (
          <TrackedAnchor
            className="text-link"
            href={url}
            label={title}
            metadata={{ provider: provider || "dashboard" }}
            target="_blank"
            rel="noreferrer"
          >
            View Dashboard <ExternalLink aria-hidden="true" size={16} />
          </TrackedAnchor>
        ) : null}
      </div>
      <div className="embed-shell">
        {url ? (
          <iframe
            title={title}
            src={url}
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
          />
        ) : (
          <div className="embed-placeholder">
            <span>Dashboard temporarily unavailable.</span>
          </div>
        )}
      </div>
    </section>
  );
}
