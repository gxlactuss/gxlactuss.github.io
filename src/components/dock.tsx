"use client";

import {
  AnimatePresence,
  m,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import { useEffect, useRef, useState } from "react";
import { SocialIcon } from "@/components/hero";
import { ThemeIcon, useTheme } from "@/components/theme";
import { sections, socials, type SectionId } from "@/lib/config";

const icons: Record<"top" | SectionId, React.ReactNode> = {
  top: <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" />,
  projects: <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" />,
  research: <path d="M9 3h6M10 3v6l-5.5 9.5A1.7 1.7 0 0 0 6 21h12a1.7 1.7 0 0 0 1.5-2.5L14 9V3M7.5 15h9" />,
  "open-source": (
    <>
      <circle cx="6" cy="18" r="2.5" />
      <circle cx="18" cy="6" r="2.5" />
      <path d="M6 3v12.5M18 8.5A9.5 9.5 0 0 1 8.5 18" />
    </>
  ),
  contests: <path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0zM7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3" />,
  guestbook: <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />,
};

function LineIcon({ id }: { id: keyof typeof icons }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className="size-full"
    >
      {icons[id]}
    </svg>
  );
}

const pages = [{ id: "top", label: "Home" }, ...sections] as const;

/**
 * A macOS-style dock pinned to the bottom of the screen. Icons swell as the
 * mouse passes over them, and a dot marks the section in view. "/" focuses it,
 * and the arrow keys move along it.
 */
export function Dock() {
  const navRef = useRef<HTMLElement>(null);
  // Infinity means "no mouse here", which leaves every item at rest size.
  const mouseX = useMotionValue(Infinity);
  const [magnify, setMagnify] = useState(false);
  const [active, setActive] = useState<string>("top");
  const reduced = useReducedMotion();
  const { theme, toggle } = useTheme();

  useEffect(() => {
    setMagnify(!reduced && !window.matchMedia("(pointer: coarse)").matches);
  }, [reduced]);

  // The active section is the last one whose top has passed 40% of the screen
  // height. At the very bottom of the page the last section wins, even if it is
  // too short to get its top that high.
  useEffect(() => {
    function update() {
      const atBottom = innerHeight + scrollY >= document.documentElement.scrollHeight - 4;
      let current: string = pages[0].id;
      for (const { id } of pages) {
        const el = document.getElementById(id);
        if (el && (atBottom || el.getBoundingClientRect().top <= innerHeight * 0.4)) current = id;
      }
      setActive(current);
    }
    update();
    addEventListener("scroll", update, { passive: true });
    addEventListener("resize", update);
    return () => {
      removeEventListener("scroll", update);
      removeEventListener("resize", update);
    };
  }, []);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement;
      if (target.closest("input, textarea, select, [contenteditable]:not([contenteditable='false'])")) return;
      event.preventDefault();
      items()[0]?.focus();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /** Dock items that are currently shown; the socials are hidden on small screens. */
  function items() {
    const all = navRef.current?.querySelectorAll<HTMLElement>("[data-dock-item]") ?? [];
    return [...all].filter((el) => el.getClientRects().length > 0);
  }

  function onKeyDown(event: React.KeyboardEvent) {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    const list = items();
    const index = list.indexOf(document.activeElement as HTMLElement);
    if (index === -1) return;
    event.preventDefault();
    const step = event.key === "ArrowRight" ? 1 : -1;
    list[(index + step + list.length) % list.length].focus();
  }

  return (
    <div
      className="pointer-events-none fixed inset-x-0 z-50 flex justify-center px-3"
      style={{ bottom: "calc(env(safe-area-inset-bottom) + 12px)" }}
    >
      <m.nav
        ref={navRef}
        aria-label="Dock"
        // Keeps the active dot's layout animation measured against the fixed dock, not the scrolled page.
        layoutRoot
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 24, delay: 0.6 }}
        onPointerMove={(e) => e.pointerType === "mouse" && mouseX.set(e.clientX)}
        onPointerLeave={() => mouseX.set(Infinity)}
        onKeyDown={onKeyDown}
        className="pointer-events-auto flex items-end gap-1 rounded-2xl border border-line bg-surface/80 p-1.5 shadow-float backdrop-blur-md"
      >
        {pages.map((page) => (
          <DockItem
            key={page.id}
            label={page.label}
            href={`#${page.id}`}
            active={active === page.id}
            mouseX={mouseX}
            magnify={magnify}
          >
            <LineIcon id={page.id} />
          </DockItem>
        ))}

        <span aria-hidden className="mx-1 h-7 w-px self-center bg-line" />

        <div className="hidden items-end gap-1 sm:flex">
          {socials.map((social) => (
            <DockItem key={social.icon} label={social.label} href={social.href} mouseX={mouseX} magnify={magnify}>
              <span className="block size-full scale-90">
                <SocialIcon icon={social.icon} />
              </span>
            </DockItem>
          ))}
        </div>

        <DockItem
          label={theme === "light" ? "Dark theme" : "Light theme"}
          onClick={(e) => toggle(e.currentTarget)}
          mouseX={mouseX}
          magnify={magnify}
        >
          <ThemeIcon theme={theme} />
        </DockItem>
      </m.nav>
    </div>
  );
}

