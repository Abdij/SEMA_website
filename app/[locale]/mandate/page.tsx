import { getTranslations } from "next-intl/server";
import { PageHero } from "@/components/PageHero";

export default async function MandatePage() {
  const t = await getTranslations("mandate");

  const areas = Array.from({ length: 9 }, (_, i) => ({
    title: t(`area${i}Title`),
    text: t(`area${i}Text`),
  }));

  return (
    <>
      <PageHero eyebrow={t("eyebrow")} title={t("title")} text={t("text")} />
      <section className="section">
        <div className="section-inner grid three">
          {areas.map((area) => (
            <article className="card" key={area.title}>
              <h3>{area.title}</h3>
              <p>{area.text}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="band">
        <div className="section-inner content-block">
          <h2>{t("govTitle")}</h2>
          <ul className="content-list">
            {[0, 1, 2, 3].map((i) => (
              <li key={i}>{t(`gov${i}`)}</li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
