import { promises as fs } from "node:fs";
import path from "node:path";

import { TASK_IDS } from "./tasks";

export type AllowlistEntry = {
  /** Position in line, assigned on submission and never reused. */
  position: number;
  address: string;
  handle: string | null;
  email: string | null;
  tasks: string[];
  /** Entries are reviewed by hand, so nothing is confirmed on submission. */
  status: "pending";
  createdAt: string;
};

export type SignupInput = {
  address?: unknown;
  handle?: unknown;
  email?: unknown;
  tasks?: unknown;
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
export function parseSignup(input: SignupInput): Omit<AllowlistEntry, "position"> {
  const rawAddress = typeof input.address === "string" ? input.address.trim() : "";
  if (!ADDRESS_RE.test(rawAddress)) {
    throw new ValidationError("address", "Enter a valid wallet address (0x + 40 hex characters).");
  }

  const rawHandle = typeof input.handle === "string" ? input.handle.trim() : "";
  if (!HANDLE_RE.test(rawHandle)) {
    throw new ValidationError("handle", "Enter the X handle you completed the tasks with.");
  }

  const rawEmail = typeof input.email === "string" ? input.email.trim() : "";
  if (rawEmail && !EMAIL_RE.test(rawEmail)) {
    throw new ValidationError("email", "Enter a valid email address.");
  }

  const rawTasks = Array.isArray(input.tasks) ? input.tasks.filter((id) => typeof id === "string") : [];
  const missing = TASK_IDS.filter((id) => !rawTasks.includes(id));
  if (missing.length > 0) {
    throw new ValidationError("tasks", "Complete every task before submitting your entry.");
  }

  return {
    address: rawAddress.toLowerCase(),
    handle: rawHandle.replace(/^@/, "").toLowerCase(),
    email: rawEmail ? rawEmail.toLowerCase() : null,
    tasks: [...TASK_IDS],
    status: "pending",
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

/**
 * Adds an entry, keeping one row per wallet. `created` is false when the wallet
 * already has a place in line, in which case the original entry is returned.
 */
export async function addEntry(
  candidate: Omit<AllowlistEntry, "position">,
): Promise<{ created: boolean; entry: AllowlistEntry; total: number }> {
  const entries = await readAll();
  const existing = entries.find((row) => row.address === candidate.address);
  if (existing) {
    return { created: false, entry: existing, total: entries.length };
  }

  const highest = entries.reduce((max, row) => Math.max(max, row.position ?? 0), 0);
  const entry: AllowlistEntry = { ...candidate, position: highest + 1 };
  entries.push(entry);
  await writeAll(entries);
  return { created: true, entry, total: entries.length };
}
