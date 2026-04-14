type RestRequestOptions = {
  url: string;
  revalidate?: number;
};

export type RestResponse = {
  status: number;
  body: string;
  contentType: string | null;
};

export type WordPressResponseIssue = {
  blocked: boolean;
  message: string;
  status: number;
  contentType: string | null;
};

export function inspectWordPressResponse(
  response: RestResponse
): WordPressResponseIssue | null {
  const contentType = response.contentType?.toLowerCase() ?? "";
  const body = response.body.toLowerCase();
  const returnedHtml =
    contentType.includes("text/html") ||
    body.includes("<!doctype html") ||
    body.includes("<html");
  const looksLikeBrowserChallenge =
    body.includes("checking your browser before accessing") ||
    body.includes("enable javascript and cookies to continue") ||
    body.includes("please stand by, while we are checking your browser") ||
    body.includes("cf-browser-verification") ||
    body.includes("hcdn");

  if (looksLikeBrowserChallenge) {
    return {
      blocked: true,
      message:
        "WordPress is returning a browser challenge instead of JSON. Allow server-side access to /wp-json/* on the WordPress host.",
      status: response.status,
      contentType: response.contentType,
    };
  }

  if (response.status < 200 || response.status >= 300) {
    return {
      blocked: response.status === 401 || response.status === 403 || response.status === 429,
      message: returnedHtml
        ? `WordPress responded with HTTP ${response.status} and returned HTML instead of JSON.`
        : `WordPress responded with HTTP ${response.status}.`,
      status: response.status,
      contentType: response.contentType,
    };
  }

  if (!contentType.includes("application/json")) {
    return {
      blocked: returnedHtml,
      message: returnedHtml
        ? "WordPress returned HTML instead of JSON."
        : `WordPress returned unexpected content type ${response.contentType ?? "unknown"}.`,
      status: response.status,
      contentType: response.contentType,
    };
  }

  return null;
}

export async function fetchWordPress({
  url,
  revalidate = 300,
}: RestRequestOptions): Promise<RestResponse> {
  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    next: { revalidate },
  });

  const body = await response.text();

  return {
    status: response.status,
    body,
    contentType: response.headers.get("content-type"),
  };
}
