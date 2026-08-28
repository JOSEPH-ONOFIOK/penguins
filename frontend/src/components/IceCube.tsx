"use client";

import Image from "next/image";

import { ART } from "@/lib/collection";

const FACES = [
  "rotateY(0deg) translateZ(70px)",
  "rotateY(90deg) translateZ(70px)",
  "rotateY(180deg) translateZ(70px)",
  "rotateY(-90deg) translateZ(70px)",
  "rotateX(90deg) translateZ(70px)",
  "rotateX(-90deg) translateZ(70px)",
];

/** A CSS-3D cube of collection art, spinning on two axes. */
export default function IceCube() {
  return (
    <div className="scene-3d h-[140px] w-[140px] scale-90 sm:h-[180px] sm:w-[180px] sm:scale-100">
      <div className="preserve-3d relative h-full w-full animate-spin-cube">
        {FACES.map((transform, index) => (
          <div
            key={transform}
            className="frost absolute left-1/2 top-1/2 h-[140px] w-[140px] overflow-hidden rounded-xl"
            style={{ transform: `translate(-50%, -50%) ${transform}` }}
          >
            <Image
              src={ART[index % ART.length]}
              alt=""
              fill
              sizes="140px"
              className="object-cover opacity-90"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
