import { ContactForm } from "@/components/ContactForm";
import { PageHero } from "@/components/PageHero";

export const metadata = {
  title: "Contact",
  description:
    "Contact the Somalia Explosive Management Authority for general enquiries, media questions, coordination requests, and data access.",
};

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Contact the Somalia Explosive Management Authority."
        text="Use the official contact form for general enquiries, media questions, publications requests, coordination matters, partner communication, or website feedback."
      />
      <section className="section">
        <div className="section-inner grid two">
          <div className="content-block">
            <h2>Official contact channels</h2>
            <ul className="content-list">
              <li>
                Email:{" "}
                <a href="mailto:info@sema.gov.so" style={{ color: "inherit" }}>
                  info@sema.gov.so
                </a>
              </li>
              <li>Location: Mogadishu, Somalia</li>
              <li>
                X (Twitter):{" "}
                <a
                  href="https://x.com/SomaliaSema"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Follow SEMA on X"
                  style={{ color: "inherit" }}
                >
                  @SomaliaSema
                </a>
              </li>
              <li>
                For data access, use the dedicated{" "}
                <a href="/data-request" style={{ color: "inherit", fontWeight: 900 }}>
                  data request form
                </a>{" "}
                so your request can be tracked and processed formally.
              </li>
            </ul>
          </div>
          <div className="card">
            <h2>Send us a message</h2>
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  );
}
