import { getTranslations } from "next-intl/server";
import { PageHero } from "@/components/PageHero";
import { PublicationGrid } from "@/components/PublicationGrid";
import { getPublications } from "@/lib/db";
import { isEoreResource } from "@/lib/eore";

export const dynamic = "force-dynamic";

export default async function EoreResourcesPage() {
  const t = await getTranslations("eoreResources");
  const p = await getTranslations("publications");
  const allPublications = await getPublications();

  const resources = allPublications.filter(
    (item) =>
      item.href &&
      (item.href.startsWith("http") || item.href.startsWith("/api/publications/file")) &&
      isEoreResource(item.type),
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
          <PublicationGrid
            publications={resources}
            labels={{
              openSource: p("openSource"),
              download: p("download"),
              source: p("source"),
              empty: t("empty"),
            }}
          />
        </div>
      </section>
    </>
  );
}
