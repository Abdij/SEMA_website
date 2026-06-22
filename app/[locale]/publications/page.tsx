import { Download, ExternalLink } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { PageHero } from "@/components/PageHero";
import { getPublications } from "@/lib/db";

export const dynamic = "force-dynamic";

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

export default async function PublicationsPage() {
  const t = await getTranslations("publications");
  const allPublications = await getPublications();

  const publications = allPublications.filter(
    (item) =>
      item.href &&
      (item.href.startsWith("http") || item.href.startsWith("/api/publications/file")),
  );

  return (
    <>
      <PageHero eyebrow={t("eyebrow")} title={t("title")} text={t("text")} />
      <section className="section">
        <div className="section-inner">
          <div className="section-heading">
            <div>
              <p className="eyebrow">{t("libraryEyebrow")}</p>
              <h2>{t("libraryTitle")}</h2>
            </div>
          </div>
          {publications.length > 0 ? (
            <div className="grid two">
              {publications.map((item) => {
                const action = getPublicationAction(item, t("openSource"), t("download"));
                return (
                  <article className="publication-card" key={item.title}>
                    <span className="tag">{item.type}</span>
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                    <p className="publication-meta">{t("source")} {item.source}</p>
                    <a className="text-link" href={item.href} target={action.target} rel="noreferrer">
                      {action.label} {action.icon}
                    </a>
                  </article>
                );
              })}
            </div>
          ) : (
            <p className="muted">{t("empty")}</p>
          )}
        </div>
      </section>
    </>
  );
}
