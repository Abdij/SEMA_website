import Image from "next/image";
import Link from "next/link";
import { Database, Mail } from "lucide-react";
import { TrackedLink } from "@/components/TrackedLink";
import { navItems } from "@/lib/content";

export function Header() {
  return (
    <header className="site-header">
      <div className="topline">
        <span>Federal Government of Somalia</span>
        <span>Official public information and mine action coordination</span>
      </div>
      <div className="header-main">
        <Link className="brand" href="/" aria-label="SEMA home">
          <Image
            src="/images/sema-logo.png"
            alt="SEMA logo"
            width={76}
            height={76}
            priority
          />
          <span>
            <strong>SEMA</strong>
            <small>Somalia Explosive Management Authority</small>
          </span>
        </Link>
        <div className="header-actions">
          <TrackedLink className="icon-link" href="/data-request" eventType="header_action_click" label="Data request">
            <Database aria-hidden="true" size={18} />
            Data request
          </TrackedLink>
          <TrackedLink className="icon-link primary" href="/contact" eventType="header_action_click" label="Contact">
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
