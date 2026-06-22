import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { NewsImage } from "@/components/NewsImage";
import { getNewsPostBySlug } from "@/lib/db";

type NewsArticleProps = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: NewsArticleProps) {
  const { slug } = await params;
  const post = await getNewsPostBySlug(slug);

  return {
    title: post?.title || "News",
  };
}

export default async function NewsArticlePage({ params }: NewsArticleProps) {
  const { slug } = await params;
  const post = await getNewsPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <article className="article">
      <span className="tag">{post.category}</span>
      <h1>{post.title}</h1>
      <p className="news-meta">{post.date}</p>
      <NewsImage src={post.image} alt="" width={1100} height={620} priority />
      {post.body.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
      {post.sourceUrl ? (
        <a className="text-link" href={post.sourceUrl} target="_blank" rel="noreferrer">
          Source: {post.sourceLabel || post.sourceUrl}
          <ExternalLink aria-hidden="true" size={16} />
        </a>
      ) : null}
    </article>
  );
}
