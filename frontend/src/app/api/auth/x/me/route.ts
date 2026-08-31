import { NextResponse, type NextRequest } from "next/server";

import { OAUTH_COOKIE } from "@/lib/x-auth";

/** The handle verified by the OAuth round trip, if the cookie is still alive. */
export async function GET(request: NextRequest) {
  return NextResponse.json({ handle: request.cookies.get(OAUTH_COOKIE.handle)?.value ?? null });
}
