import { PageHero } from "@/components/PageHero";

export const metadata = {
  title: "Operators",
};

export default function OperatorsPage() {
  return (
    <>
      <PageHero
        eyebrow="Operators"
        title="A public coordination page for accredited operators and implementing partners."
        text="The operators section should list approved operators, accreditation status, areas of work, reporting expectations, and links to standards or guidance."
      />
      <section className="section">
        <div className="section-inner content-block">
          <h2>Operator information to publish</h2>
          <ul className="content-list">
            <li>Accreditation requirements, forms, and quality management guidance.</li>
            <li>Approved operator directory with organization profiles and public contact links.</li>
            <li>Reporting templates for activity updates, progress reporting, and incident reporting.</li>
            <li>National standards, technical notes, and coordination meeting resources.</li>
          </ul>
        </div>
      </section>
    </>
  );
}
