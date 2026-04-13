type RestRequestOptions = {
  url: string;
};

export type RestResponse = {
  status: number;
  body: string;
};

export async function fetchWordPress({
  url,
}: RestRequestOptions): Promise<RestResponse> {
  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    next: { revalidate: 300 },
  });

  const body = await response.text();

  return {
    status: response.status,
    body,
  };
}