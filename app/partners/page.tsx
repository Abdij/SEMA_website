import { ExternalLink } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { partners } from "@/lib/content";

export const metadata = {
  title: "Partners",
};

export default function PartnersPage() {
  return (
    <>
      <PageHero
        eyebrow="Partners"
        title="Government, operators, donors, technical partners, and communities."
        text="SEMA works through coordinated partnerships to strengthen national mine action systems, public safety, information management, and operational delivery."
      />
      <section className="section">
        <div className="section-inner grid three">
          {partners.map((partner) => (
            <article className="partner-card" key={partner.name}>
              <span className="tag">{partner.type}</span>
              <h3>{partner.name}</h3>
              <p>{partner.description}</p>
              {partner.href ? (
                <a className="text-link" href={partner.href} target="_blank" rel="noreferrer">
                  Visit website <ExternalLink aria-hidden="true" size={16} />
                </a>
              ) : null}
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
