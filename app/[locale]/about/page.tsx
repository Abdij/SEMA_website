import { getTranslations } from "next-intl/server";
import { PageHero } from "@/components/PageHero";

export default async function AboutPage() {
  const t = await getTranslations("about");

  return (
    <>
      <PageHero eyebrow={t("eyebrow")} title={t("title")} text={t("text")} />
      <section className="section">
        <div className="section-inner feature-row">
          <div className="content-block">
            <h2>{t("leadTitle")}</h2>
            <p>{t("lead0")}</p>
            <p>{t("lead1")}</p>
          </div>
          <div className="feature-image" />
        </div>
      </section>
    </>
  );
}
