import { getLocale, getTranslations } from "next-intl/server";
import { DataRequestForm } from "@/components/DataRequestForm";
import { PageHero } from "@/components/PageHero";
import { PublicationLink } from "@/components/PublicationLink";

export default async function DataRequestPage() {
  const t = await getTranslations("dataRequest");
  const locale = await getLocale();

  const steps = Array.from({ length: 5 }, (_, i) => ({
    step: t(`step${i}Step`),
    title: t(`step${i}Title`),
    text: t(`step${i}Text`),
  }));

  const restricted = Array.from({ length: 4 }, (_, i) => t(`restricted${i}`));

  return (
    <>
      <PageHero eyebrow={t("eyebrow")} title={t("title")} text={t("text")} />
      {locale === "en" ? (
        <section className="section">
          <div className="section-inner">
            <article className="card">
              <p className="eyebrow">{t("catalogueEyebrow")}</p>
              <h2>{t("catalogueTitle")}</h2>
              <p>{t("catalogueDescription")}</p>
              <p className="muted">{t("catalogueMetadata")}</p>
              <PublicationLink
                href="/documents/SEMA_Mine_Action_Data_Catalogue.pdf"
                target="_blank"
                publicationId="sema-mine-action-data-catalogue"
                title="SEMA Mine Action Data Catalogue"
                fileType="application/pdf"
              >
                {t("catalogueOpen")}
              </PublicationLink>
            </article>
          </div>
        </section>
      ) : null}
      <section className="section">
        <div className="section-inner grid two">
          <div className="content-block">
            <h2>{t("processTitle")}</h2>
            <div className="timeline">
              {steps.map((s) => (
                <article className="step" key={s.step}>
                  <time>{s.step}</time>
                  <div>
                    <h3>{s.title}</h3>
                    <p>{s.text}</p>
                  </div>
                </article>
              ))}
            </div>
            <h2>{t("restrictedTitle")}</h2>
            <ul className="content-list">
              {restricted.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="card">
            <h2>{t("formTitle")}</h2>
            <p className="muted">{t("formText")}</p>
            <DataRequestForm />
          </div>
        </div>
      </section>
    </>
  );
}
