import type { CSSProperties } from "react";

/**
 * Glacier currents: wide, soft-edged ribbons drifting sideways like meltwater
 * running under ice. Every ribbon is twice the viewport wide and shifts by a
 * quarter of itself, so the loop never shows a seam. Transform-only, so it
 * stays on the compositor.
 */

type Ribbon = {
  key: string;
  top: string;
  height: string;
  tilt: string;
  duration: string;
  delay: string;
  tint: string;
  opacity: number;
};

const ICE = "169, 188, 230";
const SNOW = "223, 228, 248";
const DEEP = "120, 160, 220";
const LIME = "201, 255, 61";

const AMBIENT: Ribbon[] = [
  { key: "a1", top: "6%", height: "190px", tilt: "-9deg", duration: "64s", delay: "0s", tint: ICE, opacity: 0.16 },
  { key: "a2", top: "24%", height: "120px", tilt: "-13deg", duration: "86s", delay: "-12s", tint: SNOW, opacity: 0.12 },
  { key: "a3", top: "44%", height: "240px", tilt: "-7deg", duration: "72s", delay: "-30s", tint: DEEP, opacity: 0.15 },
  { key: "a4", top: "62%", height: "100px", tilt: "-15deg", duration: "58s", delay: "-8s", tint: LIME, opacity: 0.07 },
  { key: "a5", top: "78%", height: "210px", tilt: "-10deg", duration: "94s", delay: "-40s", tint: ICE, opacity: 0.13 },
];

const BAND: Ribbon[] = [
  { key: "b1", top: "8%", height: "54px", tilt: "-3deg", duration: "34s", delay: "0s", tint: SNOW, opacity: 0.3 },
  { key: "b2", top: "30%", height: "30px", tilt: "-2deg", duration: "22s", delay: "-6s", tint: ICE, opacity: 0.42 },
  { key: "b3", top: "47%", height: "22px", tilt: "-1deg", duration: "16s", delay: "-3s", tint: LIME, opacity: 0.2 },
  { key: "b4", top: "62%", height: "44px", tilt: "-2deg", duration: "28s", delay: "-14s", tint: DEEP, opacity: 0.36 },
  { key: "b5", top: "82%", height: "26px", tilt: "-4deg", duration: "44s", delay: "-20s", tint: SNOW, opacity: 0.22 },
];

function Ribbons({ ribbons }: { ribbons: Ribbon[] }) {
  return (
    <>
      {ribbons.map((ribbon) => (
        <span
          key={ribbon.key}
          className="animate-stream absolute left-[-50%] block w-[200%]"
          style={
            {
              top: ribbon.top,
              height: ribbon.height,
              animationDuration: ribbon.duration,
              animationDelay: ribbon.delay,
              // The travelling gradient is what reads as moving water.
              background: `linear-gradient(90deg,
                transparent 0%,
                rgba(${ribbon.tint}, ${ribbon.opacity}) 18%,
                rgba(${ribbon.tint}, ${ribbon.opacity * 1.9}) 34%,
                rgba(${ribbon.tint}, ${ribbon.opacity}) 52%,
                transparent 72%,
                rgba(${ribbon.tint}, ${ribbon.opacity * 0.7}) 86%,
                transparent 100%)`,
              maskImage: "linear-gradient(180deg, transparent, #000 45%, transparent)",
              WebkitMaskImage: "linear-gradient(180deg, transparent, #000 45%, transparent)",
              // The keyframe owns `transform`, so the tilt travels as a variable.
              "--tilt": ribbon.tilt,
            } as CSSProperties
          }
        />
      ))}
    </>
  );
}

/** Full-page ambient current, sitting behind all content. */
export default function GlacierStream() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <Ribbons ribbons={AMBIENT} />
    </div>
  );
}

/** A visible stream running between sections. */
export function GlacierBand() {
  return (
    <div
      aria-hidden
      className="relative h-28 w-full overflow-hidden sm:h-36"
      style={{
        maskImage: "linear-gradient(180deg, transparent, #000 30%, #000 70%, transparent)",
        WebkitMaskImage: "linear-gradient(180deg, transparent, #000 30%, #000 70%, transparent)",
      }}
    >
      <Ribbons ribbons={BAND} />
    </div>
  );
}
