import { ExternalLink } from "lucide-react";

type DashboardEmbedProps = {
  title: string;
  description: string;
  url: string;
  envKey?: string;
  notes: string;
};

export function DashboardEmbed({ title, description, url, envKey, notes }: DashboardEmbedProps) {
  return (
    <section className="dashboard-panel">
      <div className="dashboard-copy">
        <p className="eyebrow">Dashboard</p>
        <h2>{title}</h2>
        <p>{description}</p>
        <p className="muted">{notes}</p>
        {url ? (
          <a className="text-link" href={url} target="_blank" rel="noreferrer">
            Open dashboard <ExternalLink aria-hidden="true" size={16} />
          </a>
        ) : (
          <p className="configuration-note">Configure {envKey || "dashboard URL"} in Vercel to activate this embed.</p>
        )}
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
            <span>{title}</span>
            <small>Embed URL pending</small>
          </div>
        )}
      </div>
    </section>
  );
}
