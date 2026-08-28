"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

import { ART } from "@/lib/collection";

// WebGL only exists in the browser, and the scene is heavy, so keep it out of the
// server bundle and off the critical path.
const GuinScene = dynamic(() => import("./GuinScene"), { ssr: false });

const MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeMotion(onChange: () => void) {
  const query = window.matchMedia(MOTION_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function hasWebGL() {
  try {
    const probe = document.createElement("canvas");
    return Boolean(probe.getContext("webgl2") ?? probe.getContext("webgl"));
  } catch {
    return false;
  }
}

/**
 * Mounts the WebGL scene once it scrolls into view. Falls back to a still
 * collage when the viewer prefers reduced motion or WebGL is unavailable.
 */
export default function SceneMount() {
  const holder = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [supported, setSupported] = useState(true);

  const reduceMotion = useSyncExternalStore(
    subscribeMotion,
    () => window.matchMedia(MOTION_QUERY).matches,
    () => false,
  );

  useEffect(() => {
    const node = holder.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setSupported(hasWebGL());
        setVisible(true);
        observer.disconnect();
      },
      { rootMargin: "200px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={holder} className="absolute inset-0">
      {supported && visible ? (
        <GuinScene reduceMotion={reduceMotion} />
      ) : (
        <div className="flex h-full items-center justify-center gap-3 px-6 opacity-40 sm:gap-4 lg:justify-end lg:pr-10 lg:opacity-70">
          {ART.slice(0, 4).map((src, index) => (
            <div
              key={src}
              className={`frost relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl sm:h-40 sm:w-40 ${
                index > 1 ? "hidden sm:block" : ""
              }`}
            >
              <Image
                src={src}
                alt=""
                fill
                sizes="(max-width: 640px) 96px, 160px"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
