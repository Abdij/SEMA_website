import { getTranslations } from "next-intl/server";
import { DashboardEmbed } from "@/components/DashboardEmbed";
import { PageHero } from "@/components/PageHero";
import { getDashboardEmbeds } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function DashboardsPage() {
  const t = await getTranslations("dashboards");
  const dashboardEmbeds = await getDashboardEmbeds();

  return (
    <>
      <PageHero eyebrow={t("eyebrow")} title={t("title")} text={t("text")} />
      {dashboardEmbeds.map((dashboard) => (
        <DashboardEmbed key={dashboard.id || dashboard.title} {...dashboard} />
      ))}
    </>
  );
}
