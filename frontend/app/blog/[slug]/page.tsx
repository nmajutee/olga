import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { getPreferredLocale } from "@/lib/locale";

type BlogPostPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function RootBlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const cookieStore = await cookies();
  const headerStore = await headers();
  const locale = getPreferredLocale({
    cookieLocale: cookieStore.get("NEXT_LOCALE")?.value,
    acceptLanguage: headerStore.get("accept-language"),
  });

  redirect(`/${locale}/blog/${slug}`);
}