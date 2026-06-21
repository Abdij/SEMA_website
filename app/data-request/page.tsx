import { DataRequestForm } from "@/components/DataRequestForm";
import { PageHero } from "@/components/PageHero";

export const metadata = {
  title: "Data Request",
};

export default function DataRequestPage() {
  return (
    <>
      <PageHero
        eyebrow="Data request"
        title="Request SEMA data through a transparent review process."
        text="Government institutions, operators, researchers, donors, media, humanitarian partners, and the public can request mine action information through this official form."
      />
      <section className="section">
        <div className="section-inner grid two">
          <div className="content-block">
            <h2>How the process works</h2>
            <div className="timeline">
              {[
                ["1. Submit request", "Complete the form with the requested dataset, geography, time period, purpose, and preferred format."],
                ["2. Acknowledgement", "SEMA receives the request and can issue a reference number for follow-up."],
                ["3. Review", "The request is reviewed for sensitivity, data availability, mandate, intended use, and release conditions."],
                ["4. Clarification", "SEMA may contact the requester for more details or recommend a public alternative."],
                ["5. Decision and delivery", "Approved requests can be fulfilled by email, secure download link, dashboard access, or data-sharing agreement."],
              ].map(([title, text]) => (
                <article className="step" key={title}>
                  <time>{title.split(".")[0]}</time>
                  <div>
                    <h3>{title}</h3>
                    <p>{text}</p>
                  </div>
                </article>
              ))}
            </div>
            <h2>Data that may be restricted</h2>
            <ul className="content-list">
              <li>Exact hazard coordinates or data that could create security or public safety risks.</li>
              <li>Personally identifiable information or victim/survivor records.</li>
              <li>Unpublished operational records or partner-restricted datasets.</li>
              <li>Information requiring formal authorization or a data-sharing agreement.</li>
            </ul>
          </div>
          <div className="card">
            <h2>Data request form</h2>
            <p className="muted">
              Submit enough detail for SEMA to understand the data need, intended
              use, requested format, and any deadline.
            </p>
            <DataRequestForm />
          </div>
        </div>
      </section>
    </>
  );
}
