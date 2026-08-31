import { NextResponse } from "next/server";

import {
  ValidationError,
  addEntry,
  countEntries,
  findEntry,
  listEntries,
  parseSignup,
} from "@/lib/allowlist";
import { countSheetEntries, findSheetEntry, sheetUrl, submitToSheet } from "@/lib/sheet";
import { OAUTH_COOKIE } from "@/lib/x-auth";

/**
 * GET /api/allowlist            -> { total }
 * GET /api/allowlist?address=0x -> { total, listed, entry }
 * GET /api/allowlist?export=1   -> local list, requires x-admin-key when ALLOWLIST_ADMIN_KEY is set
 *
 * Entries live in the Google Sheet when GOOGLE_SHEETS_WEBAPP_URL is set, and in
 * data/allowlist.json otherwise.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get("address");
  const wantsExport = searchParams.get("export") === "1";
  const sheet = sheetUrl();

  if (wantsExport) {
    const adminKey = process.env.ALLOWLIST_ADMIN_KEY;
    if (!adminKey || request.headers.get("x-admin-key") !== adminKey) {
      return NextResponse.json({ error: "Not authorized." }, { status: 401 });
    }
    if (sheet) {
      return NextResponse.json(
        { error: "Entries live in the connected Google Sheet. Export from there." },
        { status: 409 },
      );
    }
    const entries = await listEntries();
    return NextResponse.json({ total: entries.length, entries });
  }

  try {
    if (address) {
      if (sheet) {
        const found = await findSheetEntry(sheet, address.trim().toLowerCase());
        return NextResponse.json(found);
      }
      const entry = await findEntry(address);
      return NextResponse.json({
        total: await countEntries(),
        listed: entry !== null,
        entry,
      });
    }

    return NextResponse.json({ total: sheet ? await countSheetEntries(sheet) : await countEntries() });
  } catch (error) {
    console.error("allowlist lookup failed", error);
    return NextResponse.json({ total: 0 });
  }
}

/** POST /api/allowlist. Submit an entry for review. Idempotent per wallet. */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Expected a JSON body." }, { status: 400 });
  }

  // A handle verified through the X connect flow wins over the posted one, so
  // a crafted request cannot claim someone else's account.
  const verifiedHandle = request.headers
    .get("cookie")
    ?.split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${OAUTH_COOKIE.handle}=`))
    ?.slice(OAUTH_COOKIE.handle.length + 1);

  const input = { ...((body ?? {}) as Record<string, unknown>) };
  if (verifiedHandle) {
    input.handle = decodeURIComponent(verifiedHandle);
  }

  let parsed;
  try {
    parsed = parseSignup(input);
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message, field: error.field }, { status: 400 });
    }
    throw error;
  }

  const sheet = sheetUrl();

  try {
    const { created, entry, total } = sheet
      ? await submitToSheet(sheet, parsed)
      : await addEntry(parsed);

    return NextResponse.json(
      {
        created,
        total,
        entry,
        position: entry.position,
        status: entry.status,
        message: created
          ? "Entry received. Your entry will be reviewed."
          : "This wallet already has an entry in review.",
      },
      { status: created ? 201 : 200 },
    );
  } catch (error) {
    console.error("allowlist signup failed", error);
    return NextResponse.json(
      { error: "Could not reach the allowlist. Try again in a sec." },
      { status: 502 },
    );
  }
}
