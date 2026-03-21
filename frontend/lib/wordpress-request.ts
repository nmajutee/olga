type GraphQLTransportOptions = {
  endpoint: string;
  hostHeader?: string;
  body: string;
};

export type GraphQLTransportResponse = {
  status: number;
  body: string;
};

export async function postToWordPress({
  endpoint,
  hostHeader,
  body
}: GraphQLTransportOptions): Promise<GraphQLTransportResponse> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (hostHeader) {
    headers["Host"] = hostHeader;
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers,
    body,
  });

  const responseBody = await response.text();

  return {
    status: response.status,
    body: responseBody,
  };
}