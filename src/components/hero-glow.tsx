"use client";

import { m, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import { useEffect, useRef } from "react";

/** Where the glow rests, as a fraction of the hero box, before a mouse moves it. */
const REST = { x: 0.3, y: 0.35 };

/**
 * A soft orange blob behind the hero that trails the mouse on a spring. On touch
 * screens, or with reduced motion, it stays at its resting spot and just breathes.
 */
export function HeroGlow() {
  const ref = useRef<HTMLDivElement>(null);
  // Offsets from the resting spot, so the server render already has it in place.
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 60, damping: 20, mass: 0.8 });
  const springY = useSpring(y, { stiffness: 60, damping: 20, mass: 0.8 });
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced || window.matchMedia("(pointer: coarse)").matches) return;

    function onMove(event: PointerEvent) {
      const box = ref.current?.getBoundingClientRect();
      if (!box || event.pointerType !== "mouse") return;
      const px = Math.min(Math.max(event.clientX - box.left, 0), box.width);
      const py = Math.min(Math.max(event.clientY - box.top, 0), box.height);
      x.set(px - box.width * REST.x);
      y.set(py - box.height * REST.y);
    }

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [reduced, x, y]);

  return (
    <div
      ref={ref}
      aria-hidden
      // The mask fades the glow out toward every edge, so the clip never shows as a hard line.
      className="pointer-events-none absolute inset-x-0 -top-16 bottom-0 -z-10 overflow-hidden [mask-image:radial-gradient(ellipse_at_center,black_45%,transparent_75%)] sm:-inset-x-24"
    >
      <m.div
        className="absolute size-[min(420px,85vw)] -translate-x-1/2 -translate-y-1/2 opacity-[0.12] dark:opacity-[0.18]"
        style={{ left: `${REST.x * 100}%`, top: `${REST.y * 100}%`, x: springX, y: springY }}
      >
        <m.div
          className="size-full rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, var(--accent) 0%, transparent 70%)" }}
          animate={reduced ? undefined : { scale: [1, 1.12, 1], opacity: [1, 0.7, 1] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        />
      </m.div>
    </div>
  );
}
