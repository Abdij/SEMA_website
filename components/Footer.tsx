import { getTranslations } from "next-intl/server";
import { Link } from "@/lib/navigation";
import { TrackedAnchor } from "@/components/TrackedLink";
import { govLinks } from "@/lib/content";

export async function Footer() {
  const t = await getTranslations("footer");
  const nav = await getTranslations("nav");

  return (
    <footer className="footer">
      <div className="footer-grid">
        <div>
          <h2>SEMA</h2>
          <p>{t("description")}</p>
          <p style={{ marginTop: "0.5rem", fontSize: "0.82rem", opacity: 0.7 }}>
            {t("federal")}
          </p>
        </div>
        <div>
          <h3>{t("services")}</h3>
          <Link href="/dashboards">{nav("dashboards")}</Link>
          <Link href="/publications">{nav("publications")}</Link>
          <Link href="/data-request">{nav("dataRequest")}</Link>
          <Link href="/contact">{nav("contact")}</Link>
        </div>
        <div>
          <h3>{t("institution")}</h3>
          <Link href="/about">{nav("about")}</Link>
          <Link href="/mandate">{nav("mandate")}</Link>
          <Link href="/leadership">{nav("leadership")}</Link>
          <Link href="/operations">{nav("operations")}</Link>
          <Link href="/partners">{nav("partners")}</Link>
        </div>
        <div>
          <h3>{t("governmentLinks")}</h3>
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
          <h3 style={{ marginTop: "1.25rem" }}>{t("followSema")}</h3>
          <TrackedAnchor
            href="https://x.com/SomaliaSema"
            eventType="external_link_clicked"
            label={t("xLink")}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t("xLabel")}
          >
            {t("xLink")}
          </TrackedAnchor>
        </div>
      </div>
      <div className="footer-bottom">
        <span>{t("copyright")}</span>
        <div className="footer-bottom-links">
          <Link href="/privacy">{t("privacyLink")}</Link>
          <a href="mailto:info@sema.gov.so">info@sema.gov.so</a>
        </div>
      </div>
    </footer>
  );
}
