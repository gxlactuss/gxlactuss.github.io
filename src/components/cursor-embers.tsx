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
const MAX_EMBERS = 520;
/** One spawn point per this many pixels of travel, so speed sets density. */
const PX_PER_EMBER = 3;
/** Embers per spawn point — more than one, or the trail reads as dotted. */
const PER_POINT = 2;

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

    function spawn(x: number, y: number, count = PER_POINT) {
      for (let i = 0; i < count; i++) {
        if (embers.length >= MAX_EMBERS) return;
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 0.5;
        const max = 420 + Math.random() * 460;
        embers.push({
          x: x + (Math.random() - 0.5) * 7,
          y: y + (Math.random() - 0.5) * 7,
          vx: Math.cos(angle) * speed,
          // Biased upward from birth — embers rise, sparks fall, and rising is
          // what reads as heat.
          vy: Math.sin(angle) * speed - 0.3,
          life: max,
          max,
          size: 1.4 + Math.random() * 2.9,
        });
      }
    }

    function onMove(e: PointerEvent) {
      const { clientX: x, clientY: y } = e;
      if (prevX < 0) {
        prevX = x;
        prevY = y;
      }
      const dx = x - prevX;
      const dy = y - prevY;
      const dist = Math.hypot(dx, dy);

      // Spawn along the segment travelled since the last event, or a fast flick
      // leaves a dotted line instead of a trail.
      const steps = Math.min(Math.floor(dist / PX_PER_EMBER), 22);
      for (let i = 1; i <= steps; i++) {
        spawn(prevX + dx * (i / steps), prevY + dy * (i / steps));
      }
      if (dist > 0.5) spawn(x, y, 3); // hottest right at the pointer

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
        p.vy -= 0.014 * step; // keep accelerating upward
        p.vx *= 0.985;

        // Cools as it dies: pale yellow core through orange to deep red.
        const hue = 10 + t * 40;
        const light = 42 + t * 38;
        const radius = Math.max(p.size * t, 0.25);

        // Soft halo, then a bright core — two cheap circles read as glow
        // without paying for shadowBlur on every particle.
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, radius * 3.4, 0, Math.PI * 2);
        ctx!.fillStyle = `hsla(${hue}, 100%, ${light}%, ${t * 0.17})`;
        ctx!.fill();

        ctx!.beginPath();
        ctx!.arc(p.x, p.y, radius, 0, Math.PI * 2);
        ctx!.fillStyle = `hsla(${hue}, 100%, ${light + 8}%, ${t * 0.9})`;
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
