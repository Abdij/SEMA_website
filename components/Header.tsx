import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/lib/navigation";
import { TrackedAnchor, TrackedLink } from "@/components/TrackedLink";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ResourcesDropdown } from "@/components/ResourcesDropdown";
import { MobileNav } from "@/components/MobileNav";

const topNavHrefs = [
  { href: "/", key: "home" },
  { href: "/about", key: "about" },
  { href: "/dashboards", key: "dashboards" },
  { href: "/publications", key: "publications" },
  { href: "/eore-resources", key: "eoreResources" },
  { href: "/news", key: "news" },
] as const;

const resourceHrefs = [
  { href: "/mandate", key: "mandate" },
  { href: "/leadership", key: "leadership" },
  { href: "/operations", key: "operations" },
  { href: "/conventions", key: "conventions" },
  { href: "/data-request", key: "dataRequest" },
  { href: "/government-links", key: "governmentLinks" },
] as const;

export async function Header() {
  const t = await getTranslations("header");
  const nav = await getTranslations("nav");

  const topItems = topNavHrefs.map((item) => ({
    href: item.href,
    label: nav(item.key),
  }));

  const resourceItems = resourceHrefs.map((item) => ({
    href: item.href,
    label: nav(item.key),
  }));

  return (
    <header className="site-header">
      {/* Government identity strip */}
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
          <TrackedAnchor
            href="https://www.somalia.gov.so"
            eventType="external_link_clicked"
            label={t("somaliaPortal")}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t("somaliaPortalLabel")}
          >
            {t("somaliaPortal")}
          </TrackedAnchor>
          <span className="gov-bar-sep" aria-hidden="true">|</span>
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

      {/* Main brand bar */}
      <div className="header-main">
        <Link className="brand" href="/" aria-label={t("homeLabel")}>
          <Image
            src="/images/sema-logo.png"
            alt="SEMA logo"
            width={48}
            height={48}
            priority
          />
          <div className="brand-divider" aria-hidden="true" />
          <span>
            <strong>{t("brandName")}</strong>
            <small>{t("brandSubtitle")}</small>
          </span>
        </Link>

        {/* Mobile hamburger (hidden on desktop) */}
        <MobileNav
          topItems={topItems}
          resourceItems={resourceItems}
          resourcesLabel={nav("resources")}
          contactLabel={nav("contact")}
        />
      </div>

      {/* Desktop navigation (hidden on mobile) */}
      <nav className="nav" aria-label="Primary navigation">
        {topItems.map((item) => (
          <TrackedLink key={item.href} href={item.href} label={item.label}>
            {item.label}
          </TrackedLink>
        ))}
        <ResourcesDropdown
          label={nav("resources")}
          items={resourceItems}
        />
        <TrackedLink
          className="nav-cta"
          href="/contact"
          eventType="header_action_click"
          label={nav("contact")}
        >
          {nav("contact")}
        </TrackedLink>
      </nav>
    </header>
  );
}
