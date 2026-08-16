"use client";

import { useEffect, useRef, useState } from "react";

type Ember = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** Remaining life in ms. */
  life: number;
  max: number;
  size: number;
};

/** Hard cap so a frantic mouse can't sink the frame rate. */
const MAX_EMBERS = 150;

/**
 * An ember trail that burns off the pointer.
 *
 * The previous version eased a dot toward the cursor, which meant the dot was
 * always visibly behind where you were pointing. Here nothing chases anything:
 * embers are born at the exact pointer position, so the leading edge has zero
 * lag, and the lag that remains is the trail — which is the effect.
 *
 * Canvas rather than DOM nodes: this runs a few hundred particles a frame, and
 * that many elements would thrash layout.
 */
export function CursorEmbers() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const still = window.matchMedia("(prefers-reduced-motion: reduce)");
    setEnabled(fine.matches && !still.matches);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    let width = 0;
    let height = 0;

    function resize() {
      // Capped at 2: a 3x display gains nothing visible here and costs fill rate.
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas!.width = width * dpr;
      canvas!.height = height * dpr;
      canvas!.style.width = `${width}px`;
      canvas!.style.height = `${height}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener("resize", resize);

    const embers: Ember[] = [];
    let prevX = -1;
    let prevY = -1;

    function spawn(x: number, y: number, count = 1) {
      for (let i = 0; i < count; i++) {
        if (embers.length >= MAX_EMBERS) return;
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 0.28;
        // Short-lived on purpose: an ember that dies this fast burns out before
        // the pointer has travelled far enough to leave a streak behind it.
        const max = 200 + Math.random() * 180;
        embers.push({
          x: x + (Math.random() - 0.5) * 6,
          y: y + (Math.random() - 0.5) * 6,
          vx: Math.cos(angle) * speed,
          // Slight upward bias — embers rise, and rising is what reads as heat.
          vy: Math.sin(angle) * speed - 0.16,
          life: max,
          max,
          size: 1 + Math.random() * 1.9,
        });
      }
    }

    function onMove(e: PointerEvent) {
      const { clientX: x, clientY: y } = e;
      if (prevX < 0) {
        prevX = x;
        prevY = y;
      }
      const dist = Math.hypot(x - prevX, y - prevY);

      // Only ever spawn at the pointer itself. Interpolating along the path is
      // what drew the streak; without it the burn stays put and there's no
      // trail, however fast you move.
      if (dist > 1.5) spawn(x, y, 2);

      prevX = x;
      prevY = y;
    }
    window.addEventListener("pointermove", onMove, { passive: true });

    let last = performance.now();
    let frame = 0;

    function tick(now: number) {
      // Clamped so returning to a backgrounded tab doesn't teleport everything.
      const dt = Math.min(now - last, 50);
      last = now;
      const step = dt / 16.67;

      ctx!.clearRect(0, 0, width, height);
      // Additive, so overlapping embers bloom into a brighter core for free.
      ctx!.globalCompositeOperation = "lighter";

      for (let i = embers.length - 1; i >= 0; i--) {
        const p = embers[i];
        p.life -= dt;
        if (p.life <= 0) {
          embers.splice(i, 1);
          continue;
        }

        const t = p.life / p.max; // 1 at birth, 0 at death
        p.x += p.vx * step;
        p.y += p.vy * step;
        p.vy -= 0.008 * step; // keep drifting upward
        p.vx *= 0.985;

        // Held inside a narrow orange band. The old range ran up to hue 50 at
        // 80% lightness, which is where it went yellow-white and shouty.
        const hue = 18 + t * 14;
        const light = 46 + t * 12;
        const radius = Math.max(p.size * t, 0.25);

        // Soft halo, then a core — two cheap circles read as glow without
        // paying for shadowBlur on every particle.
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, radius * 3, 0, Math.PI * 2);
        ctx!.fillStyle = `hsla(${hue}, 92%, ${light}%, ${t * 0.08})`;
        ctx!.fill();

        ctx!.beginPath();
        ctx!.arc(p.x, p.y, radius, 0, Math.PI * 2);
        ctx!.fillStyle = `hsla(${hue}, 95%, ${light + 4}%, ${t * 0.5})`;
        ctx!.fill();
      }

      ctx!.globalCompositeOperation = "source-over";
      frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(frame);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[100]"
    />
  );
}
