import { randomBytes, createHash } from "node:crypto";

/** Where the connect flow returns to. */
export const RETURN_PATH = "/allowlist";

export const OAUTH_COOKIE = {
  state: "x_oauth_state",
  verifier: "x_oauth_verifier",
  handle: "x_handle",
} as const;

const isProd = process.env.NODE_ENV === "production";

/** Short-lived cookies for the round trip to X. */
export const TRANSIENT_COOKIE = {
  httpOnly: true,
  secure: isProd,
  sameSite: "lax" as const,
  path: "/",
  maxAge: 600,
};

/** The verified handle, kept long enough to finish the tasks and submit. */
export const HANDLE_COOKIE = {
  ...TRANSIENT_COOKIE,
  maxAge: 60 * 60 * 2,
};

export function base64url(input: Buffer) {
  return input.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function pkce() {
  const verifier = base64url(randomBytes(32));
  const challenge = base64url(createHash("sha256").update(verifier).digest());
  const state = base64url(randomBytes(16));
  return { verifier, challenge, state };
}

/** Sends the browser back to the allowlist with an outcome it can render. */
export function returnTo(origin: string, outcome: "success" | "error", reason?: string) {
  const destination = new URL(RETURN_PATH, origin);
  destination.searchParams.set("x_connect", outcome);
  if (reason) destination.searchParams.set("reason", reason);
  return destination;
}
