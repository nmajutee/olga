import { NextResponse } from "next/server";
import { postToWordPress } from "@/lib/wordpress-request";

const endpoint = process.env.WORDPRESS_GRAPHQL_ENDPOINT;
const wordpressHostHeader = process.env.WORDPRESS_HOST_HEADER;

export async function GET() {
  if (!endpoint) {
    return NextResponse.json(
      {
        ok: false,
        configured: false,
        message: "WORDPRESS_GRAPHQL_ENDPOINT is not set."
      },
      { status: 500 }
    );
  }

  try {
    const response = await postToWordPress({
      endpoint,
      hostHeader: wordpressHostHeader,
      body: JSON.stringify({
        query: `
          query WordPressStatus {
            generalSettings {
              title
              url
            }
          }
        `
      })
    });

    if (response.status < 200 || response.status >= 300) {
      return NextResponse.json(
        {
          ok: false,
          configured: true,
          endpoint,
          hostHeader: wordpressHostHeader ?? null,
          message: `WordPress responded with HTTP ${response.status}.`
        },
        { status: 502 }
      );
    }

    const payload = JSON.parse(response.body) as {
      data?: {
        generalSettings?: {
          title?: string;
          url?: string;
        };
      };
      errors?: Array<{ message: string }>;
    };

    if (payload.errors?.length) {
      return NextResponse.json(
        {
          ok: false,
          configured: true,
          endpoint,
          hostHeader: wordpressHostHeader ?? null,
          message: payload.errors.map((entry) => entry.message).join("; ")
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      ok: true,
      configured: true,
      endpoint,
      hostHeader: wordpressHostHeader ?? null,
      siteTitle: payload.data?.generalSettings?.title ?? null,
      siteUrl: payload.data?.generalSettings?.url ?? null
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown connection error";

    return NextResponse.json(
      {
        ok: false,
        configured: true,
        endpoint,
        hostHeader: wordpressHostHeader ?? null,
        message
      },
      { status: 502 }
    );
  }
}