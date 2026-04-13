import { NextResponse } from "next/server";
import { fetchWordPress } from "@/lib/wordpress-request";

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
    const res = await fetchWordPress({
      url: `${wpUrl}/wp-json`,
    });

    if (res.status < 200 || res.status >= 300) {
      return NextResponse.json(
        {
          ok: false,
          configured: true,
          endpoint: wpUrl,
          message: `WordPress responded with HTTP ${res.status}.`,
        },
        { status: 502 }
      );
    }

    const payload = JSON.parse(res.body) as {
      name?: string;
      url?: string;
    };

    return NextResponse.json({
      ok: true,
      configured: true,
      endpoint: wpUrl,
      siteTitle: payload.name ?? null,
      siteUrl: payload.url ?? null,
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