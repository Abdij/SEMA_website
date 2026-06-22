import { PageHero } from "@/components/PageHero";

export const metadata = {
  title: "About",
};

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="Institution"
        title="About SEMA"
        text="The Somalia Explosive Management Authority is the national institution responsible for leading and coordinating mine action and explosive hazard management across Somalia."
      />
      <section className="section">
        <div className="section-inner feature-row">
          <div className="content-block">
            <h2>National leadership for safer communities</h2>
            <p>
              SEMA works with government institutions, Federal Member States,
              operators, communities, and international partners to strengthen
              public safety, improve coordination, support information
              management, and reduce the impact of explosive hazards on people,
              services, livelihoods, and development.
            </p>
            <p>
              SEMA provides official public information through its national
              website, including mine action news, policy publications, data
              dashboards, data access services, and direct contact channels for
              government institutions, partners, and the public.
            </p>
          </div>
          <div className="feature-image" />
        </div>
      </section>
    </>
  );
}
