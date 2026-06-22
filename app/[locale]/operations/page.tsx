import { getTranslations } from "next-intl/server";
import { PageHero } from "@/components/PageHero";

export default async function OperationsPage() {
  const t = await getTranslations("operations");

  const areas = Array.from({ length: 6 }, (_, i) => ({
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
    </>
  );
}
