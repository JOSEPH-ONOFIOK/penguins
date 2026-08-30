"use client";

import { useEffect, useRef, useState } from "react";

type Line = { id: number; wallet: string; action: string; at: number };

const ACTIONS = [
  "submitted an entry",
  "finished the tasks",
  "joined the queue",
  "quoted the drop",
  "entered for review",
];

const HEX = "0123456789abcdef";

/** Cosmetic activity ticker. The wallets are generated, not real entries. */
function fakeWallet() {
  const pick = (length: number) =>
    Array.from({ length }, () => HEX[Math.floor(Math.random() * HEX.length)]).join("");
  return `0x${pick(4)}…${pick(4)}`;
}

function relative(at: number, now: number) {
  const seconds = Math.max(1, Math.round((now - at) / 1000));
  if (seconds < 60) return `${seconds}s ago`;
  return `${Math.round(seconds / 60)}m ago`;
}

export default function LiveFeed() {
  const [lines, setLines] = useState<Line[]>([]);
  const [now, setNow] = useState(0);
  const nextId = useRef(0);

  useEffect(() => {
    const push = () => {
      const at = Date.now();
      setNow(at);
      setLines((current) => {
        nextId.current += 1;
        const line: Line = {
          id: nextId.current,
          wallet: fakeWallet(),
          action: ACTIONS[Math.floor(Math.random() * ACTIONS.length)],
          at,
        };
        return [line, ...current].slice(0, 6);
      });
    };

    // Seed the feed, then trickle new lines in at an irregular pace.
    for (let i = 0; i < 5; i += 1) push();

    let timer: ReturnType<typeof setTimeout>;
    const schedule = () => {
      timer = setTimeout(() => {
        push();
        schedule();
      }, 2600 + Math.random() * 4200);
    };
    schedule();

    const tick = setInterval(() => setNow(Date.now()), 1000);
    return () => {
      clearTimeout(timer);
      clearInterval(tick);
    };
  }, []);

  return (
    <div className="frost rounded-2xl p-4 sm:p-5">
      <div className="flex items-center gap-2">
        <span className="animate-shimmer h-1.5 w-1.5 rounded-full bg-lime" />
        <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-ice-300">Live feed</p>
      </div>

      <ul className="mt-4 min-h-[122px] space-y-2.5">
        {/* Placeholder rows hold the box open until the first client tick lands. */}
        {lines.length === 0 &&
          Array.from({ length: 5 }, (_, index) => (
            <li key={`skeleton-${index}`} className="flex items-center gap-3">
              <span className="h-2.5 w-28 rounded bg-ice-100/10" />
              <span className="h-2.5 flex-1 rounded bg-ice-100/5" />
            </li>
          ))}

        {lines.map((line, index) => (
          <li
            key={line.id}
            className="animate-rise flex items-center justify-between gap-3 text-xs"
            style={{ opacity: 1 - index * 0.13 }}
          >
            <span className="truncate">
              <span className="font-mono text-ice-050">{line.wallet}</span>{" "}
              <span className="text-ice-300">{line.action}</span>
            </span>
            <span className="shrink-0 font-mono text-[10px] text-ice-500">
              {relative(line.at, now)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
