import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { NewsImage } from "@/components/NewsImage";
import { PageHero } from "@/components/PageHero";
import { getNewsPosts } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function NewsPage() {
  const t = await getTranslations("news");
  const newsPosts = await getNewsPosts();

  return (
    <>
      <PageHero eyebrow={t("eyebrow")} title={t("title")} text={t("text")} />
      <section className="section">
        {newsPosts.length > 0 ? (
          <div className="section-inner grid three">
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
          <div className="section-inner">
            <p className="muted">{t("empty")}</p>
          </div>
        )}
      </section>
    </>
  );
}
