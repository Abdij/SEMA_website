import { Download, ExternalLink } from "lucide-react";
import { PublicationLink } from "@/components/PublicationLink";
import type { Publication } from "@/lib/db";

type Labels = {
  openSource: string;
  download: string;
  source: string;
  empty: string;
};

function getPublicationAction(item: { href: string; fileName?: string }, openSource: string, downloadFile: string) {
  if (item.href.startsWith("http")) {
    return {
      label: openSource,
      icon: <ExternalLink aria-hidden="true" size={16} />,
      target: "_blank" as const,
    };
  }
  return {
    label: item.fileName ? `${downloadFile} ${item.fileName}` : downloadFile,
    icon: <Download aria-hidden="true" size={16} />,
    target: undefined,
  };
}

export function PublicationGrid({ publications, labels }: { publications: Publication[]; labels: Labels }) {
  if (!publications.length) {
    return <p className="muted">{labels.empty}</p>;
  }

  return (
    <div className="grid two">
      {publications.map((item) => {
        const action = getPublicationAction(item, labels.openSource, labels.download);
        return (
          <article className="publication-card" key={item.id || item.title}>
            <span className="tag">{item.type}</span>
            <h3>{item.title}</h3>
            <p>{item.description}</p>
            <p className="publication-meta">{labels.source} {item.source}</p>
            <PublicationLink
              href={item.href}
              target={action.target}
              publicationId={item.id}
              title={item.title}
              fileType={item.fileMime || item.type}
            >
              {action.label} {action.icon}
            </PublicationLink>
          </article>
        );
      })}
    </div>
  );
}
