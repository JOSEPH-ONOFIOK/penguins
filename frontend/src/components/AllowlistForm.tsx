"use client";

import { useState } from "react";

import { COLLECTION } from "@/lib/collection";

type Status =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "success"; message: string; total: number }
  | { kind: "error"; message: string };

const inputClass =
  "w-full rounded-xl border border-ice-100/20 bg-night-900/60 px-4 py-3 text-sm text-ice-050 placeholder:text-ice-500/70 outline-none transition focus:border-lime/60 focus:bg-night-900/80 focus:shadow-[0_0_0_3px_rgba(201,255,61,0.12)]";

export default function AllowlistForm({ initialTotal }: { initialTotal: number }) {
  const [address, setAddress] = useState("");
  const [handle, setHandle] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  const total = status.kind === "success" ? status.total : initialTotal;
  const submitting = status.kind === "submitting";
  const remaining = Math.max(COLLECTION.supply - total, 0);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus({ kind: "submitting" });

    try {
      const response = await fetch("/api/allowlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, handle, email }),
      });
      const data = await response.json();

      if (!response.ok) {
        setStatus({ kind: "error", message: data.error ?? "Something went wrong." });
        return;
      }

      setStatus({ kind: "success", message: data.message, total: data.total });
      if (data.created) {
        setHandle("");
        setEmail("");
      }
    } catch {
      setStatus({ kind: "error", message: "Network error. Check your connection and try again." });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-2">
        <span className="text-[11px] uppercase tracking-[0.22em] text-ice-300">
          {COLLECTION.chain} wallet
        </span>
        <input
          className={`${inputClass} font-mono`}
          value={address}
          onChange={(event) => setAddress(event.target.value)}
          placeholder="0x0000000000000000000000000000000000000000"
          spellCheck={false}
          autoComplete="off"
          required
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-2">
          <span className="text-[11px] uppercase tracking-[0.22em] text-ice-300">
            X handle <span className="text-ice-500">(optional)</span>
          </span>
          <input
            className={inputClass}
            value={handle}
            onChange={(event) => setHandle(event.target.value)}
            placeholder="@h00dguins"
            spellCheck={false}
            autoComplete="off"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-[11px] uppercase tracking-[0.22em] text-ice-300">
            Email <span className="text-ice-500">(optional)</span>
          </span>
          <input
            className={inputClass}
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
          />
        </label>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="group relative mt-1 overflow-hidden rounded-xl bg-lime px-4 py-3.5 text-sm font-semibold tracking-wide text-night-900 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span className="relative z-10">
          {submitting ? "Sealing your spot" : "Claim allowlist spot"}
        </span>
        <span
          aria-hidden
          className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/60 to-transparent transition-transform duration-700 group-hover:translate-x-full"
        />
      </button>

      <p
        role="status"
        aria-live="polite"
        className={`min-h-5 text-sm ${
          status.kind === "error" ? "text-red-300" : "text-lime"
        }`}
      >
        {status.kind === "success" || status.kind === "error" ? status.message : ""}
      </p>

      <div className="flex items-center justify-between border-t border-ice-100/10 pt-4 text-xs text-ice-300">
        <span>
          <span className="font-mono text-ice-050">{total}</span> claimed
        </span>
        <span>
          <span className="font-mono text-ice-050">{remaining}</span> of {COLLECTION.supply} left
        </span>
      </div>
    </form>
  );
}
