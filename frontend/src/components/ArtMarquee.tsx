import Image from "next/image";

import { ART } from "@/lib/collection";

/**
 * Infinite art strip, laid back in 3D so it reads as a conveyor
 * running through the page rather than a flat row.
 */
export default function ArtMarquee({ tilt = -6 }: { tilt?: number }) {
  const reel = [...ART, ...ART];

  return (
    <div className="scene-3d w-full overflow-hidden py-4 sm:py-6">
      <div
        className="preserve-3d flex w-max"
        style={{ transform: `rotateX(${tilt}deg) rotateZ(${tilt / 3}deg)` }}
      >
        <div className="animate-marquee flex gap-3 sm:gap-5">
          {reel.map((src, index) => (
            <div
              key={`${src}-${index}`}
              className="frost relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl sm:h-52 sm:w-52"
              style={{ transform: `translateZ(${(index % 3) * 26}px)` }}
            >
              <Image
                src={src}
                alt=""
                fill
                sizes="(max-width: 640px) 112px, 208px"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
