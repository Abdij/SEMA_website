import { DashboardEmbed } from "@/components/DashboardEmbed";
import { PageHero } from "@/components/PageHero";
import { getDashboardEmbeds } from "@/lib/db";

export const metadata = {
  title: "Dashboards",
  description:
    "Official SEMA mine action dashboards covering explosive hazard contamination, survey and clearance progress, risk education activities, and national performance indicators.",
};

export const dynamic = "force-dynamic";

export default async function DashboardsPage() {
  const dashboardEmbeds = await getDashboardEmbeds();

  return (
    <>
      <PageHero
        eyebrow="Dashboards"
        title="Mine action data and performance dashboards."
        text="Access official SEMA dashboards covering explosive hazard contamination, survey and clearance progress, risk education activities, and national mine action indicators across Somalia."
      />
      {dashboardEmbeds.map((dashboard) => (
        <DashboardEmbed key={dashboard.title} {...dashboard} />
      ))}
    </>
  );
}
