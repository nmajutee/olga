import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { getPreferredLocale } from "@/lib/locale";

export default async function RootBlogIndexPage() {
  const cookieStore = await cookies();
  const headerStore = await headers();
  const locale = getPreferredLocale({
    cookieLocale: cookieStore.get("NEXT_LOCALE")?.value,
    acceptLanguage: headerStore.get("accept-language"),
  });

  redirect(`/${locale}/blog`);
}