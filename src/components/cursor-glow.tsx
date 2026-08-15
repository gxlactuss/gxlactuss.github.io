"use client";

import { useEffect, useRef, useState } from "react";

/** How far the dot closes the gap to the pointer each frame. Lower = more lag. */
const EASING = 0.18;

/**
 * A small accent dot that trails the pointer.
 *
 * Deliberately absent on touch devices and under Reduce Motion — there's no
 * pointer to follow on a phone, and a permanently lagging object on screen is
 * exactly what that setting exists to suppress.
 */
export function CursorGlow() {
  const dot = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const still = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!fine.matches || still.matches) return;
    setEnabled(true);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const el = dot.current;
    if (!el) return;

    // Target is where the pointer is; current is where the dot has eased to.
    let targetX = 0;
    let targetY = 0;
    let x = 0;
    let y = 0;
    let started = false;
    let frame = 0;

    function onMove(e: PointerEvent) {
      targetX = e.clientX;
      targetY = e.clientY;
      if (!started) {
        // Jump to the first known position instead of flying in from 0,0.
        started = true;
        x = targetX;
        y = targetY;
        el!.style.opacity = "1";
      }
      // Grow over anything clickable — the dot doubles as a hover cue.
      const interactive = (e.target as Element | null)?.closest?.("a, button, [role='button']");
      el!.dataset.over = interactive ? "true" : "false";
    }

    function onLeave() {
      el!.style.opacity = "0";
      started = false;
    }

    function tick() {
      x += (targetX - x) * EASING;
      y += (targetY - y) * EASING;
      // translate3d keeps this on the compositor; `left/top` would relayout.
      el!.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
      frame = requestAnimationFrame(tick);
    }

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    frame = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      cancelAnimationFrame(frame);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      ref={dot}
      aria-hidden="true"
      data-over="false"
      className="pointer-events-none fixed left-0 top-0 z-[100] size-3 rounded-full bg-accent opacity-0 transition-[width,height,opacity,background-color] duration-200 data-[over=true]:size-6 data-[over=true]:bg-accent/40"
    />
  );
}
