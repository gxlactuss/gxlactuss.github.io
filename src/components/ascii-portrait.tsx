"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { profile, site } from "@/lib/config";

/**
 * Ten tones, sparse to dense. The count is not arbitrary — it is the ramp
 * Asciify uses for photographs, as against the two-tone one it switches to for
 * logos, so the portrait is shaded by the same rules the app itself applies.
 */
const RAMP = " .:-=+*#%@";

/** Character columns across the portrait. */
const COLS = 36;

/**
 * How far a pixel may sit from the background luminance and still count as
 * background, and how much of a row must qualify before it is trimmed.
 *
 * Neither is fussy on purpose. Asciify's trim assumes a flat studio sweep; a
 * photograph taken outdoors has a *textured* background, and a rule that wants
 * every pixel in a row to match stops at the first blade of grass and trims
 * almost nothing. Letting one row in twelve disagree finds the subject instead.
 */
const BACKGROUND_TOLERANCE = 0.14;
const BACKGROUND_SHARE = 0.92;

/**
 * A character cell is about half as wide as it is tall, so the row count is
 * halved against the aspect ratio. Skip this and the face comes out stretched
 * to twice its height, which is the classic way ASCII art goes wrong.
 */
const CELL_RATIO = 0.5;

/** Rec. 709 luminance, normalised to 0–1. */
function luma(r: number, g: number, b: number) {
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

/**
 * The background luminance, as the median of the four edges.
 *
 * A single corner pixel is what the original of this used and it is too
 * fragile — one dark vignette corner and the whole frame reads as "subject".
 */
function backgroundLevel(data: Uint8ClampedArray, w: number, h: number) {
  const at = (x: number, y: number) => {
    const i = (y * w + x) * 4;
    return luma(data[i], data[i + 1], data[i + 2]);
  };
  const edge: number[] = [];
  for (let x = 0; x < w; x++) {
    edge.push(at(x, 0));
    edge.push(at(x, h - 1));
  }
  for (let y = 0; y < h; y++) {
    edge.push(at(0, y));
    edge.push(at(w - 1, y));
  }
  edge.sort((a, b) => a - b);
  return edge[Math.floor(edge.length / 2)];
}

/**
 * The subject's bounding box, found by eating in from each edge for as long as
 * the row or column is still mostly background.
 *
 * This is the step that decides whether the portrait reads at all. Without it
 * the frame is spent on whatever the photo was taken against, and the subject
 * is left a handful of columns wide — far too coarse to resolve a person.
 */
function trimBackground(data: Uint8ClampedArray, w: number, h: number) {
  const reference = backgroundLevel(data, w, h);
  const at = (x: number, y: number) => {
    const i = (y * w + x) * 4;
    return luma(data[i], data[i + 1], data[i + 2]);
  };

  let top = 0;
  let bottom = h - 1;
  let left = 0;
  let right = w - 1;

  const rowShare = (y: number) => {
    let n = 0;
    for (let x = left; x <= right; x++) {
      if (Math.abs(at(x, y) - reference) <= BACKGROUND_TOLERANCE) n++;
    }
    return n / (right - left + 1);
  };
  const colShare = (x: number) => {
    let n = 0;
    for (let y = top; y <= bottom; y++) {
      if (Math.abs(at(x, y) - reference) <= BACKGROUND_TOLERANCE) n++;
    }
    return n / (bottom - top + 1);
  };

  while (top < bottom && rowShare(top) >= BACKGROUND_SHARE) top++;
  while (bottom > top && rowShare(bottom) >= BACKGROUND_SHARE) bottom--;
  while (left < right && colShare(left) >= BACKGROUND_SHARE) left++;
  while (right > left && colShare(right) >= BACKGROUND_SHARE) right--;

  return { x: left, y: top, w: right - left + 1, h: bottom - top + 1 };
}

/**
 * Grow a crop to the frame's aspect ratio, centred and clamped to the source.
 *
 * The trim returns whatever shape the subject happens to be, and painting a
 * 100x172 crop into a 112x140 box would squash the figure. Widening the crop
 * instead keeps the proportions honest and just admits a little more
 * background at the sides.
 */
function matchAspect(
  crop: { x: number; y: number; w: number; h: number },
  aspect: number,
  w: number,
  h: number,
) {
  let { x, y, w: cw, h: ch } = crop;
  if (cw / ch < aspect) {
    const want = Math.min(w, ch * aspect);
    x = Math.max(0, Math.min(w - want, x - (want - cw) / 2));
    cw = want;
  } else {
    const want = Math.min(h, cw / aspect);
    y = Math.max(0, Math.min(h - want, y - (want - ch) / 2));
    ch = want;
  }
  return { x, y, w: cw, h: ch };
}

/**
 * The profile photo, rendered as ASCII.
 *
 * This is the site demonstrating one of its own projects rather than describing
 * it: the pipeline below is Asciify's, in miniature — trim the uniform border,
 * resample to one pixel per character cell with the vertical halved, measure
 * Rec. 709 luminance, stretch the middle 96% of the tonal range, then look up a
 * character per cell.
 *
 * The photograph is always in the DOM as a real <img>, so it is what a screen
 * reader announces, what a crawler indexes, and what shows if this component
 * never runs. The canvas is decoration layered on top and is hidden from
 * assistive tech entirely.
 */
export function AsciiPortrait({ className = "" }: { className?: string }) {
  const img = useRef<HTMLImageElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);
  /** Held open by a click or tap, as against the hover that ends when you leave. */
  const [pinned, setPinned] = useState(false);
  const [hovered, setHovered] = useState(false);

  const engaged = pinned || hovered;
  const showAscii = ready && (profile.asciiFirst ? !engaged : engaged);

  const draw = useCallback(() => {
    const source = img.current;
    const target = canvas.current;
    if (!source || !target || !source.complete || !source.naturalWidth) return;

    const box = target.getBoundingClientRect();
    if (!box.width) return;

    // Sample at a middling size first: the trim needs more detail than 36
    // columns carries, but nothing like the full source resolution.
    const scratch = document.createElement("canvas");
    const sw = 200;
    const sh = Math.max(1, Math.round((sw * source.naturalHeight) / source.naturalWidth));
    scratch.width = sw;
    scratch.height = sh;
    const sctx = scratch.getContext("2d", { willReadFrequently: true });
    if (!sctx) return;
    sctx.drawImage(source, 0, 0, sw, sh);

    let crop = { x: 0, y: 0, w: sw, h: sh };
    try {
      crop = trimBackground(sctx.getImageData(0, 0, sw, sh).data, sw, sh);
    } catch {
      // A tainted canvas throws here. The photo is same-origin so it should not
      // happen, but losing the portrait over it would be a poor trade — the
      // whole frame is a worse crop, not a broken one.
    }
    crop = matchAspect(crop, box.width / box.height, sw, sh);

    const rows = Math.max(1, Math.round(COLS * (crop.h / crop.w) * CELL_RATIO));

    // Second pass: the crop, squeezed to exactly one pixel per character cell.
    // The browser's own downscaling does the averaging.
    const cells = document.createElement("canvas");
    cells.width = COLS;
    cells.height = rows;
    const cctx = cells.getContext("2d", { willReadFrequently: true });
    if (!cctx) return;
    cctx.drawImage(scratch, crop.x, crop.y, crop.w, crop.h, 0, 0, COLS, rows);
    const pixels = cctx.getImageData(0, 0, COLS, rows).data;

    const values: number[] = [];
    for (let i = 0; i < COLS * rows; i++) {
      values.push(luma(pixels[i * 4], pixels[i * 4 + 1], pixels[i * 4 + 2]));
    }

    // Stretch the middle 96%. A photograph rarely uses the full range, and
    // mapping its actual range onto the ramp is the difference between a face
    // and a grey rectangle. Percentiles rather than min/max so one blown
    // highlight cannot flatten everything else.
    const sorted = [...values].sort((a, b) => a - b);
    const low = sorted[Math.floor(sorted.length * 0.02)];
    const high = sorted[Math.min(sorted.length - 1, Math.ceil(sorted.length * 0.98))];
    const span = Math.max(high - low, 1e-6);

    // Which end of the ramp the subject belongs on. A portrait's subject is
    // near the middle, so comparing the middle against the rim says whether it
    // is darker or lighter than what surrounds it, and the ramp is walked so
    // the *subject* ends up dense either way. Getting this backwards fills the
    // frame with the background and leaves the subject as a hole.
    let middle = 0;
    let middleCount = 0;
    let rim = 0;
    let rimCount = 0;
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < COLS; col++) {
        const inner =
          row > rows * 0.25 && row < rows * 0.75 && col > COLS * 0.25 && col < COLS * 0.75;
        if (inner) {
          middle += values[row * COLS + col];
          middleCount++;
        } else {
          rim += values[row * COLS + col];
          rimCount++;
        }
      }
    }
    const subjectIsDark = middleCount > 0 && rimCount > 0 && middle / middleCount < rim / rimCount;

    const styles = getComputedStyle(target);
    const mono = styles.getPropertyValue("--font-geist-mono").trim();

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    target.width = Math.round(box.width * dpr);
    target.height = Math.round(box.height * dpr);
    const ctx = target.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, box.width, box.height);

    const cellW = box.width / COLS;
    const cellH = box.height / rows;
    ctx.font = `${(cellW / 0.6).toFixed(2)}px ${mono ? `${mono},` : ""} ui-monospace, monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = styles.color;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < COLS; col++) {
        const normalised = Math.min(1, Math.max(0, (values[row * COLS + col] - low) / span));
        const tone = subjectIsDark ? 1 - normalised : normalised;
        const glyph = RAMP[Math.min(RAMP.length - 1, Math.floor(tone * RAMP.length))];
        if (glyph !== " ") ctx.fillText(glyph, (col + 0.5) * cellW, (row + 0.5) * cellH);
      }
    }

    setReady(true);
  }, []);

  useEffect(() => {
    const source = img.current;
    if (!source) return;
    if (source.complete) draw();
    else source.addEventListener("load", draw, { once: true });

    // The glyph colour and the ramp direction both depend on the theme, so a
    // portrait drawn once would invert itself the first time the toggle is hit.
    const observer = new MutationObserver(draw);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    // Redraw on resize too: the canvas is sized in CSS pixels and the layout
    // steps up a size at the `sm` breakpoint.
    const resize = new ResizeObserver(draw);
    resize.observe(source);

    return () => {
      source.removeEventListener("load", draw);
      observer.disconnect();
      resize.disconnect();
    };
  }, [draw]);

  return (
    <button
      type="button"
      onClick={() => setPinned((p) => !p)}
      onPointerEnter={(e) => e.pointerType === "mouse" && setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      aria-pressed={pinned}
      aria-label={
        showAscii ? `Show the photograph of ${site.name}` : `Show ${site.name} as ASCII`
      }
      className={`group relative block shrink-0 overflow-hidden rounded-lg border border-border ${className}`}
    >
      <Image
        ref={img}
        src={profile.photo}
        alt={site.name}
        width={112}
        height={140}
        priority
        className={`block h-auto w-full object-cover transition-opacity duration-500 ${
          showAscii ? "opacity-0" : "opacity-100"
        }`}
      />
      {/* Decoration: the <img> above already carries the name. */}
      <canvas
        ref={canvas}
        aria-hidden="true"
        className={`absolute inset-0 h-full w-full bg-bg-subtle text-fg transition-opacity duration-500 ${
          showAscii ? "opacity-100" : "opacity-0"
        }`}
      />
    </button>
  );
}
