import { getTranslations } from "next-intl/server";
import { PageHero } from "@/components/PageHero";

const sectionKeys = [
  "whatWebsite",
  "whatDashboard",
  "location",
  "estimates",
  "retention",
  "access",
  "contact",
  "powerbi",
] as const;

export default async function PrivacyPage() {
  const t = await getTranslations("privacy");

  return (
    <>
      <PageHero eyebrow={t("eyebrow")} title={t("title")} text={t("intro")} />
      <section className="section">
        <div className="section-inner privacy-sections">
          {sectionKeys.map((key) => (
            <article key={key} className="privacy-section">
              <h2>{t(`sections.${key}.title`)}</h2>
              <p>{t(`sections.${key}.body`)}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
