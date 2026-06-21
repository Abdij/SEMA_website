import { DashboardEmbed } from "@/components/DashboardEmbed";
import { PageHero } from "@/components/PageHero";
import { dashboardEmbeds } from "@/lib/content";

export const metadata = {
  title: "Dashboards",
};

export default function DashboardsPage() {
  return (
    <>
      <PageHero
        eyebrow="Dashboards"
        title="ArcGIS and Power BI dashboards for public-safe reporting."
        text="This page is prepared for SEMA dashboards. Configure the ArcGIS and Power BI embed URLs in Vercel when approved public dashboards are ready."
      />
      <section className="section">
        <div className="section-inner content-block">
          <h2>Dashboard publication rules</h2>
          <ul className="content-list">
            <li>Use only public-safe dashboards for anonymous public embeds.</li>
            <li>Do not publish exact sensitive hazard coordinates, personal data, or restricted partner data.</li>
            <li>Use secure embed or authenticated access for internal operational dashboards.</li>
            <li>Document the source, update frequency, owner, and approval status for each dashboard.</li>
          </ul>
        </div>
      </section>
      {dashboardEmbeds.map((dashboard) => (
        <DashboardEmbed key={dashboard.title} {...dashboard} />
      ))}
    </>
  );
}
