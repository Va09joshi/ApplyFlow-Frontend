import { NextResponse } from "next/server";

const getBackendBaseUrl = () => {
  return process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "";
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const credential = body?.idToken || body?.credential || body?.token;

    if (!credential || typeof credential !== "string") {
      return NextResponse.json(
        { message: "Google credential is missing." },
        { status: 400 }
      );
    }

    const backendBaseUrl = getBackendBaseUrl();
    if (!backendBaseUrl) {
      return NextResponse.json(
        { message: "Backend API URL is not configured." },
        { status: 500 }
      );
    }

    const backendResponse = await fetch(`${backendBaseUrl.replace(/\/$/, "")}/api/v1/auth/google`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        idToken: credential,
        credential,
        token: credential,
      }),
      cache: "no-store",
    });

    const responseText = await backendResponse.text();
    const contentType = backendResponse.headers.get("content-type") || "application/json; charset=utf-8";
    const responseHeaders = new Headers({
      "Content-Type": contentType,
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

    return new NextResponse(responseText, {
      status: backendResponse.status,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("Google auth proxy error:", error);
    return NextResponse.json(
      { message: "Unable to complete Google sign-in." },
      { status: 500 }
    );
  }
}
