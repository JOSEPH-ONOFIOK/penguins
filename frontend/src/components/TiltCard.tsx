"use client";

import { useRef, type ReactNode } from "react";

const MAX_TILT = 12;

/**
 * Pointer-tracked 3D tilt with a specular sheen that follows the cursor.
 * Purely transform-based, so it stays on the compositor.
 */
export default function TiltCard({
  children,
  className = "",
  glare = true,
}: {
  children: ReactNode;
  className?: string;
  glare?: boolean;
}) {
  const card = useRef<HTMLDivElement>(null);
  const frame = useRef(0);

  const handleMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const node = card.current;
    // Coarse pointers get no tilt: a touch drag should scroll the page.
    if (!node || event.pointerType !== "mouse") return;

    const rect = node.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;

    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      node.style.transform = `rotateY(${(px - 0.5) * 2 * MAX_TILT}deg) rotateX(${
        (0.5 - py) * 2 * MAX_TILT
      }deg) translateZ(18px)`;
      node.style.setProperty("--glare-x", `${px * 100}%`);
      node.style.setProperty("--glare-y", `${py * 100}%`);
    });
  };

  const handleLeave = () => {
    const node = card.current;
    if (!node) return;

    cancelAnimationFrame(frame.current);
    node.style.transform = "rotateY(0deg) rotateX(0deg) translateZ(0)";
  };

  return (
    <div className="scene-3d">
      <div
        ref={card}
        onPointerMove={handleMove}
        onPointerLeave={handleLeave}
        className={`preserve-3d relative transition-transform duration-300 ease-out will-change-transform ${className}`}
      >
        {children}
        {glare && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 [background:radial-gradient(circle_at_var(--glare-x,50%)_var(--glare-y,50%),rgba(244,248,255,0.35),transparent_55%)] group-hover:opacity-100"
          />
        )}
      </div>
    </div>
  );
}
