import { PostEditor } from "@/components/admin/post-editor";
import { getSettings } from "@/lib/settings";
import type { PostFormValues } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

const EMPTY: PostFormValues = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  status: "draft",
  coverImageUrl: "",
  coverImageAlt: "",
  metaTitle: "",
  metaDescription: "",
  focusKeyword: "",
  canonicalUrl: "",
  noindex: false,
  tags: [],
};

export default async function NewPostPage() {
  const settings = await getSettings();

  return (
    <PostEditor
      isNew
      initial={EMPTY}
      siteUrl={settings.site_url}
      defaultTone={settings.ai_default_tone}
      defaultWords={settings.ai_default_words}
    />
  );
}
