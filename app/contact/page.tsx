import { ContactForm } from "@/components/ContactForm";
import { PageHero } from "@/components/PageHero";

export const metadata = {
  title: "Contact",
};

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Contact the Somalia Explosive Management Authority."
        text="Use the official contact form for general enquiries, media questions, publications, coordination requests, partner communication, or website feedback."
      />
      <section className="section">
        <div className="section-inner grid two">
          <div className="content-block">
            <h2>Official contact channels</h2>
            <ul className="content-list">
              <li>Email: info@sema.gov.so</li>
              <li>Location: Mogadishu, Somalia</li>
              <li>For data access, use the dedicated data request form so the request can be tracked.</li>
              <li>For emergency hazard reporting, SEMA should publish a verified emergency hotline before this site goes live.</li>
            </ul>
          </div>
          <div className="card">
            <h2>Contact us form</h2>
            <p className="muted">
              Messages are intended for official correspondence and should be
              stored in PostgreSQL for tracking and follow-up.
            </p>
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  );
}
