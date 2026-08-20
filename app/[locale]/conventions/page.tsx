import {
  CalendarCheck,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileSignature,
  RefreshCcw,
  ShieldCheck,
  Target,
} from "lucide-react";
import { getTranslations } from "next-intl/server";
import { PageHero } from "@/components/PageHero";
import {
  clusterConventionMilestones,
  conventionMilestones,
  officialSources,
} from "@/lib/content";

export const revalidate = 86400;

const MILESTONE_ICONS: Record<string, typeof FileSignature> = {
  signature: FileSignature,
  shield: ShieldCheck,
  extension: RefreshCcw,
  target: Target,
  check: CheckCircle2,
};

const ACCESSION_DATE = new Date("2012-04-16");
const DEADLINE_DATE = new Date("2027-10-31");

export default async function ConventionsPage() {
  const t = await getTranslations("conventions");

  const now = Date.now();
  const totalSpan = DEADLINE_DATE.getTime() - ACCESSION_DATE.getTime();
  const elapsed = now - ACCESSION_DATE.getTime();
  const progressPct = Math.min(100, Math.max(0, (elapsed / totalSpan) * 100));
  const daysRemaining = Math.max(
    0,
    Math.ceil((DEADLINE_DATE.getTime() - now) / (1000 * 60 * 60 * 24)),
  );

  const stats = [
    { icon: CalendarCheck, value: "2012", label: t("statAccession") },
    { icon: RefreshCcw, value: "2022", label: t("statExtension") },
    { icon: Target, value: "2027", label: t("statDeadline") },
    { icon: Clock, value: daysRemaining.toLocaleString(), label: t("statDaysLeft") },
  ];

  return (
    <>
      <PageHero eyebrow={t("eyebrow")} title={t("title")} text={t("text")} />

      <section className="section">
        <div className="section-inner">
          <div className="grid four">
            {stats.map((stat) => (
              <div className="convo-stat" key={stat.label}>
                <span className="convo-stat-icon">
                  <stat.icon aria-hidden="true" size={24} />
                </span>
                <div>
                  <strong>{stat.value}</strong>
                  <span>{stat.label}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="convo-progress">
            <p className="muted" style={{ marginBottom: "0.5rem", fontWeight: 700 }}>
              {t("progressLabel")}
            </p>
            <div className="convo-progress-track">
              <div className="convo-progress-fill" style={{ width: `${progressPct}%` }} />
              <span
                className="convo-progress-marker"
                style={{ left: `${((2022 - 2012) / 15.5) * 100}%` }}
                title={t("statExtension")}
              />
            </div>
            <div className="convo-progress-labels">
              <span>{t("progressStart")}</span>
              <span>{t("progressEnd")}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="band">
        <div className="section-inner grid two">
          <div>
            <p className="eyebrow">{t("apmineEyebrow")}</p>
            <h2>{t("apmineTitle")}</h2>
            <div className="convo-timeline">
              {conventionMilestones.map((item) => {
                const Icon = MILESTONE_ICONS[item.icon] ?? CalendarCheck;
                const isUpcoming = item.status === "upcoming";
                return (
                  <article
                    className={`convo-item${isUpcoming ? " is-upcoming" : ""}`}
                    key={`${item.date}-${item.title}`}
                  >
                    <span className="convo-node">
                      <Icon aria-hidden="true" size={24} />
                    </span>
                    <div className="convo-body">
                      <span className={`convo-badge${isUpcoming ? " is-upcoming" : ""}`}>
                        {isUpcoming ? t("badgeUpcoming") : t("badgeComplete")}
                      </span>
                      <time>{item.date}</time>
                      <h3>{item.title}</h3>
                      <p>{item.text}</p>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
          <div>
            <p className="eyebrow">{t("clusterEyebrow")}</p>
            <h2>{t("clusterTitle")}</h2>
            <div className="convo-timeline">
              {clusterConventionMilestones.map((item) => {
                const Icon = MILESTONE_ICONS[item.icon] ?? CalendarCheck;
                const isUpcoming = item.status === "upcoming";
                return (
                  <article
                    className={`convo-item${isUpcoming ? " is-upcoming" : ""}`}
                    key={`${item.date}-${item.title}`}
                  >
                    <span className="convo-node">
                      <Icon aria-hidden="true" size={24} />
                    </span>
                    <div className="convo-body">
                      <span className={`convo-badge${isUpcoming ? " is-upcoming" : ""}`}>
                        {isUpcoming ? t("badgeUpcoming") : t("badgeComplete")}
                      </span>
                      <time>{item.date}</time>
                      <h3>{item.title}</h3>
                      <p>{item.text}</p>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-inner">
          <div className="section-heading">
            <div>
              <p className="eyebrow">{t("sourcesEyebrow")}</p>
              <h2>{t("sourcesTitle")}</h2>
            </div>
          </div>
          <div className="grid three">
            {officialSources.map((source) => (
              <a className="card" href={source.href} target="_blank" rel="noreferrer" key={source.href}>
                <h3>{source.label}</h3>
                <p className="text-link">
                  {t("openReference")} <ExternalLink aria-hidden="true" size={16} />
                </p>
              </a>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
