import { PageHero } from "@/components/PageHero";
import { serviceAreas } from "@/lib/content";

export const metadata = {
  title: "Mandate",
};

export default function MandatePage() {
  return (
    <>
      <PageHero
        eyebrow="Mandate"
        title="Coordination, policy direction, standards, and public reporting."
        text="SEMA's mandate centers on national leadership for mine action and explosive hazard management, including operator coordination, information management, risk education support, and progress reporting."
      />
      <section className="section">
        <div className="section-inner grid two">
          {serviceAreas.map((area) => (
            <article className="card" key={area.title}>
              <h3>{area.title}</h3>
              <p>{area.text}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="band">
        <div className="section-inner content-block">
          <h2>Governance priorities</h2>
          <ul className="content-list">
            <li>Maintain a national overview of mine action priorities and public reporting needs.</li>
            <li>Support standards, accreditation, and quality management for operators.</li>
            <li>Coordinate with Federal Member States and partners on planning and implementation.</li>
            <li>Publish verified information through reports, dashboards, and official updates.</li>
          </ul>
        </div>
      </section>
    </>
  );
}
