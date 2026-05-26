import { NextResponse } from "next/server";

const getBackendBaseUrl = () => {
  return process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "";
};

const buildBackendUrl = (request: Request) => {
  const backendBaseUrl = getBackendBaseUrl();
  const requestUrl = new URL(request.url);
  const backendPath = requestUrl.pathname.replace(/^\/api\/backend/, "") || "/";
  const backendUrl = new URL(backendPath + requestUrl.search, backendBaseUrl);
  return { backendUrl, backendBaseUrl };
};

const proxyRequest = async (request: Request) => {
  const { backendUrl, backendBaseUrl } = buildBackendUrl(request);

  if (!backendBaseUrl) {
    return NextResponse.json(
      { message: "Backend API URL is not configured." },
      { status: 500 }
    );
  }

  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.delete("content-length");
  headers.delete("connection");
  headers.delete("accept-encoding");

  const method = request.method.toUpperCase();
  const hasBody = !["GET", "HEAD"].includes(method);
  const body = hasBody ? await request.arrayBuffer() : undefined;

  const backendResponse = await fetch(backendUrl, {
    method,
    headers,
    body,
    cache: "no-store",
  });

  const responseHeaders = new Headers({
    "Content-Type": backendResponse.headers.get("content-type") || "application/json; charset=utf-8",
    "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
  });

  type HeadersWithSetCookie = Headers & { getSetCookie?: () => string[] };
  const headersWithSetCookie = backendResponse.headers as HeadersWithSetCookie;
  const setCookieHeaders = typeof headersWithSetCookie.getSetCookie === "function"
    ? headersWithSetCookie.getSetCookie()
    : [];
  for (const cookie of setCookieHeaders) {
    responseHeaders.append("Set-Cookie", cookie);
  }

  const responseBody = await backendResponse.text();
  return new NextResponse(responseBody, {
    status: backendResponse.status,
    headers: responseHeaders,
  });
};

export async function GET(request: Request) {
  return proxyRequest(request);
}

export async function POST(request: Request) {
  return proxyRequest(request);
}

export async function PUT(request: Request) {
  return proxyRequest(request);
}

export async function PATCH(request: Request) {
  return proxyRequest(request);
}

export async function DELETE(request: Request) {
  return proxyRequest(request);
}

export async function OPTIONS(request: Request) {
  return proxyRequest(request);
}
