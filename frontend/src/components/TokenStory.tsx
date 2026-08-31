"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

import { TOKEN } from "@/lib/collection";

/** How long each chapter holds before the story advances. */
const DWELL = 5200;

const MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeMotion(onChange: () => void) {
  const query = window.matchMedia(MOTION_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/**
 * The post-mint story, told one chapter at a time. It only plays while it is on
 * screen and the tab is focused, pauses under the pointer, and collapses to a
 * plain list when the viewer prefers reduced motion.
 */
export default function TokenStory() {
  const holder = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const [inView, setInView] = useState(false);
  const [tabVisible, setTabVisible] = useState(true);
  const [paused, setPaused] = useState(false);

  const reduceMotion = useSyncExternalStore(
    subscribeMotion,
    () => window.matchMedia(MOTION_QUERY).matches,
    () => false,
  );

  const chapters = TOKEN.story;
  const playing = inView && tabVisible && !paused && !reduceMotion;

  useEffect(() => {
    const node = holder.current;
    if (!node) return;

    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      threshold: 0.35,
    });
    observer.observe(node);

    const onVisibility = () => setTabVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  useEffect(() => {
    if (!playing) return;
    // `active` is a dependency so picking a chapter by hand restarts the dwell.
    const timer = setTimeout(() => setActive((index) => (index + 1) % chapters.length), DWELL);
    return () => clearTimeout(timer);
  }, [playing, active, chapters.length]);

  const chapter = chapters[active];

  return (
    <section
      ref={holder}
      id="rpeng"
      className="relative mx-auto max-w-6xl px-5 py-16 sm:px-6 sm:py-24"
      // Only a real cursor pauses the story. Touch fires enter on tap and often
      // never fires leave, which would freeze it on one chapter.
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") setPaused(true);
      }}
      onPointerLeave={(event) => {
        if (event.pointerType === "mouse") setPaused(false);
      }}
    >
      <div className="frost overflow-hidden rounded-3xl p-6 sm:p-10">
        <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-ice-500">
          {TOKEN.kicker}
        </p>
        <h2 className="mt-3 text-[clamp(2rem,9vw,3rem)] font-semibold tracking-tight text-lime">
          {TOKEN.ticker}
        </h2>
        <p className="mt-4 text-lg text-ice-050">{TOKEN.tagline}</p>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ice-300">{TOKEN.body}</p>

        {/* Chapter rail */}
        <ol className="mt-10 grid gap-2 sm:grid-cols-4 sm:gap-3">
          {chapters.map((entry, index) => {
            const isActive = index === active;
            const isPast = index < active;
            return (
              <li key={entry.id}>
                <button
                  type="button"
                  onClick={() => setActive(index)}
                  aria-current={isActive}
                  className="group w-full text-left transition-transform duration-150 ease-out active:scale-[0.98]"
                >
                  <span className="relative block h-0.5 w-full overflow-hidden rounded-full bg-ice-100/15">
                    {isActive ? (
                      <span
                        // Remounting on each chapter restarts the fill from zero.
                        key={active}
                        className="animate-story-fill absolute inset-0 block bg-lime"
                        style={{
                          animationDuration: `${DWELL}ms`,
                          animationPlayState: playing ? "running" : "paused",
                        }}
                      />
                    ) : (
                      <span
                        className={`absolute inset-0 block origin-left bg-lime transition-transform duration-500 ease-out ${
                          isPast ? "scale-x-100" : "scale-x-0"
                        }`}
                      />
                    )}
                  </span>

                  <span className="mt-3 block font-mono text-[10px] uppercase tracking-[0.24em] text-ice-500">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span
                    className={`mt-1 block text-sm font-semibold transition-colors duration-200 ${
                      isActive ? "text-ice-050" : "text-ice-500 group-hover:text-ice-300"
                    }`}
                  >
                    {entry.title}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>

        {/* Chapter body */}
        {reduceMotion ? (
          <dl className="mt-10 grid gap-6 sm:grid-cols-2">
            {chapters.map((entry) => (
              <div key={entry.id}>
                <dt className="text-base font-semibold text-ice-050">{entry.line}</dt>
                <dd className="mt-2 text-sm leading-relaxed text-ice-300">{entry.body}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <div className="mt-10 grid items-center gap-8 sm:grid-cols-[auto_1fr] sm:gap-10">
            <div className="scene-3d">
              <div className="preserve-3d relative h-40 w-40 sm:h-48 sm:w-48">
                {chapters.map((entry, index) => (
                  <div
                    key={entry.id}
                    aria-hidden={index !== active}
                    className={`frost absolute inset-0 overflow-hidden rounded-3xl transition-all duration-500 ease-out ${
                      index === active
                        ? "opacity-100 [transform:rotateY(0deg)_scale(1)]"
                        : "opacity-0 [transform:rotateY(-14deg)_scale(0.94)]"
                    }`}
                  >
                    <Image
                      src={entry.image}
                      alt=""
                      fill
                      sizes="192px"
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div key={chapter.id} className="animate-chapter min-h-[7rem]">
              <p className="text-xl font-semibold text-ice-050 sm:text-2xl">{chapter.line}</p>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-ice-300">{chapter.body}</p>
            </div>
          </div>
        )}

        <p className="mt-10 max-w-2xl text-xs leading-relaxed text-ice-500">{TOKEN.footnote}</p>
        <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.3em] text-lime/70">
          {TOKEN.status}
        </p>
      </div>
    </section>
  );
}
