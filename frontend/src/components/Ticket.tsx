import { COLLECTION } from "@/lib/collection";

/**
 * Entry receipt. Deliberately says "under review" rather than confirming a
 * place on the list, since every entry is checked by hand.
 */
export default function Ticket({
  position,
  address,
  handle,
}: {
  position: number;
  address: string;
  handle: string | null;
}) {
  const short = `${address.slice(0, 6)}…${address.slice(-4)}`;

  return (
    <div className="scene-3d">
      <div className="preserve-3d animate-rise mx-auto w-full max-w-sm [transform:rotateX(4deg)]">
        <div className="frost overflow-hidden rounded-3xl">
          <div className="border-b border-dashed border-ice-100/25 px-6 py-5 text-center">
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-ice-500">
              {COLLECTION.name} entry
            </p>
            <p className="mt-4 font-mono text-6xl font-semibold text-lime">
              #{String(position).padStart(4, "0")}
            </p>
            <p className="mt-2 text-[11px] uppercase tracking-[0.24em] text-ice-300">
              your number in line
            </p>
          </div>

          {/* Perforation */}
          <div className="relative h-4">
            <span className="absolute -left-2 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-night-900" />
            <span className="absolute -right-2 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-night-900" />
          </div>

          <dl className="space-y-3 px-6 pb-6 text-xs">
            <div className="flex items-center justify-between gap-4">
              <dt className="uppercase tracking-[0.2em] text-ice-500">Wallet</dt>
              <dd className="font-mono text-ice-050">{short}</dd>
            </div>
            {handle && (
              <div className="flex items-center justify-between gap-4">
                <dt className="uppercase tracking-[0.2em] text-ice-500">Handle</dt>
                <dd className="font-mono text-ice-050">@{handle}</dd>
              </div>
            )}
            <div className="flex items-center justify-between gap-4">
              <dt className="uppercase tracking-[0.2em] text-ice-500">Chain</dt>
              <dd className="text-ice-050">{COLLECTION.chain}</dd>
            </div>
            <div className="flex items-center justify-between gap-4 border-t border-ice-100/10 pt-3">
              <dt className="uppercase tracking-[0.2em] text-ice-500">Status</dt>
              <dd className="rounded-full border border-lime/40 bg-lime/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-lime">
                Under review
              </dd>
            </div>
          </dl>

          <div className="flex h-8 items-stretch gap-[3px] overflow-hidden px-6 pb-6 opacity-60">
            {Array.from({ length: 42 }, (_, index) => (
              <span
                key={index}
                className="flex-1 bg-ice-100"
                style={{ opacity: index % 3 === 0 ? 1 : index % 2 === 0 ? 0.55 : 0.25 }}
              />
            ))}
          </div>
        </div>

        <p className="mt-5 text-center text-sm text-ice-300">
          Your entry will be reviewed. Keep the tasks live until results are announced.
        </p>
      </div>
    </div>
  );
}
