import { getTranslations } from "next-intl/server";
import { PageHero } from "@/components/PageHero";

export default async function LeadershipPage() {
  const t = await getTranslations("leadership");

  const leaders = Array.from({ length: 6 }, (_, i) => ({
    role: t(`role${i}`),
    name: t(`name${i}`),
    bio: t(`bio${i}`),
  }));

  return (
    <>
      <PageHero eyebrow={t("eyebrow")} title={t("title")} text={t("text")} />
      <section className="section">
        <div className="section-inner">
          <div className="leadership-grid">
            {leaders.map((leader) => (
              <article className="leader-card" key={leader.role}>
                <div className="leader-portrait" aria-hidden="true">
                  {t("portrait")}
                </div>
                <div className="leader-info">
                  <span className="leader-role">{leader.role}</span>
                  <h3 className="leader-name">{leader.name}</h3>
                  <p className="leader-bio">{leader.bio}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
