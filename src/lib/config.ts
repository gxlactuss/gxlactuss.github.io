/**
 * Single source of truth for everything on the site.
 * Edit this file to change content — no component changes needed.
 */

export const site = {
  name: "Mohit Samant",
  // Used for <title>, OG tags and canonical URLs. Change this if you later
  // point a custom domain at the site.
  url: "https://gxlactuss.github.io",
  // The two sentences a visitor reads first. Keep it concrete and in your voice.
  intro:
    "I build iOS apps and the backends behind them — mostly Swift and Python, mostly things I wanted to exist and couldn't find. Lately that's been study tools that do something the obvious version doesn't.",
  /** Words in `intro` painted in the accent. Matched whole-word, case-insensitive. */
  introHighlights: ["iOS apps", "backends", "Swift", "Python", "study tools"],
  location: "India",
  email: "mohitsamant1487@gmail.com",
  github: "gxlactuss",
  linkedin: "mohit-samant-7a76302ba",
  x: "Gxlactuss",
} as const;

/** The block beside your photo. Set `age` to null to hide that line. */
export const profile = {
  photo: "/profile.jpg",
  age: 19 as number | null,
  college: "KJSIT",
  degree: "BTech in Computer Engineering",
  graduation: "2025–2029",
  /** Rendered as its own badge, not buried in the facts list. Null hides it. */
  cgpa: "9.71" as string | null,
} as const;

export const nav = [
  { label: "projects", href: "/#projects" },
  { label: "shenanigans", href: "/#shenanigans" },
  { label: "resume", href: "/#resume" },
] as const;

export type Project = {
  /** URL segment: /projects/<slug>. Lowercase, hyphens only. */
  slug: string;
  title: string;
  description: string;
  /** Keep these short — they render as small pills. */
  tech: string[];
  repo?: string;
  demo?: string;
  /** One-line hard number or claim. This is the line people remember. */
  highlight?: string;
  /**
   * Demo video for the project page. Drop the file in `public/videos/` and set
   * this to e.g. "/videos/placed.mp4". Until then the page shows a placeholder.
   */
  video?: string;
  /** Optional poster frame shown before the video plays, e.g. "/videos/placed.jpg". */
  poster?: string;
  /** Long-form copy for the project page. One string per paragraph. */
  body?: string[];
};

export const projects: Project[] = [
  {
    slug: "placed",
    title: "Placed",
    description:
      "A placement-prep iOS app: AI mock interviews you answer out loud, a quiz bank with pass-to-unlock progression, and company-wise DSA lists pulled from ~38 companies. SwiftUI front end, FastAPI backend on Fly.io.",
    tech: ["SwiftUI", "FastAPI", "Python", "SQLModel", "Groq", "Whisper"],
    highlight:
      "Full voice interview loop — record the answer, Whisper transcribes it, the model asks the follow-up",
    body: [
      "Replace this with the long version. What the app does, who it's for, and why you built it.",
      "Then the interesting part: what was hard, what you tried that didn't work, and what you'd do differently.",
    ],
  },
  {
    slug: "vocalnotes",
    title: "VocalNotes",
    description:
      "Reads a PDF aloud at the speed you can hand-write it. It speaks one clause, then goes silent for exactly as long as that clause takes to write, marking the boundaries with haptics so you never look up from the page. Everything but the voice runs on-device.",
    tech: ["SwiftUI", "Swift 6", "PDFKit", "Vision", "SwiftData", "AVFoundation"],
    highlight:
      "Calibrates your handwriting speed from three timed trials, then sizes every silence to match",
    body: [
      "Replace this with the long version. The problem is physical — looking up and down between a screen and a notebook wrecks handwriting — so lead with that.",
      "Then the pacing model: how the silence is sized, and why that's the hard part rather than the playback.",
    ],
  },
];

/** Half-finished experiments, small hacks, things that aren't portfolio-grade. */
export const shenanigans: Project[] = [
  {
    slug: "minesweeper",
    title: "Minesweeper",
    description:
      "SwiftUI Minesweeper with the rules the cheap clones skip — mines are laid after your first tap so the opening move is always safe, chording works, and it keeps the five fastest clears per difficulty.",
    tech: ["SwiftUI", "Swift"],
  },
  {
    slug: "flappy-swift",
    title: "Flappy Swift",
    description:
      "Worked through Gio Scalzo's SpriteKit Flappy Bird to learn how a game loop, physics bodies and parallax scrolling fit together. His code, my education.",
    tech: ["SpriteKit", "Swift"],
  },
];

/** Every project, for lookups by slug on the detail pages. */
export const allProjects: Project[] = [...projects, ...shenanigans];

/**
 * Drop your PDF at `public/resume.pdf`. The Resume section detects it at build
 * time — until the file exists it renders a "coming soon" card instead of a
 * download link that 404s.
 */
export const resume = {
  path: "/resume.pdf",
  /** Shown as the downloaded filename. */
  filename: "Mohit-Samant-Resume.pdf",
} as const;

export type Paper = {
  title: string;
  /** Venue, or where it's hosted. Optional. */
  venue?: string;
  year?: string;
  /**
   * Either an external URL (arXiv, a journal, etc.) or a path to a PDF you drop
   * in `public/papers/`. A local path is checked on disk at build time, so the
   * entry renders as plain text until the file actually exists.
   */
  href?: string;
};

export const research: { published: Paper[]; preprints: Paper[] } = {
  published: [],
  preprints: [
    {
      title: "Network Intrusion Detection System (NIDS) prediction model",
      href: "/papers/nids-prediction-model.pdf",
    },
  ],
};

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
