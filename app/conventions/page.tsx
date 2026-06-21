import { ExternalLink } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import {
  clusterConventionMilestones,
  conventionMilestones,
  officialSources,
} from "@/lib/content";

export const metadata = {
  title: "Convention Progress",
};

export default function ConventionsPage() {
  return (
    <>
      <PageHero
        eyebrow="Convention progress"
        title="Tracking Somalia's progress against international mine action obligations."
        text="This page connects SEMA public reporting to the Anti-Personnel Mine Ban Convention, Article 5 progress, Article 7 reports, and related cluster munition commitments."
      />
      <section className="section">
        <div className="section-inner grid two">
          <div>
            <p className="eyebrow">Anti-Personnel Mine Ban Convention</p>
            <h2>Article 5 progress timeline</h2>
            <div className="timeline">
              {conventionMilestones.map((item) => (
                <article className="step" key={`${item.date}-${item.title}`}>
                  <time>{item.date}</time>
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.text}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
          <div>
            <p className="eyebrow">Convention on Cluster Munitions</p>
            <h2>Related treaty milestones</h2>
            <div className="timeline">
              {clusterConventionMilestones.map((item) => (
                <article className="step" key={`${item.date}-${item.title}`}>
                  <time>{item.date}</time>
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.text}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
      <section className="band">
        <div className="section-inner">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Source links</p>
              <h2>Official references</h2>
            </div>
          </div>
          <div className="grid three">
            {officialSources.map((source) => (
              <a className="card" href={source.href} target="_blank" rel="noreferrer" key={source.href}>
                <h3>{source.label}</h3>
                <p className="text-link">
                  Open reference <ExternalLink aria-hidden="true" size={16} />
                </p>
              </a>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
