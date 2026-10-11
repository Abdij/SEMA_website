import { getLocale, getTranslations } from "next-intl/server";
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
  const locale = await getLocale();

  return (
    <>
      <PageHero eyebrow={t("eyebrow")} title={t("title")} text={t("intro")} />
      <section className="section">
        <div className="section-inner privacy-sections">
          {locale === "en" ? <article className="privacy-section">
            <h2>Website FAQ conversations</h2>
            <p>The FAQ uses fixed published answers, not AI. Questions are processed by this website to select an answer; new conversation transcripts are not stored on the server or sent to an AI provider. The last 50 exchanges are kept in this browser tab’s session storage and can be removed with “Delete conversation”. Browser session restoration may preserve them after a tab is closed. Avoid entering personal details or precise hazard locations. This service is not monitored for emergencies. Older transcripts collected by the previous version remain available only to authorised administrators and are included in the retention cleanup for records older than 30 days.</p>
          </article> : null}
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
