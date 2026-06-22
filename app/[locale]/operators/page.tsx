import { getTranslations } from "next-intl/server";
import { PageHero } from "@/components/PageHero";

export default async function OperatorsPage() {
  const t = await getTranslations("operators");

  return (
    <>
      <PageHero eyebrow={t("eyebrow")} title={t("title")} text={t("text")} />
      <section className="section">
        <div className="section-inner content-block">
          <h2>{t("infoTitle")}</h2>
          <ul className="content-list">
            {[0, 1, 2, 3].map((i) => (
              <li key={i}>{t(`item${i}`)}</li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
