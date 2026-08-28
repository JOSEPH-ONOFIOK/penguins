import Image from "next/image";

import AllowlistForm from "@/components/AllowlistForm";
import ArtMarquee from "@/components/ArtMarquee";
import IceCube from "@/components/IceCube";
import TiltCard from "@/components/TiltCard";
import SceneMount from "@/components/three/SceneMount";
import { ART, BANNER, COLLECTION } from "@/lib/collection";
import { countEntries } from "@/lib/allowlist";

export const dynamic = "force-dynamic";

const FACTS = [
  { label: "Supply", value: COLLECTION.supply.toLocaleString(), note: "guins drawn by hand" },
  { label: "Chain", value: COLLECTION.chain, note: "minting on Robinhood" },
  { label: "Mint price", value: COLLECTION.mintPrice, note: "announced at reveal" },
  { label: "Per wallet", value: `${COLLECTION.allowlistPerWallet} spot`, note: "one wallet, one guin" },
];

const STEPS = [
  {
    title: "Drop your wallet",
    body: `Paste the address you will mint from on ${COLLECTION.chain}. One spot per wallet, no exceptions.`,
  },
  {
    title: "Stay frosty",
    body: "Leave a handle or email and you get the mint window before it goes public.",
  },
  {
    title: "Mint your guin",
    body: `Allowlist wallets get first claim on the ${COLLECTION.supply} supply. Whatever is left opens to everyone.`,
  },
];

