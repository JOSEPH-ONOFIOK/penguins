"use client";

import { useState } from "react";

import Ticket from "@/components/Ticket";
import { COLLECTION } from "@/lib/collection";
import { TASKS } from "@/lib/tasks";

type Submitted = { position: number; address: string; handle: string | null };

type Status =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "error"; message: string }
  | { kind: "done"; entry: Submitted; message: string };

const inputClass =
  "w-full rounded-xl border border-ice-100/20 bg-night-900/60 px-4 py-3 text-sm text-ice-050 placeholder:text-ice-500/70 outline-none transition focus:border-lime/60 focus:bg-night-900/80 focus:shadow-[0_0_0_3px_rgba(201,255,61,0.12)]";

export default function AllowlistFlow() {
  const [done, setDone] = useState<string[]>([]);
  const [address, setAddress] = useState("");
  const [handle, setHandle] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  const allDone = TASKS.every((task) => done.includes(task.id));
  const submitting = status.kind === "submitting";

  const toggle = (id: string) =>
    setDone((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus({ kind: "submitting" });

    try {
      const response = await fetch("/api/allowlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, handle, email, tasks: done }),
      });
      const data = await response.json();

      if (!response.ok) {
        setStatus({ kind: "error", message: data.error ?? "Something went wrong." });
        return;
      }

      setStatus({
        kind: "done",
        message: data.message,
        entry: {
          position: data.entry.position,
          address: data.entry.address,
          handle: data.entry.handle,
        },
      });
    } catch {
      setStatus({ kind: "error", message: "Network error. Check your connection and try again." });
    }
  }

  if (status.kind === "done") {
    return (
      <div className="space-y-6">
        <Ticket
          position={status.entry.position}
          address={status.entry.address}
          handle={status.entry.handle}
        />
        <p className="text-center text-xs text-ice-500">{status.message}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
      {/* Tasks */}
      <ol className="space-y-3">
        {TASKS.map((task, index) => {
          const checked = done.includes(task.id);
          return (
            <li key={task.id}>
              <div
                className={`frost rounded-2xl p-4 transition ${
                  checked ? "border-lime/40" : ""
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={checked}
                    onClick={() => toggle(task.id)}
                    className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-md border text-xs transition ${
                      checked
                        ? "border-lime bg-lime text-night-900"
                        : "border-ice-100/30 text-transparent hover:border-ice-100/60"
                    }`}
                  >
                    ✓
                  </button>

                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-ice-500">
                      Task {String(index + 1).padStart(2, "0")}
                    </p>
                    <h3 className="mt-1 text-sm font-semibold text-ice-050">{task.title}</h3>
                    <p className="mt-1 text-xs leading-relaxed text-ice-300">{task.detail}</p>
                  </div>

                  <a
                    href={task.href}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => {
                      if (!checked) toggle(task.id);
                    }}
                    className="shrink-0 rounded-lg border border-ice-100/20 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-ice-100 transition hover:border-lime/50 hover:text-lime"
                  >
                    {task.cta}
                  </a>
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      {/* Entry details */}
      <form onSubmit={handleSubmit} className="frost h-fit rounded-2xl p-5 sm:p-6">
        <h3 className="text-sm font-semibold text-ice-050">Your entry</h3>
        <p className="mt-1 text-xs text-ice-300">
          One entry per wallet. Every entry is reviewed before the list is published.
        </p>

        <div className="mt-5 flex flex-col gap-4">
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

          <label className="flex flex-col gap-2">
            <span className="text-[11px] uppercase tracking-[0.22em] text-ice-300">X handle</span>
            <input
              className={inputClass}
              value={handle}
              onChange={(event) => setHandle(event.target.value)}
              placeholder="@h00dguins"
              spellCheck={false}
              autoComplete="off"
              required
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
          disabled={submitting || !allDone}
          className="group relative mt-5 w-full overflow-hidden rounded-xl bg-lime px-4 py-3.5 text-sm font-semibold tracking-wide text-night-900 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <span className="relative z-10">
            {submitting ? "Submitting entry" : allDone ? "Submit entry" : "Complete every task"}
          </span>
          <span
            aria-hidden
            className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/60 to-transparent transition-transform duration-700 group-hover:translate-x-full"
          />
        </button>

        <p role="status" aria-live="polite" className="mt-3 min-h-5 text-sm text-red-300">
          {status.kind === "error" ? status.message : ""}
        </p>
      </form>
    </div>
  );
}
