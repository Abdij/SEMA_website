import Image from "next/image";
import Link from "next/link";
import { Database, Mail } from "lucide-react";
import { TrackedLink } from "@/components/TrackedLink";
import { navItems } from "@/lib/content";

export function Header() {
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
          <span>Federal Republic of Somalia</span>
        </div>
        <div className="gov-bar-links">
          <a
            href="https://www.somalia.gov.so"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Federal Government of Somalia portal"
          >
            somalia.gov.so
          </a>
          <span className="gov-bar-sep" aria-hidden="true">|</span>
          <a
            href="https://x.com/SomaliaSema"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Follow SEMA on X"
          >
            X: @SomaliaSema
          </a>
        </div>
      </div>
      <div className="header-main">
        <Link className="brand" href="/" aria-label="SEMA home">
          <div className="brand-flags">
            <img
              src="/images/somalia-flag.svg"
              alt="Somalia flag"
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
            <strong>Somalia Explosive Management Authority</strong>
            <small>SEMA — Federal Government of Somalia</small>
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
            Data request
          </TrackedLink>
          <TrackedLink
            className="icon-link primary"
            href="/contact"
            eventType="header_action_click"
            label="Contact"
          >
            <Mail aria-hidden="true" size={18} />
            Contact
          </TrackedLink>
        </div>
      </div>
      <nav className="nav" aria-label="Primary navigation">
        {navItems.map((item) => (
          <TrackedLink key={item.href} href={item.href} label={item.label}>
            {item.label}
          </TrackedLink>
        ))}
      </nav>
    </header>
  );
}
