"use client";

import { AnimatePresence, m, useMotionValue, useReducedMotion, useSpring, type Variants } from "motion/react";
import { Fragment, useEffect, useState } from "react";
import { CountUp } from "@/components/count-up";
import { revealItem } from "@/components/section";
import { site, socials } from "@/lib/config";

const icons: Record<(typeof socials)[number]["icon"], React.ReactNode> = {
  github: (
    <path d="M12 .5A11.5 11.5 0 0 0 .5 12a11.5 11.5 0 0 0 7.86 10.92c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.54-3.88-1.54-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.2 1.77 1.2 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.12 3.05.74.81 1.18 1.84 1.18 3.1 0 4.43-2.69 5.4-5.25 5.69.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12 11.5 11.5 0 0 0 12 .5z" />
  ),
  linkedin: (
    <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05a3.74 3.74 0 0 1 3.37-1.85c3.6 0 4.27 2.37 4.27 5.46zM5.34 7.43a2.07 2.07 0 1 1 0-4.13 2.07 2.07 0 0 1 0 4.13zM7.12 20.45H3.55V9h3.57zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
  ),
  x: (
    <path d="M18.9 1.15h3.68l-8.04 9.19L24 22.85h-7.4l-5.8-7.58-6.64 7.58H.47l8.6-9.83L0 1.15h7.59l5.24 6.93zm-1.29 19.5h2.04L6.49 3.24H4.3z" />
  ),
};

/** Filled brand mark for a social link. Sized by its parent. */
export function SocialIcon({ icon }: { icon: (typeof socials)[number]["icon"] }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className="size-full">
      {icons[icon]}
    </svg>
  );
}

