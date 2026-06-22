import { getTranslations } from "next-intl/server";
import { ContactForm } from "@/components/ContactForm";
import { PageHero } from "@/components/PageHero";

export default async function ContactPage() {
  const t = await getTranslations("contact");

  return (
    <>
      <PageHero eyebrow={t("eyebrow")} title={t("title")} text={t("text")} />
      <section className="section">
        <div className="section-inner grid two">
          <div className="content-block">
            <h2>{t("channelsTitle")}</h2>
            <ul className="content-list">
              <li>
                Email:{" "}
                <a href="mailto:info@sema.gov.so" style={{ color: "inherit" }}>
                  info@sema.gov.so
                </a>
              </li>
              <li>{t("location")}</li>
              <li>
                X (Twitter):{" "}
                <a
                  href="https://x.com/SomaliaSema"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={t("xLabel")}
                  style={{ color: "inherit" }}
                >
                  @SomaliaSema
                </a>
              </li>
              <li>
                {t("dataRequestNote")}{" "}
                <a href="/data-request" style={{ color: "inherit", fontWeight: 900 }}>
                  {t("dataRequestLink")}
                </a>{" "}
                {t("dataRequestEnd")}
              </li>
            </ul>
          </div>
          <div className="card">
            <h2>{t("formTitle")}</h2>
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  );
}
