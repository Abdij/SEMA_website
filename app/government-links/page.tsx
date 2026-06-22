import { PageHero } from "@/components/PageHero";
import { govLinks } from "@/lib/content";

export const metadata = {
  title: "Government Links",
  description:
    "Official Federal Government of Somalia ministries and agencies related to mine action, internal security, and disaster management.",
};

export default function GovernmentLinksPage() {
  return (
    <>
      <PageHero
        eyebrow="Government Links"
        title="Federal Government of Somalia — Official Institutions"
        text="SEMA operates within the Federal Government of Somalia alongside partner ministries and agencies responsible for security, governance, and disaster management."
      />
      <section className="section">
        <div className="section-inner grid two">
          {govLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="gov-link-card"
              aria-label={`Visit ${link.name} (opens in new tab)`}
            >
              <h3>{link.name}</h3>
              <p>{link.description}</p>
              <span style={{ color: "var(--blue)", fontWeight: 700, fontSize: "0.85rem" }}>
                Visit website →
              </span>
            </a>
          ))}
        </div>
      </section>
    </>
  );
}