const sequence: Variants = { show: { transition: { staggerChildren: 0.08 } } };
const nameVariants: Variants = { show: { transition: { staggerChildren: 0.035 } } };
const letter: Variants = {
  hidden: { opacity: 0, y: "0.4em", filter: "blur(8px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { type: "spring", stiffness: 160, damping: 18 } },
};
// The lines under the name wait for most of the name to land first.
const afterName: Variants = { show: { transition: { delayChildren: 0.35, staggerChildren: 0.09 } } };

export function Hero({
  stats,
}: {
  stats: { contributions: number; merged: number; leetcodeTop?: number };
}) {
  const words = site.name.split(" ");

  return (
    <header id="top" className="relative isolate pt-20 pb-8 sm:pt-28">
      <m.div initial="hidden" animate="show" variants={sequence}>
        <m.div variants={revealItem} className="relative mb-6 size-16">
          <img
            src="/profile.jpg"
            alt=""
            width={64}
            height={64}
            className="size-16 rounded-full object-cover ring-1 ring-line"
          />
          <LiveDot />
        </m.div>

        <m.h1
          aria-label={site.name}
          variants={nameVariants}
          className="font-display text-[clamp(2.75rem,10vw,4.5rem)] leading-none tracking-tight text-ink"
        >
          {words.map((word, w) => (
            // The space sits between the word boxes, where it can't be trimmed and the name can still wrap.
            <Fragment key={w}>
              {w > 0 && " "}
              <span aria-hidden className="inline-block whitespace-nowrap">
                {[...word].map((char, i) => (
                  <m.span key={i} variants={letter} className="inline-block">
                    {char}
                  </m.span>
                ))}
              </span>
            </Fragment>
          ))}
        </m.h1>

        <m.div variants={afterName}>
          <m.p variants={revealItem} className="mt-4 font-mono text-xs text-muted">
            {site.role}
            <span className="mx-2 text-faint">/</span>
            <span className="whitespace-nowrap">
              {site.location}
              <LocalTime />
            </span>
          </m.p>

          <m.p variants={revealItem} className="mt-6 text-base leading-relaxed text-muted sm:text-[17px]">
            <Intro />
          </m.p>

          {(stats.contributions > 0 || stats.merged > 0) && (
            <m.ul
              variants={revealItem}
              className="mt-5 flex flex-wrap gap-x-5 gap-y-1.5 font-mono text-xs text-muted"
            >
              {stats.contributions > 0 && (
                <Stat value={stats.contributions} label="contributions this year" />
              )}
              {stats.merged > 0 && <Stat value={stats.merged} label="PRs merged" />}
              {stats.leetcodeTop !== undefined && (
                <li className="flex items-center gap-2">
                  <span className="size-1 rounded-full bg-accent" aria-hidden />
                  <span>
                    <span className="text-ink">Top {stats.leetcodeTop}%</span> on LeetCode
                  </span>
                </li>
              )}
            </m.ul>
          )}

          <m.div variants={revealItem} className="mt-7 flex flex-wrap items-center gap-2">
            <m.a
              href={`mailto:${site.email}`}
              whileTap={{ scale: 0.96 }}
              className="mr-1 inline-flex h-11 items-center rounded-full bg-accent px-5 text-sm font-medium text-bg"
            >
              Say hi
            </m.a>
            {socials.map((social) => (
              <MagneticIcon key={social.icon} social={social} />
            ))}
          </m.div>
        </m.div>
      </m.div>
    </header>
  );
}

// The ping is hidden with CSS rather than left out of the markup: useReducedMotion
// is already true on the first client render, so leaving it out breaks hydration.
function LiveDot() {
  return (
    <span className="absolute right-0 bottom-0.5 size-3" aria-hidden>
      <m.span
        className="absolute inset-0 rounded-full bg-live motion-reduce:hidden"
        animate={{ scale: [1, 2.4], opacity: [0.6, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
      />
      <span className="absolute inset-0 rounded-full bg-live ring-2 ring-bg" />
    </span>
  );
}

const timeFormat = new Intl.DateTimeFormat("en-US", {
  timeZone: site.timeZone,
  hour: "numeric",
  minute: "2-digit",
});

/** Local time where I am. Empty on the server, since the build can't know the visitor's clock. */
function LocalTime() {
  const [time, setTime] = useState<string>();

  useEffect(() => {
    const tick = () => setTime(timeFormat.format(new Date()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  if (!time) return null;

  return (
    <>
      <span className="mx-2 text-faint">·</span>
      <span className="relative inline-flex overflow-hidden align-bottom tabular-nums">
        <AnimatePresence mode="popLayout" initial={false}>
          <m.span
            key={time}
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "-100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {time}
          </m.span>
        </AnimatePresence>
      </span>
    </>
  );
}

/** The intro with its highlight phrases brought up to full ink. */
function Intro() {
  const escaped = site.introHighlights.map((h) => h.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const parts = site.intro.split(new RegExp(`(${escaped.join("|")})`));
  const highlights: readonly string[] = site.introHighlights;

  return parts.map((part, i) =>
    highlights.includes(part) ? (
      <span key={i} className="text-ink">
        {part}
      </span>
    ) : (
      part
    ),
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <li className="flex items-center gap-2">
      <span className="size-1 rounded-full bg-accent" aria-hidden />
      <span>
        <span className="text-ink">
          <CountUp value={value} />
        </span>{" "}
        {label}
      </span>
    </li>
  );
}

/** Max distance, in px, the icon leans toward the mouse. */
const PULL_MAX = 6;

function MagneticIcon({ social }: { social: (typeof socials)[number] }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 260, damping: 18, mass: 0.4 });
  const springY = useSpring(y, { stiffness: 260, damping: 18, mass: 0.4 });
  const reduced = useReducedMotion();

  function onPointerMove(event: React.PointerEvent<HTMLAnchorElement>) {
    // Touch pointers have no hover; moving the target under a finger only makes it harder to tap.
    if (reduced || event.pointerType !== "mouse") return;
    const box = event.currentTarget.getBoundingClientRect();
    const clamp = (v: number) => Math.max(-PULL_MAX, Math.min(PULL_MAX, v * 0.3));
    x.set(clamp(event.clientX - (box.left + box.width / 2)));
    y.set(clamp(event.clientY - (box.top + box.height / 2)));
  }

  function release() {
    x.set(0);
    y.set(0);
  }

  return (
    <m.a
      href={social.href}
      target="_blank"
      rel="me noopener noreferrer"
      aria-label={social.label}
      style={{ x: springX, y: springY }}
      onPointerMove={onPointerMove}
      onPointerLeave={release}
      onBlur={release}
      whileTap={{ scale: 0.92 }}
      className="grid size-11 place-items-center rounded-full border border-line text-muted transition-colors hover:border-line-strong hover:text-ink"
    >
      <span className="size-[18px]">
        <SocialIcon icon={social.icon} />
      </span>
    </m.a>
  );
}
