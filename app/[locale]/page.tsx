import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Download,
  FileText,
  Map,
  Search,
  ShieldCheck,
  Users,
} from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/lib/navigation";
import { NewsImage } from "@/components/NewsImage";
import { getNewsPosts } from "@/lib/db";

export const dynamic = "force-dynamic";

const indicators = [
  { value: "2,111,131", icon: Users, accent: "blue" },
  { value: "123 Million m²", icon: Map, accent: "teal" },
  { value: "331", icon: AlertTriangle, accent: "red" },
  { value: "201", icon: Search, accent: "blue" },
  { value: "1,684", icon: Activity, accent: "red" },
] as const;

export default async function Home() {
  const t = await getTranslations("home");
  const nav = await getTranslations("nav");
  const newsPosts = await getNewsPosts();

  const funcAreas = Array.from({ length: 4 }, (_, i) => ({
    title: t(`funcArea${i}Title`),
    text: t(`funcArea${i}Text`),
  }));

  return (
    <>
      <section className="hero">
        <div className="hero-inner">
          <p className="eyebrow">{t("heroEyebrow")}</p>
          <h1>{t("heroTitle")}</h1>
          <p>{t("heroText")}</p>
          <div className="hero-actions">
            <Link className="button" href="/dashboards">
              {t("viewDashboards")} <BarChart3 aria-hidden="true" size={18} />
            </Link>
            <Link className="button secondary" href="/eore-resources">
              {nav("eoreResources")} <Download aria-hidden="true" size={18} />
            </Link>
            <Link className="button secondary" href="/contact">
              {t("contactSema")} <ArrowRight aria-hidden="true" size={18} />
            </Link>
          </div>
        </div>
      </section>

      <section className="band">
        <div className="section-inner">
          <div className="section-heading">
            <div>
              <p className="eyebrow">{t("indicatorsEyebrow")}</p>
              <h2>{t("indicatorsTitle")}</h2>
              <p className="muted" style={{ marginTop: "0.4rem" }}>
                {t("indicatorsText")}
              </p>
            </div>
          </div>
          <div className="indicators-grid">
            {indicators.map((indicator, i) => (
              <article className="indicator-card" key={i}>
                <span className={`indicator-icon indicator-icon--${indicator.accent}`}>
                  <indicator.icon aria-hidden="true" size={22} />
                </span>
                <strong className="indicator-value">{indicator.value}</strong>
                <p className="indicator-label">{t(`indicator${i}`)}</p>
              </article>
            ))}
          </div>
          <p className="indicators-source">{t("indicatorsSource")}</p>
        </div>
      </section>

      <section className="band">
        <div className="section-inner feature-row">
          <div className="content-block">
            <p className="eyebrow">{t("featuresEyebrow")}</p>
            <h2>{t("featuresTitle")}</h2>
            <p>{t("featuresText")}</p>
            <ul className="content-list">
              {[0, 1, 2, 3].map((i) => (
                <li key={i}>{t(`feature${i}`)}</li>
              ))}
            </ul>
          </div>
          <div className="feature-image" aria-label="Explosive ordnance risk education session" />
        </div>
      </section>

      <section className="section">
        <div className="section-inner">
          <div className="section-heading">
            <div>
              <p className="eyebrow">{t("functionsEyebrow")}</p>
              <h2>{t("functionsTitle")}</h2>
            </div>
            <Link className="text-link" href="/mandate">
              {t("readMandate")} <ArrowRight aria-hidden="true" size={16} />
            </Link>
          </div>
          <div className="grid four">
            {funcAreas.map((area) => (
              <article className="card" key={area.title}>
                <ShieldCheck aria-hidden="true" color="#126aa4" />
                <h3>{area.title}</h3>
                <p>{area.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="band">
        <div className="section-inner">
          <div className="section-heading">
            <div>
              <p className="eyebrow">{t("latestEyebrow")}</p>
              <h2>{t("latestTitle")}</h2>
            </div>
            <Link className="text-link" href="/news">
              {t("allNews")} <ArrowRight aria-hidden="true" size={16} />
            </Link>
          </div>
          {newsPosts.length > 0 ? (
            <div className="grid three">
              {newsPosts.map((post) => (
                <Link className="news-card" href={`/news/${encodeURIComponent(post.slug)}`} key={post.slug}>
                  <NewsImage src={post.image} alt={post.title} width={560} height={320} />
                  <div className="news-body">
                    <span className="tag">{post.category}</span>
                    <h3>{post.title}</h3>
                    <p>{post.summary}</p>
                    <p className="news-meta">{post.date}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="muted">{t("noNews")}</p>
          )}
        </div>
      </section>

      <section className="section">
        <div className="section-inner grid three">
          <Link className="card" href="/eore-resources">
            <Download aria-hidden="true" color="#c1121f" />
            <h3>{t("policiesTitle")}</h3>
            <p>{t("policiesText")}</p>
          </Link>
          <Link className="card" href="/conventions">
            <FileText aria-hidden="true" color="#c1121f" />
            <h3>{t("conventionTitle")}</h3>
            <p>{t("conventionText")}</p>
          </Link>
          <Link className="card" href="/contact">
            <ArrowRight aria-hidden="true" color="#c1121f" />
            <h3>{t("contactCardTitle")}</h3>
            <p>{t("contactCardText")}</p>
          </Link>
        </div>
      </section>
    </>
  );
}
