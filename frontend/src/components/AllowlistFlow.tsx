"use client";

import { useEffect, useState } from "react";

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
  "w-full rounded-xl border border-ice-100/20 bg-night-900/60 px-4 py-3 text-sm text-ice-050 placeholder:text-ice-500/70 outline-none transition focus:border-lime/60 focus:bg-night-900/80 focus:shadow-[0_0_0_3px_rgba(201,255,61,0.12)] disabled:cursor-not-allowed disabled:border-ice-100/10 disabled:bg-night-900/30 disabled:text-ice-500 disabled:placeholder:text-ice-500/30";

export default function AllowlistFlow() {
  const [done, setDone] = useState<string[]>([]);
  const [verifiedHandle, setVerifiedHandle] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);
  const [address, setAddress] = useState("");
  const [handle, setHandle] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  const allDone = TASKS.every((task) => done.includes(task.id));
  const connected = verifiedHandle !== null;
  const unlocked = allDone && connected;
  const submitting = status.kind === "submitting";

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const outcome = params.get("x_connect");
    const reason = params.get("reason");

    if (outcome) {
      // Drop the flow's query params so a refresh does not replay them.
      params.delete("x_connect");
      params.delete("reason");
      const query = params.toString();
      window.history.replaceState(null, "", query ? `?${query}` : window.location.pathname);
    }

    let cancelled = false;
    fetch("/api/auth/x/me")
      .then((response) => response.json())
      .then((data) => {
        if (cancelled) return;
        setVerifiedHandle(data.handle ?? null);
        if (outcome === "error") {
          setConnectError(
            reason === "not_configured"
              ? "X connect is not set up yet. Ask the team to add the API keys."
              : "Could not connect that X account. Try again.",
          );
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  const runTask = (id: string, href: string) => {
    window.open(href, "_blank", "noopener,noreferrer");
    setDone((current) => (current.includes(id) ? current : [...current, id]));
  };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus({ kind: "submitting" });

    try {
      const response = await fetch("/api/allowlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, handle: verifiedHandle ?? handle, tasks: done }),
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
      {/* Tasks. Opening a task marks it done, mirroring the trials flow. */}
      <div>
        <a
          href={connected ? undefined : "/api/auth/x/start"}
          onClick={() => {
            if (!connected) setConnecting(true);
          }}
          aria-disabled={connected}
          className={`mb-3 flex w-full items-center gap-3 rounded-xl border px-4 py-3.5 text-left transition-[border-color,background-color,transform] duration-200 ease-out ${
            connected
              ? "cursor-default border-lime/50 bg-lime/10"
              : "border-ice-100/15 bg-ice-100/[0.03] hover:border-lime/30 active:scale-[0.99]"
          }`}
        >
          <span
            className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-[11px] font-bold transition-colors duration-200 ${
              connected ? "bg-lime text-night-900" : "bg-ice-100/10 text-ice-500"
            }`}
          >
            {connected ? "✓" : "𝕏"}
          </span>
          <span className="text-sm font-medium text-ice-050">
            {connected
              ? `Connected as @${verifiedHandle}`
              : connecting
                ? "Redirecting to X…"
                : "Connect your X account"}
          </span>
        </a>

        {connectError && <p className="mb-3 text-xs text-red-300">{connectError}</p>}

        <ol className="space-y-2.5">
          {TASKS.map((task, index) => {
            const isDone = done.includes(task.id);
            return (
              <li key={task.id}>
                <button
                  type="button"
                  onClick={() => runTask(task.id, task.href)}
                  className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3.5 text-left transition-[border-color,background-color,transform] duration-200 ease-out active:scale-[0.99] ${
                    isDone
                      ? "border-lime/50 bg-lime/10"
                      : "border-ice-100/15 bg-ice-100/[0.03] hover:border-lime/30"
                  }`}
                >
                  <span
                    className={`grid h-7 w-7 shrink-0 place-items-center rounded-full font-mono text-[11px] font-bold transition-colors duration-200 ${
                      isDone ? "bg-lime text-night-900" : "bg-ice-100/10 text-ice-500"
                    }`}
                  >
                    {isDone ? "✓" : String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="text-sm font-medium text-ice-050">{task.label}</span>
                </button>
              </li>
            );
          })}
        </ol>

        <div className="mt-6 h-1.5 w-full overflow-hidden rounded-full bg-ice-100/10">
          <div
            className="h-full origin-left rounded-full bg-lime transition-transform duration-500 ease-out"
            style={{ transform: `scaleX(${done.length / TASKS.length})` }}
          />
        </div>
        <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.24em] text-ice-500">
          {done.length} of {TASKS.length} done
        </p>
      </div>

      {/* Entry details */}
      <form onSubmit={handleSubmit} className="frost h-fit rounded-2xl p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-ice-050">Your entry</h3>
          {!unlocked && (
            <span className="shrink-0 rounded-full border border-ice-100/15 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.18em] text-ice-500">
              Locked
            </span>
          )}
        </div>
        <p className="mt-1 text-xs text-ice-300">
          {unlocked
            ? "One entry per wallet. Every entry is reviewed before the list is published."
            : connected
              ? `Finish all ${TASKS.length} tasks to unlock the entry form.`
              : "Connect your X account to get started."}
        </p>

        <div
          className={`mt-5 flex flex-col gap-4 transition-opacity duration-300 ease-out ${
            unlocked ? "opacity-100" : "opacity-50"
          }`}
        >
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
              disabled={!unlocked}
              required
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-[11px] uppercase tracking-[0.22em] text-ice-300">
              X handle {connected && <span className="text-lime">· verified</span>}
            </span>
            <input
              className={inputClass}
              value={connected ? `@${verifiedHandle}` : handle}
              onChange={(event) => setHandle(event.target.value)}
              placeholder="@h00dguins"
              spellCheck={false}
              autoComplete="off"
              readOnly={connected}
              disabled={!unlocked}
              required
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={submitting || !unlocked}
          className="group relative mt-5 w-full overflow-hidden rounded-xl bg-lime px-4 py-3.5 text-sm font-semibold tracking-wide text-night-900 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <span className="relative z-10">
            {submitting
              ? "Submitting entry"
              : unlocked
                ? "Submit entry"
                : connected
                  ? "Complete every task"
                  : "Connect X to continue"}
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
