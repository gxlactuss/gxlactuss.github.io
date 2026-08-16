"use client";

import { useEffect, useRef, useState } from "react";

type Comet = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  len: number;
  width: number;
  life: number;
  max: number;
};

/** Concurrent comets. Kept low — this is atmosphere, not weather. */
const MAX_COMETS = 3;
const SPAWN_MIN_MS = 700;
const SPAWN_MAX_MS = 2100;

/**
 * Comets falling behind the hero. Confined to its own box rather than the whole
 * page: the canvas fills the element it's placed in, so the effect stops where
 * the header does and never runs behind body copy.
 */
export function HeroComets() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    setEnabled(!window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    let width = 0;
    let height = 0;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas!.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas!.width = width * dpr;
      canvas!.height = height * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();

    // The hero grows when the viewport narrows and text rewraps, so track the
    // element itself rather than just the window.
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    const comets: Comet[] = [];
    let nextSpawn = 300;

    function spawn() {
      if (comets.length >= MAX_COMETS) return;
      // Pixels per 60fps frame. Fast enough to actually cross the hero within
      // its lifetime — at a drift speed they never make it past the top edge.
      const speed = 2.1 + Math.random() * 1.6;
      // Falling down-left at a shallow angle, the way a meteor streak reads.
      const angle = Math.PI * 0.72 + Math.random() * 0.1;
      const max = 3000;
      comets.push({
        // Start above the top edge and off to the right, so they enter frame
        // travelling rather than appearing mid-air.
        x: width * (0.35 + Math.random() * 0.9),
        y: -60 - Math.random() * 40,
        vx: Math.cos(angle) * speed, // negative — they fall to the left
        vy: Math.sin(angle) * speed,
        len: 60 + Math.random() * 90,
        width: 0.9 + Math.random() * 0.9,
        life: max,
        max,
      });
    }

    let last = performance.now();
    let frame = 0;

    function tick(now: number) {
      const dt = Math.min(now - last, 50);
      last = now;
      const step = dt / 16.67;

      nextSpawn -= dt;
      if (nextSpawn <= 0) {
        spawn();
        nextSpawn = SPAWN_MIN_MS + Math.random() * (SPAWN_MAX_MS - SPAWN_MIN_MS);
      }

      ctx!.clearRect(0, 0, width, height);
      ctx!.globalCompositeOperation = "lighter";
      ctx!.lineCap = "round";

      for (let i = comets.length - 1; i >= 0; i--) {
        const c = comets[i];
        c.life -= dt;
        c.x += c.vx * step;
        c.y += c.vy * step;

        if (c.life <= 0 || c.y - c.len > height || c.x + c.len < 0) {
          comets.splice(i, 1);
          continue;
        }

        const t = c.life / c.max;
        // Fade in over the first 15% of life and out over the last 35%, so
        // nothing pops into or out of existence mid-air.
        const fade = Math.min(1, (1 - t) / 0.15, t / 0.35);

        // Tail points back along the direction of travel, normalised so `len`
        // is a length in pixels rather than something that scales with speed.
        const inv = 1 / Math.hypot(c.vx, c.vy);
        const tailX = c.x - c.vx * inv * c.len;
        const tailY = c.y - c.vy * inv * c.len;

        const grad = ctx!.createLinearGradient(c.x, c.y, tailX, tailY);
        grad.addColorStop(0, `hsla(30, 95%, 66%, ${0.5 * fade})`);
        grad.addColorStop(0.4, `hsla(24, 90%, 55%, ${0.16 * fade})`);
        grad.addColorStop(1, "hsla(20, 90%, 50%, 0)");

        ctx!.strokeStyle = grad;
        ctx!.lineWidth = c.width;
        ctx!.beginPath();
        ctx!.moveTo(c.x, c.y);
        ctx!.lineTo(tailX, tailY);
        ctx!.stroke();

        // Small bright head.
        ctx!.beginPath();
        ctx!.arc(c.x, c.y, c.width * 0.9, 0, Math.PI * 2);
        ctx!.fillStyle = `hsla(34, 100%, 72%, ${0.65 * fade})`;
        ctx!.fill();
      }

      ctx!.globalCompositeOperation = "source-over";
      frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 h-full w-full"
    />
  );
}
