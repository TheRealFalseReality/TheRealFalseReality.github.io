import { createRequestHandler } from "@react-router/server";
import type { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";

// @ts-expect-error - Vite virtual module
import * as build from "virtual:react-router/server-build";

const handler = createRequestHandler(build);

export async function handler(
  event: APIGatewayEvent
): Promise<APIGatewayProxyResult> {
  const { headers, httpMethod, rawUrl, body } = event;

  const requestHeaders = new Headers();
  for (const [key, value] of Object.entries(headers)) {
    if (value) {
      requestHeaders.set(key, value);
    }
  }

  const request = new Request(rawUrl, {
    method: httpMethod,
    headers: requestHeaders,
    body: body ? Buffer.from(body, "base64") : undefined,
  });

  const response = await handler(request);

  const responseHeaders: { [header: string]: boolean | number | string } = {};
  response.headers.forEach((value, key) => {
    responseHeaders[key] = value;
  });

  return {
    statusCode: response.status,
    headers: responseHeaders,
    body: await response.text(),
  };
}