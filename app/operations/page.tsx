import { PageHero } from "@/components/PageHero";

export const metadata = {
  title: "Operations",
};

export default function OperationsPage() {
  return (
    <>
      <PageHero
        eyebrow="Operations"
        title="Operational coordination for mine action priorities."
        text="This section explains how SEMA supports planning, prioritization, information management, risk education, operator engagement, and public reporting."
      />
      <section className="section">
        <div className="section-inner grid three">
          {[
            ["Survey and clearance coordination", "Coordinate prioritization, tasking visibility, quality expectations, and reporting for survey and clearance activities."],
            ["Explosive ordnance risk education", "Support consistent public safety messaging and community awareness for people exposed to explosive hazards."],
            ["Victim assistance coordination", "Link sector reporting with broader support to victims, survivors, persons with disabilities, and affected families."],
            ["Information management", "Maintain validated information flows for planning, dashboards, reporting, and official data requests."],
            ["Operator engagement", "Support accreditation, technical coordination, and communication with national and international operators."],
            ["Public reporting", "Publish progress, documents, dashboards, and external-source links for government, partners, and communities."],
          ].map(([title, text]) => (
            <article className="card" key={title}>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
