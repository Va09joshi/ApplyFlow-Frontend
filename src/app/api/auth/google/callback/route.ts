import { NextResponse } from "next/server";

const getApiBaseUrl = () => {
  return process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "";
};

const buildHtmlResponse = (message: string, redirectPath: string) => {
  const safeMessage = message.replaceAll("<", "&lt;").replaceAll(">", "&gt;");

  return new NextResponse(
    `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Signing in...</title>
    <meta http-equiv="cache-control" content="no-store" />
    <style>
      body {
        margin: 0;
        min-height: 100vh;
        display: grid;
        place-items: center;
        font-family: Arial, sans-serif;
        background: #0f172a;
        color: #e2e8f0;
      }
      .card {
        width: min(92vw, 420px);
        padding: 24px;
        border-radius: 16px;
        background: rgba(15, 23, 42, 0.92);
        border: 1px solid rgba(148, 163, 184, 0.2);
        box-shadow: 0 24px 80px rgba(0, 0, 0, 0.35);
        text-align: center;
      }
      .title { font-size: 18px; font-weight: 700; margin-bottom: 8px; }
      .text { font-size: 14px; line-height: 1.5; color: #cbd5e1; }
    </style>
  </head>
  <body>
    <div class="card">
      <div class="title">Signing in...</div>
      <div class="text">${safeMessage}</div>
    </div>
    <script>
      setTimeout(() => window.location.replace(${JSON.stringify(redirectPath)}), 1200);
    </script>
  </body>
</html>`,
    {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    }
  );
};

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const credential = formData.get("credential");

    if (typeof credential !== "string" || !credential) {
      return buildHtmlResponse("Google credential was not received.", "/login");
    }

    const apiBaseUrl = getApiBaseUrl();

    if (!apiBaseUrl) {
      return buildHtmlResponse("API base URL is not configured.", "/login");
    }

    const response = await fetch(`${apiBaseUrl.replace(/\/$/, "")}/api/v1/auth/google`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ idToken: credential }),
      cache: "no-store",
    });

    const payload = await response.json().catch(() => null);
    const authData = payload?.data || payload || {};
    const accessToken = authData.accessToken;
    const user = authData.user || null;

    if (!response.ok || !accessToken) {
      const errorMessage = payload?.message || payload?.error || "Google sign-in failed.";
      return buildHtmlResponse(errorMessage, "/login");
    }

    const storageValue = JSON.stringify({
      state: {
        user,
        accessToken,
      },
      version: 0,
    });

    return new NextResponse(
      `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Signed in</title>
    <meta http-equiv="cache-control" content="no-store" />
    <style>
      body {
        margin: 0;
        min-height: 100vh;
        display: grid;
        place-items: center;
        font-family: Arial, sans-serif;
        background: #0f172a;
        color: #e2e8f0;
      }
      .card {
        width: min(92vw, 420px);
        padding: 24px;
        border-radius: 16px;
        background: rgba(15, 23, 42, 0.92);
        border: 1px solid rgba(148, 163, 184, 0.2);
        box-shadow: 0 24px 80px rgba(0, 0, 0, 0.35);
        text-align: center;
      }
      .title { font-size: 18px; font-weight: 700; margin-bottom: 8px; }
      .text { font-size: 14px; line-height: 1.5; color: #cbd5e1; }
    </style>
  </head>
  <body>
    <div class="card">
      <div class="title">Signed in</div>
      <div class="text">Redirecting you to your dashboard...</div>
    </div>
    <script>
      try {
        localStorage.setItem("auth-storage", ${JSON.stringify(storageValue)});
      } catch (error) {
        console.error("Failed to store auth state", error);
      }
      window.location.replace("/dashboard");
    </script>
  </body>
</html>`,
      {
        status: 200,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  } catch (error) {
    console.error("Google callback error:", error);
    return buildHtmlResponse("Unable to complete Google sign-in.", "/login");
  }
}