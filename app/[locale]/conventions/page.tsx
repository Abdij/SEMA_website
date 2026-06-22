import { ExternalLink } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { PageHero } from "@/components/PageHero";
import {
  clusterConventionMilestones,
  conventionMilestones,
  officialSources,
} from "@/lib/content";

export default async function ConventionsPage() {
  const t = await getTranslations("conventions");

  return (
    <>
      <PageHero eyebrow={t("eyebrow")} title={t("title")} text={t("text")} />
      <section className="section">
        <div className="section-inner grid two">
          <div>
            <p className="eyebrow">{t("apmineEyebrow")}</p>
            <h2>{t("apmineTitle")}</h2>
            <div className="timeline">
              {conventionMilestones.map((item) => (
                <article className="step" key={`${item.date}-${item.title}`}>
                  <time>{item.date}</time>
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.text}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
          <div>
            <p className="eyebrow">{t("clusterEyebrow")}</p>
            <h2>{t("clusterTitle")}</h2>
            <div className="timeline">
              {clusterConventionMilestones.map((item) => (
                <article className="step" key={`${item.date}-${item.title}`}>
                  <time>{item.date}</time>
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.text}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
      <section className="band">
        <div className="section-inner">
          <div className="section-heading">
            <div>
              <p className="eyebrow">{t("sourcesEyebrow")}</p>
              <h2>{t("sourcesTitle")}</h2>
            </div>
          </div>
          <div className="grid three">
            {officialSources.map((source) => (
              <a className="card" href={source.href} target="_blank" rel="noreferrer" key={source.href}>
                <h3>{source.label}</h3>
                <p className="text-link">
                  {t("openReference")} <ExternalLink aria-hidden="true" size={16} />
                </p>
              </a>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
