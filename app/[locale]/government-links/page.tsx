import { getTranslations } from "next-intl/server";
import { PageHero } from "@/components/PageHero";
import { govLinks } from "@/lib/content";

export default async function GovernmentLinksPage() {
  const t = await getTranslations("governmentLinks");

  return (
    <>
      <PageHero eyebrow={t("eyebrow")} title={t("title")} text={t("text")} />
      <section className="section">
        <div className="section-inner grid two">
          {govLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="gov-link-card"
              aria-label={`Visit ${link.name} (opens in new tab)`}
            >
              <h3>{link.name}</h3>
              <p>{link.description}</p>
              <span style={{ color: "var(--blue)", fontWeight: 700, fontSize: "0.85rem" }}>
                {t("visitWebsite")}
              </span>
            </a>
          ))}
        </div>
      </section>
    </>
  );
}
