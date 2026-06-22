import Link from "next/link";
import { ArrowRight, BarChart3, Download, FileText, ShieldCheck } from "lucide-react";
import { NewsImage } from "@/components/NewsImage";
import { quickStats, serviceAreas } from "@/lib/content";
import { getNewsPosts } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function Home() {
  const newsPosts = await getNewsPosts();

  return (
    <>
      <section className="hero">
        <div className="hero-inner">
          <p className="eyebrow">Official public website</p>
          <h1>Somalia's national authority for explosive hazard management.</h1>
          <p>
            SEMA leads national coordination, policy oversight, information
            management, operator engagement, public reporting, and community
            safety communication across Somalia's mine action sector.
          </p>
          <div className="hero-actions">
            <Link className="button" href="/data-request">
              Request data <ArrowRight aria-hidden="true" size={18} />
            </Link>
            <Link className="button secondary" href="/dashboards">
              View dashboards <BarChart3 aria-hidden="true" size={18} />
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-inner grid four">
          {quickStats.map((stat) => (
            <div className="stat-card" key={stat.label}>
              <strong>{stat.value}</strong>
              <p>{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="band">
        <div className="section-inner feature-row">
          <div className="content-block">
            <p className="eyebrow">Public services</p>
            <h2>One official entry point for updates, documents, dashboards, and requests.</h2>
            <p>
              The rebuilt website is structured for official communication:
              news and updates, policy downloads, ArcGIS and Power BI embeds,
              convention-progress reporting, partner links, contact messages,
              and a transparent data request workflow.
            </p>
            <ul className="content-list">
              <li>Publish official SEMA news, announcements, and public safety notices.</li>
              <li>Embed public-safe dashboards from ArcGIS and Power BI.</li>
              <li>Provide downloadable policies, standards, reports, and awareness material.</li>
              <li>Receive contact messages and data requests through PostgreSQL-backed forms.</li>
            </ul>
          </div>
          <div className="feature-image" aria-label="Explosive ordnance risk education session" />
        </div>
      </section>

      <section className="section">
        <div className="section-inner">
          <div className="section-heading">
            <div>
              <p className="eyebrow">SEMA functions</p>
              <h2>Institutional focus areas</h2>
            </div>
            <Link className="text-link" href="/mandate">
              Read mandate <ArrowRight aria-hidden="true" size={16} />
            </Link>
          </div>
          <div className="grid four">
            {serviceAreas.map((area) => (
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
              <p className="eyebrow">Latest updates</p>
              <h2>News, reporting, and public information</h2>
            </div>
            <Link className="text-link" href="/news">
              All news <ArrowRight aria-hidden="true" size={16} />
            </Link>
          </div>
          <div className="grid three">
            {newsPosts.map((post) => (
              <Link className="news-card" href={`/news/${encodeURIComponent(post.slug)}`} key={post.slug}>
                <NewsImage src={post.image} alt="" width={560} height={320} />
                <div className="news-body">
                  <span className="tag">{post.category}</span>
                  <h3>{post.title}</h3>
                  <p>{post.summary}</p>
                  <p className="news-meta">{post.date}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-inner grid three">
          <Link className="card" href="/publications">
            <Download aria-hidden="true" color="#c1121f" />
            <h3>Policies and publications</h3>
            <p>Access SEMA policies, standards, treaty reports, strategies, and awareness materials.</p>
          </Link>
          <Link className="card" href="/conventions">
            <FileText aria-hidden="true" color="#c1121f" />
            <h3>Convention progress</h3>
            <p>Track progress against international obligations and link to official treaty sources.</p>
          </Link>
          <Link className="card" href="/contact">
            <ArrowRight aria-hidden="true" color="#c1121f" />
            <h3>Contact SEMA</h3>
            <p>Send official messages, media questions, coordination requests, and website feedback.</p>
          </Link>
        </div>
      </section>
    </>
  );
}
