import { PageHero } from "@/components/PageHero";

export const metadata = {
  title: "Leadership",
  description:
    "Senior leadership of the Somalia Explosive Management Authority (SEMA), the Federal Government institution coordinating national mine action.",
};

const leaders = [
  {
    role: "Director General",
    name: "Director General",
    bio: "The Director General provides strategic direction and national leadership for Somalia's mine action coordination, reporting to the Federal Government and overseeing all SEMA operations and programmes.",
  },
  {
    role: "Deputy Director General",
    name: "Deputy Director General",
    bio: "The Deputy Director General supports the Director General in institutional oversight, inter-agency coordination, and representation at national and international forums.",
  },
  {
    role: "Director of Operations",
    name: "Director of Operations",
    bio: "The Director of Operations oversees field coordination, operator management, clearance task prioritisation, and quality assurance across all mine action operations in Somalia.",
  },
  {
    role: "Director of Information Management",
    name: "Director of Information Management",
    bio: "The Director of Information Management leads SEMA's national data systems, IMSMA coordination, reporting infrastructure, and open data initiatives.",
  },
  {
    role: "Director of Standards & Quality",
    name: "Director of Standards & Quality",
    bio: "The Director of Standards & Quality establishes accreditation requirements, monitors compliance, and maintains national mine action standards aligned with IMAS and treaty obligations.",
  },
  {
    role: "Director of EORE & Victim Assistance",
    name: "Director of EORE & Victim Assistance",
    bio: "The Director of EORE & Victim Assistance coordinates explosive ordnance risk education programmes and national victim assistance services across Federal Member States.",
  },
];

export default function LeadershipPage() {
  return (
    <>
      <PageHero
        eyebrow="Leadership"
        title="Senior Management of SEMA"
        text="SEMA is led by senior government officials appointed by the Federal Government of Somalia to direct national mine action coordination, policy, and institutional oversight."
      />
      <section className="section">
        <div className="section-inner">
          <div className="leadership-grid">
            {leaders.map((leader) => (
              <article className="leader-card" key={leader.role}>
                <div className="leader-portrait" aria-hidden="true">
                  Portrait
                </div>
                <div className="leader-info">
                  <span className="leader-role">{leader.role}</span>
                  <h3 className="leader-name">{leader.name}</h3>
                  <p className="leader-bio">{leader.bio}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
