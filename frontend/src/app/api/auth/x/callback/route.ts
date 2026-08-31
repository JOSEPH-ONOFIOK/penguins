import { NextResponse, type NextRequest } from "next/server";

import { HANDLE_COOKIE, OAUTH_COOKIE, returnTo } from "@/lib/x-auth";

function fail(origin: string, reason: string) {
  const response = NextResponse.redirect(returnTo(origin, "error", reason));
  response.cookies.delete(OAUTH_COOKIE.state);
  response.cookies.delete(OAUTH_COOKIE.verifier);
  return response;
}

/** Exchanges the code for a token, reads the handle, and hands it back in a cookie. */
export async function GET(request: NextRequest) {
  const { origin, searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const oauthError = searchParams.get("error");

  const cookieState = request.cookies.get(OAUTH_COOKIE.state)?.value;
  const verifier = request.cookies.get(OAUTH_COOKIE.verifier)?.value;

  if (oauthError) return fail(origin, oauthError);
  if (!code || !state || !cookieState || !verifier || state !== cookieState) {
    return fail(origin, "state_mismatch");
  }

  const clientId = process.env.X_CLIENT_ID;
  const clientSecret = process.env.X_CLIENT_SECRET;
  if (!clientId || !clientSecret) return fail(origin, "not_configured");

  const redirectUri = new URL("/api/auth/x/callback", origin).toString();
  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const tokenResponse = await fetch("https://api.x.com/2/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${basicAuth}`,
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
      code_verifier: verifier,
    }),
  });

  if (!tokenResponse.ok) return fail(origin, "token_exchange_failed");
  const tokenData = await tokenResponse.json();
  const accessToken: string | undefined = tokenData?.access_token;
  if (!accessToken) return fail(origin, "token_exchange_failed");

  const meResponse = await fetch("https://api.x.com/2/users/me", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!meResponse.ok) return fail(origin, "profile_fetch_failed");
  const meData = await meResponse.json();
  const username: string | undefined = meData?.data?.username;
  if (!username) return fail(origin, "profile_fetch_failed");

  const response = NextResponse.redirect(returnTo(origin, "success"));
  response.cookies.set(OAUTH_COOKIE.handle, username, HANDLE_COOKIE);
  response.cookies.delete(OAUTH_COOKIE.state);
  response.cookies.delete(OAUTH_COOKIE.verifier);
  return response;
}
