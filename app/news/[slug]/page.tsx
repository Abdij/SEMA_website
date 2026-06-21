import Image from "next/image";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { newsPosts } from "@/lib/content";

type NewsArticleProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return newsPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: NewsArticleProps) {
  const { slug } = await params;
  const post = newsPosts.find((item) => item.slug === slug);

  return {
    title: post?.title || "News",
  };
}

export default async function NewsArticlePage({ params }: NewsArticleProps) {
  const { slug } = await params;
  const post = newsPosts.find((item) => item.slug === slug);

  if (!post) {
    notFound();
  }

  return (
    <article className="article">
      <span className="tag">{post.category}</span>
      <h1>{post.title}</h1>
      <p className="news-meta">{post.date}</p>
      <Image src={post.image} alt="" width={1100} height={620} priority />
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
