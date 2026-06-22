import Link from "next/link";
import { govLinks } from "@/lib/content";

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-grid">
        <div>
          <h2>SEMA</h2>
          <p>
            Somalia Explosive Management Authority. National coordination,
            policy oversight, information management, and public information
            for mine action and explosive hazard management across Somalia.
          </p>
          <p style={{ marginTop: "0.5rem", fontSize: "0.82rem", opacity: 0.7 }}>
            Federal Republic of Somalia
          </p>
        </div>
        <div>
          <h3>Services</h3>
          <Link href="/dashboards">Dashboards</Link>
          <Link href="/publications">Publications</Link>
          <Link href="/data-request">Data request</Link>
          <Link href="/contact">Contact us</Link>
        </div>
        <div>
          <h3>Institution</h3>
          <Link href="/about">About SEMA</Link>
          <Link href="/mandate">Mandate</Link>
          <Link href="/leadership">Leadership</Link>
          <Link href="/operations">Operations</Link>
          <Link href="/partners">Partners</Link>
        </div>
        <div>
          <h3>Government Links</h3>
          {govLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Visit ${link.name} (opens in new tab)`}
            >
              {link.name}
            </a>
          ))}
          <h3 style={{ marginTop: "1.25rem" }}>Follow SEMA</h3>
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
      <div className="footer-bottom">
        <span>
          © 2026 Somalia Explosive Management Authority · Mogadishu, Somalia
        </span>
        <a href="mailto:info@sema.gov.so">info@sema.gov.so</a>
      </div>
    </footer>
  );
}
