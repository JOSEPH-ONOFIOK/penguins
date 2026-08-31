import type { AllowlistEntry } from "./allowlist";

/**
 * Google Sheets backend, talking to the Apps Script web app in
 * scripts/apps-script/Code.gs. Used whenever GOOGLE_SHEETS_WEBAPP_URL is set;
 * otherwise the local JSON store in allowlist.ts handles everything.
 */

export function sheetUrl(): string | null {
  return process.env.GOOGLE_SHEETS_WEBAPP_URL || null;
}

const secret = () => process.env.GOOGLE_SHEETS_SECRET ?? "";

type SheetPost = {
  ok?: boolean;
  created?: boolean;
  position?: number;
  status?: string;
  total?: number;
  error?: string;
};

type SheetGet = {
  total?: number;
  listed?: boolean;
  position?: number;
  status?: string;
  handle?: string;
  error?: string;
};

async function readJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error(`Sheets web app returned ${response.status}`);
  }
  return (await response.json()) as T;
}

/** Appends an entry, or returns the one this wallet already has. */
export async function submitToSheet(
  url: string,
  candidate: Omit<AllowlistEntry, "position">,
): Promise<{ created: boolean; entry: AllowlistEntry; total: number }> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    // Apps Script answers /exec with a redirect to a googleusercontent host.
    redirect: "follow",
    body: JSON.stringify({
      secret: secret(),
      wallet: candidate.address,
      handle: candidate.handle,
      tasks: candidate.tasks,
    }),
  });

  const data = await readJson<SheetPost>(response);
  if (data.error) {
    throw new Error(data.error);
  }

  return {
    created: Boolean(data.created),
    total: Number(data.total ?? 0),
    entry: { ...candidate, position: Number(data.position ?? 0) },
  };
}

export async function countSheetEntries(url: string): Promise<number> {
  const target = new URL(url);
  target.searchParams.set("secret", secret());
  const data = await readJson<SheetGet>(await fetch(target, { redirect: "follow" }));
  return Number(data.total ?? 0);
}

export async function findSheetEntry(
  url: string,
  address: string,
): Promise<{ total: number; listed: boolean; position: number | null; status: string | null }> {
  const target = new URL(url);
  target.searchParams.set("secret", secret());
  target.searchParams.set("address", address);
  const data = await readJson<SheetGet>(await fetch(target, { redirect: "follow" }));

  return {
    total: Number(data.total ?? 0),
    listed: Boolean(data.listed),
    position: data.position ?? null,
    status: data.status ?? null,
  };
}
