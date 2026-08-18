import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/lib/navigation";
import { TrackedAnchor, TrackedLink } from "@/components/TrackedLink";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ResourcesDropdown } from "@/components/ResourcesDropdown";
import { MobileNav } from "@/components/MobileNav";

const homeHref = { href: "/", key: "home" } as const;

const topNavHrefs = [
  { href: "/dashboards", key: "dashboards" },
  { href: "/eore-resources", key: "eoreResources" },
  { href: "/news", key: "news" },
  { href: "/data-request", key: "dataRequest" },
] as const;

const aboutHrefs = [
  { href: "/about", key: "about" },
  { href: "/mandate", key: "mandate" },
  { href: "/operations", key: "operations" },
  { href: "/operators", key: "operators" },
  { href: "/conventions", key: "conventions" },
  { href: "/partners", key: "partners" },
  { href: "/leadership", key: "leadership" },
] as const;

export async function Header() {
  const t = await getTranslations("header");
  const nav = await getTranslations("nav");

  const homeItem = { href: homeHref.href, label: nav(homeHref.key) };

  const topItems = topNavHrefs.map((item) => ({
    href: item.href,
    label: nav(item.key),
  }));

  const aboutItems = aboutHrefs.map((item) => ({
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
          homeItem={homeItem}
          topItems={topItems}
          aboutItems={aboutItems}
          aboutLabel={nav("about")}
          contactLabel={nav("contact")}
        />
      </div>

      {/* Desktop navigation (hidden on mobile) */}
      <nav className="nav" aria-label="Primary navigation">
        <TrackedLink href={homeItem.href} label={homeItem.label}>
          {homeItem.label}
        </TrackedLink>
        <ResourcesDropdown
          label={nav("about")}
          items={aboutItems}
        />
        {topItems.map((item) => (
          <TrackedLink key={item.href} href={item.href} label={item.label}>
            {item.label}
          </TrackedLink>
        ))}
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
