"use client";

import { useEffect, useRef } from "react";

type Flake = {
  x: number;
  y: number;
  radius: number;
  depth: number;
  drift: number;
  phase: number;
  speed: number;
};

const FLAKES_PER_MEGAPIXEL = 90;
const MIN_FLAKES = 70;
const MAX_FLAKES = 260;

/**
 * Full-page snow, drawn on one canvas behind the content.
 * Depth drives size, opacity, and fall speed so the field reads as 3D.
 */
export default function Snowfall() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let flakes: Flake[] = [];
    let width = 0;
    let height = 0;
    let frame = 0;
    let last = performance.now();

    const seed = (): Flake => {
      const depth = Math.random();
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        radius: 0.8 + depth * 2.6,
        depth,
        drift: 12 + depth * 34,
        phase: Math.random() * Math.PI * 2,
        speed: 16 + depth * 58,
      };
    };

    const resize = () => {
      // Phones ship high DPR with weaker GPUs, so cap harder on small screens.
      const dpr = Math.min(window.devicePixelRatio || 1, window.innerWidth < 640 ? 1.5 : 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);

      const target = Math.min(
        MAX_FLAKES,
        Math.max(MIN_FLAKES, Math.round(((width * height) / 1_000_000) * FLAKES_PER_MEGAPIXEL)),
      );
      flakes = Array.from({ length: target }, seed);
    };

    const draw = (now: number) => {
      const delta = Math.min((now - last) / 1000, 0.05);
      last = now;
      context.clearRect(0, 0, width, height);

      for (const flake of flakes) {
        if (!reduceMotion) {
          flake.y += flake.speed * delta;
          flake.phase += delta * 0.7;
          flake.x += Math.sin(flake.phase) * flake.drift * delta;

          if (flake.y - flake.radius > height) {
            flake.y = -flake.radius;
            flake.x = Math.random() * width;
          }
          if (flake.x < -20) flake.x = width + 20;
          if (flake.x > width + 20) flake.x = -20;
        }

        context.beginPath();
        context.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
        context.fillStyle = `rgba(244, 248, 255, ${0.18 + flake.depth * 0.5})`;
        context.fill();
      }

      frame = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    frame = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-20 h-full w-full"
    />
  );
}
