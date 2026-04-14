import Link from "next/link";
import { formatPublishDate, type WpPostSummary } from "@/lib/wordpress";

type PostCardProps = {
  post: WpPostSummary;
  locale?: string;
  readMoreLabel?: string;
};

function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export function PostCard({ post, locale = "en", readMoreLabel = "Read article" }: PostCardProps) {
  const prefix = `/${locale}`;
  return (
    <article className="blog-card">
      <Link href={`${prefix}/blog/${post.slug}`} aria-hidden="true" tabIndex={-1}>
        <div className="blog-card-visual">
          <span className="blog-card-visual-text" aria-hidden="true">✦</span>
        </div>
      </Link>
      <div className="blog-card-body">
        <div className="blog-card-meta">
          <time dateTime={post.date}>{formatPublishDate(post.date, locale)}</time>
          <span aria-hidden="true">·</span>
          <span>{post.authorName}</span>
        </div>
        <h3 className="blog-card-title">
          <Link href={`${prefix}/blog/${post.slug}`}>{post.title}</Link>
        </h3>
        <p className="blog-card-excerpt">{stripHtml(post.excerpt)}</p>
        <Link href={`${prefix}/blog/${post.slug}`} className="blog-card-link">
          {readMoreLabel}
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </article>
  );
}