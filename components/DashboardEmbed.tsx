import { ExternalLink } from "lucide-react";
import { TrackedAnchor } from "@/components/TrackedLink";
import { DashboardAccessGate } from "@/components/DashboardAccessGate";

type DashboardEmbedProps = {
  id?: string;
  title: string;
  description: string;
  url?: string;
  provider?: string;
  public_safe?: boolean;
  status?: string;
  notes?: string;
};

/**
 * Public dashboard listing entry. When the dashboard has a database id, the
 * dashboard-access gate is used: the trusted embed URL is never sent to the
 * browser until the visitor registers (or reuses a prior registration).
 *
 * When no database is configured, getDashboardEmbeds provides placeholders
 * without URLs because registrations cannot be verified.
 */
export function DashboardEmbed({ id, title, description, url, provider }: DashboardEmbedProps) {
  if (id) {
    return <DashboardAccessGate dashboardId={id} title={title} description={description} provider={provider} />;
  }

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
