import Image from "next/image";
import { Database, Mail } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/lib/navigation";
import { TrackedLink } from "@/components/TrackedLink";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { navItems } from "@/lib/content";

export async function Header() {
  const t = await getTranslations("header");
  const nav = await getTranslations("nav");

  const navLabels: Record<string, string> = {
    "/": nav("home"),
    "/about": nav("about"),
    "/mandate": nav("mandate"),
    "/leadership": nav("leadership"),
    "/operations": nav("operations"),
    "/dashboards": nav("dashboards"),
    "/publications": nav("publications"),
    "/conventions": nav("conventions"),
    "/news": nav("news"),
    "/data-request": nav("dataRequest"),
    "/government-links": nav("governmentLinks"),
    "/contact": nav("contact"),
  };

  return (
    <header className="site-header">
      <div className="gov-bar">
        <div className="gov-bar-identity">
          <img
            src="/images/somalia-flag.svg"
            alt=""
            className="gov-bar-flag"
            aria-hidden="true"
          />
          <span>{t("govBar")}</span>
        </div>
        <div className="gov-bar-links">
          <LanguageSwitcher />
          <span className="gov-bar-sep" aria-hidden="true">|</span>
          <a
            href="https://www.somalia.gov.so"
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t("somaliaPortalLabel")}
          >
            {t("somaliaPortal")}
          </a>
          <span className="gov-bar-sep" aria-hidden="true">|</span>
          <a
            href="https://x.com/SomaliaSema"
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t("xLabel")}
          >
            {t("xLink")}
          </a>
        </div>
      </div>
      <div className="header-main">
        <Link className="brand" href="/" aria-label={t("homeLabel")}>
          <div className="brand-flags">
            <img
              src="/images/somalia-flag1.svg"
              alt={t("somaliaFlagAlt")}
              className="brand-flag"
            />
            <Image
              src="/images/sema-logo.png"
              alt="SEMA logo"
              width={64}
              height={64}
              priority
            />
          </div>
          <div className="brand-divider" aria-hidden="true" />
          <span>
            <strong>{t("brandName")}</strong>
            <small>{t("brandSubtitle")}</small>
          </span>
        </Link>
        <div className="header-actions">
          <TrackedLink
            className="icon-link"
            href="/data-request"
            eventType="header_action_click"
            label="Data request"
          >
            <Database aria-hidden="true" size={18} />
            {t("dataRequest")}
          </TrackedLink>
          <TrackedLink
            className="icon-link primary"
            href="/contact"
            eventType="header_action_click"
            label="Contact"
          >
            <Mail aria-hidden="true" size={18} />
            {t("contact")}
          </TrackedLink>
        </div>
      </div>
      <nav className="nav" aria-label="Primary navigation">
        {navItems.map((item) => (
          <TrackedLink
            key={item.href}
            href={item.href}
            label={navLabels[item.href] ?? item.label}
          >
            {navLabels[item.href] ?? item.label}
          </TrackedLink>
        ))}
      </nav>
    </header>
  );
}
