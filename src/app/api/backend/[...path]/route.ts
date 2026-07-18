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
  headers.delete("connection");
  headers.delete("accept-encoding");

  const method = request.method.toUpperCase();
  const hasBody = !["GET", "HEAD"].includes(method);
  
  let body: any = undefined;
  if (hasBody) {
    const contentType = headers.get("content-type") || "";
    if (contentType.includes("multipart/form-data")) {
      body = await request.formData();
      // Delete conflicting headers so fetch can recreate them properly for the new FormData
      headers.delete("content-type");
      headers.delete("content-length");
    } else {
      body = await request.arrayBuffer();
      // Do not delete content-length for arrayBuffer as it maintains exact match
    }
  } else {
    headers.delete("content-length");
  }

  let backendResponse: Response;
  try {
    backendResponse = await fetch(backendUrl, {
      method,
      headers,
      body,
      cache: "no-store",
    });
  } catch (err: any) {
    // If primary backend is unreachable, optionally try a fallback URL.
    const fallback = process.env.NEXT_PUBLIC_API_FALLBACK_URL;
    if (fallback) {
      try {
        const fallbackUrl = new URL(backendUrl.pathname + backendUrl.search, fallback);
        // eslint-disable-next-line no-console
        console.warn(`Primary backend unreachable; trying fallback ${fallbackUrl}`);
        backendResponse = await fetch(fallbackUrl, {
          method,
          headers,
          body,
          cache: "no-store",
        });
      } catch (fallbackErr: any) {
        return NextResponse.json(
          { message: "Unable to reach backend API (primary and fallback).", error: String(fallbackErr?.message || fallbackErr) },
          { status: 502 }
        );
      }
    } else {
      return NextResponse.json(
        { message: "Unable to reach backend API.", error: String(err?.message || err) },
        { status: 502 }
      );
    }
  }

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
