import { Download, ExternalLink } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { getPublications } from "@/lib/db";

export const metadata = {
  title: "Publications",
  description:
    "Official SEMA policies, standards, treaty reports, strategies, and public information materials for Somalia's mine action sector.",
};

export const dynamic = "force-dynamic";

function getPublicationAction(item: { href: string; fileName?: string }) {
  if (item.href.startsWith("http")) {
    return {
      label: "Open source",
      icon: <ExternalLink aria-hidden="true" size={16} />,
      target: "_blank" as const,
    };
  }

  return {
    label: item.fileName ? `Download ${item.fileName}` : "Download file",
    icon: <Download aria-hidden="true" size={16} />,
    target: undefined,
  };
}

export default async function PublicationsPage() {
  const allPublications = await getPublications();

  const publications = allPublications.filter(
    (item) =>
      item.href &&
      (item.href.startsWith("http") || item.href.startsWith("/api/publications/file")),
  );

  return (
    <>
      <PageHero
        eyebrow="Publications"
        title="Policies, standards, reports, and public information materials."
        text="This library provides access to official SEMA documents, treaty reports, national standards, and public awareness materials."
      />
      <section className="section">
        <div className="section-inner">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Document library</p>
              <h2>Available resources</h2>
            </div>
          </div>
          {publications.length > 0 ? (
            <div className="grid two">
              {publications.map((item) => {
                const action = getPublicationAction(item);
                return (
                  <article className="publication-card" key={item.title}>
                    <span className="tag">{item.type}</span>
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                    <p className="publication-meta">Source: {item.source}</p>
                    <a
                      className="text-link"
                      href={item.href}
                      target={action.target}
                      rel="noreferrer"
                    >
                      {action.label} {action.icon}
                    </a>
                  </article>
                );
              })}
            </div>
          ) : (
            <p className="muted">Official publications will be available soon.</p>
          )}
        </div>
      </section>
    </>
  );
}
