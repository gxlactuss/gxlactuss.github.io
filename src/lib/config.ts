/**
 * Single source of truth for everything on the site.
 * Edit this file to change content — no component changes needed.
 */

export const site = {
  name: "Mohit Samant",
  // Used for <title>, OG tags and canonical URLs. Change this if you later
  // point a custom domain at the site.
  url: "https://gxlactuss.github.io",
  // The two sentences a visitor reads first. Keep it concrete and in your own voice.
  intro:
    "I build iOS apps and the backends behind them — mostly Swift and Python, mostly things I wanted to exist and couldn't find. Lately that's been study tools that do something the obvious version doesn't.",
  location: "India",
  email: "mohitsamant1487@gmail.com",
  github: "gxlactuss",
  linkedin: "mohit-samant-7a76302ba",
  x: "Gxlactuss",
} as const;

export const nav = [
  { label: "projects", href: "/#projects" },
  { label: "shenanigans", href: "/#shenanigans" },
  { label: "writing", href: "/blog" },
] as const;

export type Project = {
  title: string;
  description: string;
  /** Keep these short — they render as small pills. */
  tech: string[];
  repo?: string;
  demo?: string;
  /** Optional one-line hard number or claim. This is the line people remember. */
  highlight?: string;
};

export const projects: Project[] = [
  {
    title: "Placed",
    description:
      "A placement-prep iOS app: AI mock interviews you answer out loud, a quiz bank with pass-to-unlock progression, and company-wise DSA lists pulled from ~38 companies. SwiftUI front end, FastAPI backend on Fly.io.",
    tech: ["SwiftUI", "FastAPI", "Python", "SQLModel", "Groq", "Gemini"],
    highlight:
      "Full voice interview loop — record the answer, Whisper transcribes it, the model asks the follow-up",
  },
  {
    title: "VocalNotes",
    description:
      "Reads a PDF aloud at the speed you can hand-write it. It speaks one clause, then goes silent for exactly as long as that clause takes to write, marking the boundaries with haptics so you never look up from the page. Everything but the voice runs on-device.",
    tech: ["SwiftUI", "Swift 6", "PDFKit", "Vision", "SwiftData", "AVFoundation"],
    highlight:
      "Calibrates your handwriting speed from three timed trials, then sizes every silence to match",
  },
];

/** Half-finished experiments, small hacks, things that aren't portfolio-grade. */
export const shenanigans: Project[] = [
  {
    title: "Minesweeper",
    description:
      "SwiftUI Minesweeper with the rules the cheap clones skip — mines are laid after your first tap so the opening move is always safe, chording works, and it keeps the five fastest clears per difficulty.",
    tech: ["SwiftUI", "Swift"],
  },
  {
    title: "Flappy Swift",
    description:
      "Worked through Gio Scalzo's SpriteKit Flappy Bird to learn how a game loop, physics bodies and parallax scrolling fit together. His code, my education.",
    tech: ["SpriteKit", "Swift"],
  },
];

/**
 * Built from `site` so the handles live in exactly one place. Rendered under the
 * intro and again in the footer; `icon` keys into the set in social-links.tsx.
 */
export const socials = [
  { label: "GitHub", icon: "github", href: `https://github.com/${site.github}` },
  { label: "LinkedIn", icon: "linkedin", href: `https://www.linkedin.com/in/${site.linkedin}/` },
  { label: "X", icon: "x", href: `https://x.com/${site.x}` },
  { label: "Email", icon: "email", href: `mailto:${site.email}` },
] as const;

/** Circular avatars at the bottom of the page. */
export const friends = [
  {
    name: "xevrion",
    href: "https://xevrion.dev/",
    avatar: "https://avatars.githubusercontent.com/u/77008538?v=4",
  },
  {
    name: "arnesh",
    href: "https://arneshbanerjee.dev/",
    avatar: "https://avatars.githubusercontent.com/u/177954836?v=4",
  },
] as const;
