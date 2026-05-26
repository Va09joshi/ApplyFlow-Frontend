import { NextResponse } from "next/server";

const getBackendBaseUrl = () => {
  return process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "";
};

export async function GET(request: Request) {
  try {
    const backendBaseUrl = getBackendBaseUrl();

    if (!backendBaseUrl) {
      return NextResponse.json(
        { message: "Backend API URL is not configured." },
        { status: 500 }
      );
    }

    const cookieHeader = request.headers.get("cookie") || "";
    const authorizationHeader = request.headers.get("authorization") || "";

    const backendResponse = await fetch(`${backendBaseUrl.replace(/\/$/, "")}/api/v1/users/me`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        ...(cookieHeader ? { Cookie: cookieHeader } : {}),
        ...(authorizationHeader ? { Authorization: authorizationHeader } : {}),
      },
      cache: "no-store",
    });

    const responseText = await backendResponse.text();
    const contentType = backendResponse.headers.get("content-type") || "application/json; charset=utf-8";

    return new NextResponse(responseText, {
      status: backendResponse.status,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      },
    });
  } catch (error) {
    console.error("Profile proxy error:", error);
    return NextResponse.json(
      { message: "Unable to load user profile." },
      { status: 500 }
    );
  }
}
