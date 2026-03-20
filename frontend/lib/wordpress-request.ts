import http from "node:http";
import https from "node:https";

type GraphQLTransportOptions = {
  endpoint: string;
  hostHeader?: string;
  body: string;
};

export type GraphQLTransportResponse = {
  status: number;
  body: string;
};

export function postToWordPress({
  endpoint,
  hostHeader,
  body
}: GraphQLTransportOptions): Promise<GraphQLTransportResponse> {
  const url = new URL(endpoint);
  const isHttps = url.protocol === "https:";
  const requestImpl = isHttps ? https.request : http.request;

  return new Promise((resolve, reject) => {
    const request = requestImpl(
      {
        protocol: url.protocol,
        hostname: url.hostname,
        port: url.port ? Number(url.port) : isHttps ? 443 : 80,
        path: `${url.pathname}${url.search}`,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(body),
          ...(hostHeader ? { Host: hostHeader } : {})
        }
      },
      (response) => {
        let responseBody = "";

        response.on("data", (chunk) => {
          responseBody += chunk;
        });

        response.on("end", () => {
          resolve({
            status: response.statusCode ?? 500,
            body: responseBody
          });
        });
      }
    );

    request.on("error", reject);
    request.write(body);
    request.end();
  });
}