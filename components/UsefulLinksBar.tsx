import { getTranslations } from "next-intl/server";
import { TrackedAnchor } from "@/components/TrackedLink";
import { govLinks } from "@/lib/content";

export async function UsefulLinksBar() {
  const t = await getTranslations("footer");

  return (
    <div className="useful-links-bar">
      <div className="section-inner useful-links-inner">
        <span className="useful-links-label">{t("usefulLinks")}</span>
        <div className="useful-links-list">
          {govLinks.map((link) => (
            <TrackedAnchor
              key={link.href}
              href={link.href}
              eventType="external_link_clicked"
              label={link.name}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Visit ${link.name} (opens in new tab)`}
            >
              {link.name}
            </TrackedAnchor>
          ))}
        </div>
      </div>
    </div>
  );
}