export default async function Home() {
  const total = await countEntries();

  return (
    <div className="relative z-10">
      <header className="sticky top-0 z-30 border-b border-ice-100/10 bg-night-900/60 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-3.5 sm:px-6 sm:py-4">
          <span className="font-mono text-sm uppercase tracking-[0.3em] text-ice-050">
            h00d<span className="text-lime">guins</span>
          </span>
          <div className="hidden items-center gap-8 text-xs uppercase tracking-[0.2em] text-ice-300 sm:flex">
            <a className="transition hover:text-ice-050" href="#collection">
              Collection
            </a>
            <a className="transition hover:text-ice-050" href="#how">
              How it works
            </a>
          </div>
          <a
            href="#allowlist"
            className="shrink-0 rounded-full border border-lime/40 bg-lime/10 px-3.5 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-lime transition hover:bg-lime/20 sm:px-4 sm:text-xs sm:tracking-[0.18em]"
          >
            Allowlist
          </a>
        </nav>
      </header>

      {/* Hero: the WebGL ring sits behind the copy and reacts to the cursor. */}
      <section className="relative flex min-h-[88svh] items-center overflow-hidden sm:min-h-[92vh]">
        <div className="absolute inset-0">
          <SceneMount />
        </div>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(5,10,28,0.55)_0%,rgba(5,10,28,0.88)_55%,rgba(5,10,28,0.75)_100%)] sm:bg-[linear-gradient(90deg,rgba(5,10,28,0.96)_0%,rgba(5,10,28,0.9)_38%,rgba(5,10,28,0.45)_60%,transparent_85%)]"
        />

        <div className="relative mx-auto w-full max-w-6xl px-5 py-20 sm:px-6 sm:py-24">
          <div className="animate-rise max-w-xl text-balance">
            <span className="inline-flex items-center gap-2 rounded-full border border-ice-100/15 bg-night-800/60 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.22em] text-ice-300">
              <span className="animate-shimmer h-1.5 w-1.5 rounded-full bg-lime" />
              Allowlist open on {COLLECTION.chain}
            </span>

            <h1 className="text-glow mt-6 text-[clamp(2.75rem,13vw,4.5rem)] font-semibold leading-[0.95] tracking-tight text-ice-050 sm:text-7xl">
              h00d<span className="text-lime">guins</span>
            </h1>

            <p className="mt-5 text-base leading-relaxed text-ice-300 sm:text-lg">
              {COLLECTION.supply.toLocaleString()} ice cold penguins wintering on {COLLECTION.chain}.
              Hoods up, sunglasses on, permanently unbothered. Claim a spot before the ice sets.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <a
                href="#allowlist"
                className="rounded-xl bg-lime px-6 py-4 text-center text-sm font-semibold text-night-900 transition hover:brightness-110 sm:py-3.5"
              >
                Claim your spot
              </a>
              <a
                href="#collection"
                className="rounded-xl border border-ice-100/20 px-6 py-4 text-center text-sm font-semibold text-ice-100 transition hover:border-ice-100/50 hover:bg-ice-100/5 sm:py-3.5"
              >
                See the colony
              </a>
            </div>

            <dl className="mt-10 grid max-w-md grid-cols-2 gap-x-8 gap-y-5 sm:mt-12">
              <div>
                <dt className="text-[11px] uppercase tracking-[0.22em] text-ice-500">Supply</dt>
                <dd className="font-mono text-2xl text-ice-050">{COLLECTION.supply}</dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase tracking-[0.22em] text-ice-500">Claimed</dt>
                <dd className="font-mono text-2xl text-lime">{total}</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <ArtMarquee />

      {/* Collection */}
      <section id="collection" className="relative mx-auto max-w-6xl px-5 py-16 sm:px-6 sm:py-24">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-lime">
              The colony
            </p>
            <h2 className="mt-3 text-[clamp(1.75rem,7vw,2.25rem)] font-semibold tracking-tight text-ice-050 sm:text-4xl">
              {COLLECTION.supply} guins, one glacier
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-ice-300">
            Every guin is drawn by hand. Hoods, pirate hats, gold drip, and a permanent squint.
            Traits get colder the deeper you go.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
          {ART.map((src, index) => (
            <TiltCard key={src} className="group frost overflow-hidden rounded-3xl">
              <div className="relative aspect-square">
                <Image
                  src={src}
                  alt={`h00dguin #${index + 1}`}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="flex items-center justify-between gap-2 px-3 py-2.5 font-mono text-[9px] uppercase tracking-[0.15em] text-ice-300 sm:px-4 sm:py-3 sm:text-[11px] sm:tracking-[0.2em]">
                <span>guin #{String(index + 1).padStart(4, "0")}</span>
                <span className="text-lime">frozen</span>
              </div>
            </TiltCard>
          ))}
        </div>
      </section>

      {/* Facts + spinning cube */}
      <section className="relative mx-auto max-w-6xl px-5 pb-16 sm:px-6 sm:pb-24">
        <div className="grid items-center gap-10 lg:grid-cols-[1fr_auto] lg:gap-12">
          <div className="grid grid-cols-2 gap-3 sm:gap-5">
            {FACTS.map((fact) => (
              <TiltCard key={fact.label} className="frost h-full rounded-2xl p-4 sm:p-6" glare={false}>
                <p className="text-[10px] uppercase tracking-[0.2em] text-ice-500 sm:text-[11px] sm:tracking-[0.22em]">
                  {fact.label}
                </p>
                <p className="mt-2 text-lg font-semibold text-ice-050 sm:mt-3 sm:text-2xl">
                  {fact.value}
                </p>
                <p className="mt-1 text-xs text-ice-300">{fact.note}</p>
              </TiltCard>
            ))}
          </div>
          <div className="flex justify-center lg:pl-8">
            <IceCube />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="relative mx-auto max-w-6xl px-5 pb-16 sm:px-6 sm:pb-24">
        <h2 className="text-[clamp(1.75rem,7vw,2.25rem)] font-semibold tracking-tight text-ice-050 sm:text-4xl">
          How the allowlist works
        </h2>
        <ol className="mt-8 grid gap-4 sm:mt-10 sm:gap-6 md:grid-cols-3">
          {STEPS.map((step, index) => (
            <li key={step.title}>
              <TiltCard className="frost h-full rounded-2xl p-6" glare={false}>
                <span className="font-mono text-4xl text-lime/40">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-4 text-lg font-semibold text-ice-050">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ice-300">{step.body}</p>
              </TiltCard>
            </li>
          ))}
        </ol>
      </section>

      {/* Allowlist */}
      <section id="allowlist" className="relative mx-auto max-w-6xl px-5 pb-20 sm:px-6 sm:pb-28">
        <div className="frost overflow-hidden rounded-3xl">
          <div className="relative h-28 sm:h-56">
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

          <div className="grid gap-8 p-4 sm:gap-10 sm:p-10 lg:grid-cols-2">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-lime">
                Allowlist
              </p>
              <h2 className="mt-3 text-[clamp(1.75rem,7vw,2.25rem)] font-semibold tracking-tight text-ice-050 sm:text-4xl">
                Get on the ice
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-ice-300">
                Reserve one of {COLLECTION.supply} guins on {COLLECTION.chain}. Wallet only. The
                handle and email are so we can reach you when the mint window opens.
              </p>
              <div className="animate-drift mt-8 hidden lg:block">
                <div className="frost relative h-44 w-44 overflow-hidden rounded-3xl">
                  <Image src={ART[2]} alt="" fill sizes="176px" className="object-cover" />
                </div>
              </div>
            </div>

            <div className="frost rounded-2xl p-4 sm:p-6">
              <AllowlistForm initialTotal={total} />
            </div>
          </div>
        </div>
      </section>

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
