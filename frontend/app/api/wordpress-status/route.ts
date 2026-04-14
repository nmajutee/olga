import { NextResponse } from "next/server";
import {
  fetchWordPress,
  inspectWordPressResponse,
} from "@/lib/wordpress-request";

const wpUrl = process.env.WORDPRESS_API_URL;

export async function GET() {
  if (!wpUrl) {
    return NextResponse.json(
      {
        ok: false,
        configured: false,
        message: "WORDPRESS_API_URL is not set.",
      },
      { status: 500 }
    );
  }

  try {
    const checkedUrl = `${wpUrl}/wp-json/wp/v2/posts?per_page=1&_embed=author`;
    const res = await fetchWordPress({
      url: checkedUrl,
      revalidate: 0,
    });

    const responseIssue = inspectWordPressResponse(res);
    if (responseIssue) {
      return NextResponse.json(
        {
          ok: false,
          configured: true,
          endpoint: wpUrl,
          checkedUrl,
          blocked: responseIssue.blocked,
          status: responseIssue.status,
          contentType: responseIssue.contentType,
          message: responseIssue.message,
        },
        { status: responseIssue.blocked ? 503 : 502 }
      );
    }

    const payload = JSON.parse(res.body) as Array<{
      slug?: string;
      date?: string;
      title?: { rendered?: string };
    }>;
    const firstPost = payload[0];

    return NextResponse.json({
      ok: true,
      configured: true,
      endpoint: wpUrl,
      checkedUrl,
      status: res.status,
      contentType: res.contentType,
      postsVisible: payload.length > 0,
      samplePost: firstPost
        ? {
            slug: firstPost.slug ?? null,
            title: firstPost.title?.rendered ?? null,
            date: firstPost.date ?? null,
          }
        : null,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown connection error";

    return NextResponse.json(
      {
        ok: false,
        configured: true,
        endpoint: wpUrl,
        message,
      },
      { status: 502 }
    );
  }
}
