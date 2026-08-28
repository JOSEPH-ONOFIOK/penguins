import { promises as fs } from "node:fs";
import path from "node:path";

export type AllowlistEntry = {
  address: string;
  handle: string | null;
  email: string | null;
  createdAt: string;
};

export type SignupInput = {
  address?: unknown;
  handle?: unknown;
  email?: unknown;
};

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "allowlist.json");

const ADDRESS_RE = /^0x[a-fA-F0-9]{40}$/;
const HANDLE_RE = /^@?[A-Za-z0-9_]{1,15}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export class ValidationError extends Error {
  field: string;

  constructor(field: string, message: string) {
    super(message);
    this.field = field;
    this.name = "ValidationError";
  }
}

/** Normalizes and validates raw form input into an entry ready to persist. */
export function parseSignup(input: SignupInput): AllowlistEntry {
  const rawAddress = typeof input.address === "string" ? input.address.trim() : "";
  if (!ADDRESS_RE.test(rawAddress)) {
    throw new ValidationError("address", "Enter a valid wallet address (0x + 40 hex characters).");
  }

  const rawHandle = typeof input.handle === "string" ? input.handle.trim() : "";
  if (rawHandle && !HANDLE_RE.test(rawHandle)) {
    throw new ValidationError("handle", "Handles are up to 15 letters, numbers, or underscores.");
  }

  const rawEmail = typeof input.email === "string" ? input.email.trim() : "";
  if (rawEmail && !EMAIL_RE.test(rawEmail)) {
    throw new ValidationError("email", "Enter a valid email address.");
  }

  return {
    address: rawAddress.toLowerCase(),
    handle: rawHandle ? rawHandle.replace(/^@/, "").toLowerCase() : null,
    email: rawEmail ? rawEmail.toLowerCase() : null,
    createdAt: new Date().toISOString(),
  };
}

async function readAll(): Promise<AllowlistEntry[]> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as AllowlistEntry[]) : [];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}

async function writeAll(entries: AllowlistEntry[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, `${JSON.stringify(entries, null, 2)}\n`, "utf8");
}

export async function listEntries(): Promise<AllowlistEntry[]> {
  return readAll();
}

export async function countEntries(): Promise<number> {
  return (await readAll()).length;
}

export async function findEntry(address: string): Promise<AllowlistEntry | null> {
  const key = address.trim().toLowerCase();
  const entries = await readAll();
  return entries.find((entry) => entry.address === key) ?? null;
}

/** Adds an entry, keeping one row per wallet. `created` is false when the wallet was already on the list. */
export async function addEntry(
  entry: AllowlistEntry,
): Promise<{ created: boolean; entry: AllowlistEntry; total: number }> {
  const entries = await readAll();
  const existing = entries.find((row) => row.address === entry.address);
  if (existing) {
    return { created: false, entry: existing, total: entries.length };
  }

  entries.push(entry);
  await writeAll(entries);
  return { created: true, entry, total: entries.length };
}
