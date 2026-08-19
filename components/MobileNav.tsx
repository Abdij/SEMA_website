"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Link } from "@/lib/navigation";

type NavItem = { href: string; label: string; key?: string };

type Props = {
  homeItem: NavItem;
  topItems: NavItem[];
  aboutItems: NavItem[];
  aboutLabel: string;
  contactLabel: string;
};

export function MobileNav({ homeItem, topItems, aboutItems, aboutLabel, contactLabel }: Props) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <>
      <button
        className="mobile-toggle"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? "Close menu" : "Open menu"}
      >
        {open ? (
          <X aria-hidden="true" size={22} />
        ) : (
          <Menu aria-hidden="true" size={22} />
        )}
      </button>

      {open && (
        <div className="mobile-menu" aria-label="Mobile navigation">
          <Link href={homeItem.href} className="mobile-link" onClick={close}>
            {homeItem.label}
          </Link>
          <div className="mobile-divider" aria-hidden="true" />
          <span className="mobile-section-label">{aboutLabel}</span>
          {aboutItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="mobile-link mobile-indent"
              onClick={close}
            >
              {item.label}
            </Link>
          ))}
          <div className="mobile-divider" aria-hidden="true" />
          {topItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={
                item.key === "dashboards" ? "mobile-link nav-fire" : "mobile-link"
              }
              onClick={close}
            >
              {item.label}
            </Link>
          ))}
          <div className="mobile-divider" aria-hidden="true" />
          <Link href="/contact" className="mobile-cta" onClick={close}>
            {contactLabel}
          </Link>
        </div>
      )}
    </>
  );
}
