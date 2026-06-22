import Link from "next/link";
import { NewsImage } from "@/components/NewsImage";
import { PageHero } from "@/components/PageHero";
import { getNewsPosts } from "@/lib/db";

export const metadata = {
  title: "News",
};

export const dynamic = "force-dynamic";

export default async function NewsPage() {
  const newsPosts = await getNewsPosts();

  return (
    <>
      <PageHero
        eyebrow="News and updates"
        title="Official updates, source notes, public safety information, and publication announcements."
        text="This section is prepared for SEMA news publishing. Starter posts use source-backed information and should be replaced or expanded by approved SEMA communications."
      />
      <section className="section">
        <div className="section-inner grid three">
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
      </section>
    </>
  );
}
