import { notFound } from "next/navigation";
import { PostEditor } from "@/components/admin/post-editor";
import { getPostById } from "@/lib/posts";
import { getSettings } from "@/lib/settings";
import type { PostFormValues } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [post, settings] = await Promise.all([getPostById(id), getSettings()]);

  if (!post) notFound();

  const initial: PostFormValues = {
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    content: post.content,
    status: post.status,
    coverImageUrl: post.coverImageUrl ?? "",
    coverImageAlt: post.coverImageAlt ?? "",
    metaTitle: post.metaTitle ?? "",
    metaDescription: post.metaDescription ?? "",
    focusKeyword: post.focusKeyword ?? "",
    canonicalUrl: post.canonicalUrl ?? "",
    noindex: post.noindex,
    tags: post.tags,
  };

  return (
    <PostEditor
      isNew={false}
      initial={initial}
      siteUrl={settings.site_url}
      defaultTone={settings.ai_default_tone}
      defaultWords={settings.ai_default_words}
    />
  );
}
