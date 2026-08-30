import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import AllowlistFlow from "@/components/AllowlistFlow";
import LiveFeed from "@/components/LiveFeed";
import { BANNER, COLLECTION } from "@/lib/collection";

export const metadata: Metadata = {
  title: "h00dguins Allowlist",
  description: `Complete the tasks to enter for one of ${COLLECTION.supply} guins on ${COLLECTION.chain}.`,
};

export default function AllowlistPage() {
  return (
    <div className="relative z-10">
      <header className="sticky top-0 z-30 border-b border-ice-100/10 bg-night-900/60 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-3.5 sm:px-6 sm:py-4">
          <Link
            href="/"
            className="font-mono text-sm uppercase tracking-[0.3em] text-ice-050 transition hover:text-lime"
          >
            h00d<span className="text-lime">guins</span>
          </Link>
          <Link
            href="/"
            className="text-[11px] uppercase tracking-[0.2em] text-ice-300 transition hover:text-ice-050"
          >
            Back to site
          </Link>
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-12 sm:px-6 sm:py-16">
        <div className="frost overflow-hidden rounded-3xl">
          <div className="relative h-28 sm:h-44">
            <Image
              src={BANNER}
              alt="h00dguins banner"
              fill
              sizes="100vw"
              className="object-cover opacity-80"
              priority
            />
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-t from-night-900 via-night-900/40 to-transparent"
            />
          </div>

          <div className="p-5 sm:p-8">
            <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-lime">Allowlist</p>
            <h1 className="mt-3 text-[clamp(1.9rem,7vw,2.75rem)] font-semibold tracking-tight text-ice-050">
              Get on the ice
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ice-300">
              Finish every task, drop the wallet you will mint from on {COLLECTION.chain}, and
              submit. You get a ticket with your number in line, and every entry is reviewed before
              the final list is published.
            </p>

            <div className="mt-8">
              <AllowlistFlow />
            </div>
          </div>
        </div>

        <div className="mt-6 max-w-md">
          <LiveFeed />
        </div>
      </main>

      <footer className="border-t border-ice-100/10 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-5 text-center text-xs text-ice-500 sm:flex-row sm:px-6 sm:text-left">
          <span className="font-mono uppercase tracking-[0.25em]">h00dguins</span>
          <span>
            {COLLECTION.supply} supply on {COLLECTION.chain}
          </span>
        </div>
      </footer>
    </div>
  );
}
