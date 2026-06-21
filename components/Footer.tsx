import Link from "next/link";
import { officialSources } from "@/lib/content";

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-grid">
        <div>
          <h2>SEMA</h2>
          <p>
            Somalia Explosive Management Authority. National coordination,
            policy oversight, information management, and public information
            for mine action and explosive hazard management.
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
          <Link href="/operations">Operations</Link>
          <Link href="/partners">Partners</Link>
        </div>
        <div>
          <h3>External Sources</h3>
          {officialSources.slice(0, 4).map((source) => (
            <a key={source.href} href={source.href} target="_blank" rel="noreferrer">
              {source.label}
            </a>
          ))}
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2026 Somalia Explosive Management Authority.</span>
        <span>Mogadishu, Somalia · info@sema.gov.so</span>
      </div>
    </footer>
  );
}