function DockItem({
  label,
  href,
  onClick,
  active,
  mouseX,
  magnify,
  children,
}: {
  label: string;
  href?: string;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  active?: boolean;
  mouseX: MotionValue<number>;
  magnify: boolean;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [tip, setTip] = useState(false);

  const distance = useTransform(mouseX, (x) => {
    const box = ref.current?.getBoundingClientRect();
    return box ? x - box.left - box.width / 2 : Infinity;
  });
  const size = useSpring(useTransform(distance, [-120, 0, 120], [40, 56, 40]), {
    mass: 0.1,
    stiffness: 170,
    damping: 12,
  });
  const iconSize = useTransform(size, (s) => s * 0.45);

  const external = href?.startsWith("http");
  const inner = (
    <m.span className="block" style={magnify ? { width: iconSize, height: iconSize } : { width: 20, height: 20 }}>
      {children}
    </m.span>
  );
  const itemProps = {
    "data-dock-item": "",
    "aria-label": label,
    className:
      "grid size-full place-items-center rounded-xl text-muted transition-colors hover:bg-surface-2 hover:text-ink",
    onPointerEnter: (e: React.PointerEvent) => e.pointerType === "mouse" && setTip(true),
    onPointerLeave: () => setTip(false),
    // Only for keyboard focus; a tap on a phone shouldn't leave a label hanging.
    onFocus: (e: React.FocusEvent<HTMLElement>) => e.currentTarget.matches(":focus-visible") && setTip(true),
    onBlur: () => setTip(false),
  };

  return (
    <m.div
      ref={ref}
      className="relative shrink-0"
      style={magnify ? { width: size, height: size } : { width: 44, height: 44 }}
      whileTap={{ scale: 0.9 }}
    >
      {href ? (
        <a
          href={href}
          aria-current={active ? "location" : undefined}
          {...(external && { target: "_blank", rel: "me noopener noreferrer" })}
          {...itemProps}
        >
          {inner}
        </a>
      ) : (
        <button type="button" onClick={onClick} {...itemProps}>
          {inner}
        </button>
      )}

      <AnimatePresence>
        {tip && (
          <m.span
            aria-hidden
            initial={{ opacity: 0, y: 6, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 4, x: "-50%" }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className="pointer-events-none absolute bottom-full left-1/2 mb-2.5 rounded-md border border-line bg-surface-2 px-2 py-1 font-mono text-[11px] whitespace-nowrap text-ink-2"
          >
            {label}
          </m.span>
        )}
      </AnimatePresence>

      {active && (
        <span className="pointer-events-none absolute inset-x-0 -bottom-1 flex justify-center">
          <m.span layoutId="dock-active" className="size-1 rounded-full bg-accent" />
        </span>
      )}
    </m.div>
  );
}
