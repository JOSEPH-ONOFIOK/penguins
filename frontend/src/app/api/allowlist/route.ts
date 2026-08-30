import { NextResponse } from "next/server";

import {
  ValidationError,
  addEntry,
  countEntries,
  findEntry,
  listEntries,
  parseSignup,
} from "@/lib/allowlist";

/**
 * GET /api/allowlist            -> { total }
 * GET /api/allowlist?address=0x -> { total, listed, entry }
 * GET /api/allowlist?export=1   -> full list, requires x-admin-key when ALLOWLIST_ADMIN_KEY is set
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get("address");
  const wantsExport = searchParams.get("export") === "1";

  if (wantsExport) {
    const adminKey = process.env.ALLOWLIST_ADMIN_KEY;
    if (!adminKey || request.headers.get("x-admin-key") !== adminKey) {
      return NextResponse.json({ error: "Not authorized." }, { status: 401 });
    }
    const entries = await listEntries();
    return NextResponse.json({ total: entries.length, entries });
  }

  if (address) {
    const entry = await findEntry(address);
    return NextResponse.json({
      total: await countEntries(),
      listed: entry !== null,
      entry,
    });
  }

  return NextResponse.json({ total: await countEntries() });
}

/** POST /api/allowlist. Submit an entry for review. Idempotent per wallet. */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Expected a JSON body." }, { status: 400 });
  }

  try {
    const parsed = parseSignup((body ?? {}) as Record<string, unknown>);
    const { created, entry, total } = await addEntry(parsed);
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
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message, field: error.field }, { status: 400 });
    }
    console.error("allowlist signup failed", error);
    return NextResponse.json({ error: "Something went wrong. Try again." }, { status: 500 });
  }
}
