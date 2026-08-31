import { NextResponse, type NextRequest } from "next/server";

import { OAUTH_COOKIE, TRANSIENT_COOKIE, pkce, returnTo } from "@/lib/x-auth";

/** Kicks off the X OAuth 2.0 authorization code flow with PKCE. */
export async function GET(request: NextRequest) {
  const clientId = process.env.X_CLIENT_ID;
  const origin = request.nextUrl.origin;

  if (!clientId) {
    return NextResponse.redirect(returnTo(origin, "error", "not_configured"));
  }

  const { verifier, challenge, state } = pkce();
  const redirectUri = new URL("/api/auth/x/callback", origin).toString();

  const authorizeUrl = new URL("https://x.com/i/oauth2/authorize");
  authorizeUrl.searchParams.set("response_type", "code");
  authorizeUrl.searchParams.set("client_id", clientId);
  authorizeUrl.searchParams.set("redirect_uri", redirectUri);
  authorizeUrl.searchParams.set("scope", "users.read tweet.read");
  authorizeUrl.searchParams.set("state", state);
  authorizeUrl.searchParams.set("code_challenge", challenge);
  authorizeUrl.searchParams.set("code_challenge_method", "S256");

  const response = NextResponse.redirect(authorizeUrl);
  response.cookies.set(OAUTH_COOKIE.verifier, verifier, TRANSIENT_COOKIE);
  response.cookies.set(OAUTH_COOKIE.state, state, TRANSIENT_COOKIE);
  return response;
}
