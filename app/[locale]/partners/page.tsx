import { ExternalLink } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { PageHero } from "@/components/PageHero";
import { partners } from "@/lib/content";

export default async function PartnersPage() {
  const t = await getTranslations("partners");

  return (
    <>
      <PageHero eyebrow={t("eyebrow")} title={t("title")} text={t("text")} />
      <section className="section">
        <div className="section-inner grid three">
          {partners.map((partner) => (
            <article className="partner-card" key={partner.name}>
              <span className="tag">{partner.type}</span>
              <h3>{partner.name}</h3>
              <p>{partner.description}</p>
              {partner.href ? (
                <a className="text-link" href={partner.href} target="_blank" rel="noreferrer">
                  {t("visitWebsite")} <ExternalLink aria-hidden="true" size={16} />
                </a>
              ) : null}
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
