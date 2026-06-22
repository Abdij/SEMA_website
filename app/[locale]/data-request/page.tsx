import { getTranslations } from "next-intl/server";
import { DataRequestForm } from "@/components/DataRequestForm";
import { PageHero } from "@/components/PageHero";

export default async function DataRequestPage() {
  const t = await getTranslations("dataRequest");

  const steps = Array.from({ length: 5 }, (_, i) => ({
    step: t(`step${i}Step`),
    title: t(`step${i}Title`),
    text: t(`step${i}Text`),
  }));

  const restricted = Array.from({ length: 4 }, (_, i) => t(`restricted${i}`));

  return (
    <>
      <PageHero eyebrow={t("eyebrow")} title={t("title")} text={t("text")} />
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
