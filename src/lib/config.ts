/**
 * Single source of truth for everything on the site.
 * Edit this file to change content — no component changes needed.
 */

export const site = {
  name: "Mohit Samant",
  // Used for <title>, OG tags and canonical URLs.
  url: "https://mohitsamant.me",
  // The two sentences a visitor reads first. Keep it concrete and in your voice.
  intro:
    "I build fully native iOS apps, Flutter frontends and ML models. Almost every one of them started as an inconvenience in my own life — something I wanted to exist, couldn't find, and ended up writing myself.",
  /** Words in `intro` painted in the accent. Matched whole-word, case-insensitive. */
  introHighlights: [
    "fully native iOS apps",
    "Flutter frontends",
    "ML models",
    "an inconvenience in my own life",
  ],
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
  { label: "resume", href: "/#resume" },
  { label: "guestbook", href: "/#guestbook" },
] as const;

/**
 * The platforms a demo can be recorded on, in tab order. `aspect` is width ÷
 * height and is only the *default* for that platform — it reserves the right
 * box before the file loads so the page never jumps, and anything ≥ 1 is laid
 * out as a wide recording (video above the copy) instead of a phone-shaped one
 * (video beside it). Override it per video when a recording breaks the mould.
 */
export const platforms = [
  { id: "ios", label: "iOS", aspect: 9 / 16 },
  { id: "ipados", label: "iPadOS", aspect: 4 / 3 },
  { id: "macos", label: "macOS", aspect: 16 / 10 },
] as const;

export type Platform = (typeof platforms)[number]["id"];

export type Demo = {
  /** Path under `public/videos/`, e.g. "/videos/placed-ios.mp4". */
  src: string;
  /** Still frame shown before playback, e.g. "/videos/placed-ios.jpg". */
  poster?: string;
  /** Width ÷ height, when the recording isn't the platform default above. */
  aspect?: number;
};

/** One slice of the language bar under a demo. `share` is a percentage. */
export type Language = { name: string; share: number };

/**
 * Language swatches, taken from GitHub's linguist so the bar reads the way the
 * one on a repo page does. A name that isn't listed falls back to the grey.
 */
export const languageColors: Record<string, string> = {
  Swift: "#f05138",
  Python: "#3572a5",
  TeX: "#3d6117",
  Metal: "#8f14e9",
  Dart: "#00b4ab",
  Shell: "#89e051",
  C: "#555555",
  Other: "#8b8b8b",
};

export function languageColor(name: string) {
  return languageColors[name] ?? languageColors.Other;
}

export type Project = {
  /** URL segment: /projects/<slug>. Lowercase, hyphens only. */
  slug: string;
  title: string;
  description: string;
  /** Phrases in `description` painted in the accent, same as `introHighlights`. */
  descriptionHighlights?: string[];
  /** Keep these short — they render as small pills. */
  tech: string[];
  repo?: string;
  demo?: string;
  /** One-line hard number or claim. This is the line people remember. */
  highlight?: string;
  /** App icon shown on the card and beside the title, e.g. "/logos/placed.png". */
  logo?: string;
  /**
   * The language split shown under the demo, GitHub style. Shares are
   * percentages and should add up to about 100; colours come from
   * `languageColors` above, keyed by name.
   */
  languages?: Language[];
  /**
   * Demo videos for the project page, one per platform. Drop the files in
   * `public/videos/` and list only the platforms you actually recorded — a
   * platform you leave out gets no tab, and no videos at all leaves the
   * placeholder in place.
   */
  demos?: Partial<Record<Platform, Demo>>;
  /** Long-form copy for the project page. One string per paragraph. */
  body?: string[];
};

export const projects: Project[] = [
  {
    slug: "vocalnotes",
    logo: "/logos/vocalnotes.png",
    title: "VocalNotes",
    description:
      "A dictation app for students who copy long write-ups by hand. It reads a document aloud one clause at a time and waits while you write, pacing itself to your own handwriting speed so your eyes never have to leave the notebook. Follow along on the full page or in a stripped-back focus view, with spelling, punctuation and dictionary lookups a tap away.",
    descriptionHighlights: [
      "one clause at a time",
      "your own handwriting speed",
      "focus view",
    ],
    tech: ["SwiftUI", "Swift 6", "PDFKit", "Vision", "NaturalLanguage", "SwiftData", "AVFoundation"],
    highlight: "Learns how fast you write, then sizes every pause to match",
    demos: {
      // Cropped out of a 1080p desktop capture — the simulator window sat on
      // the wallpaper, so this is the phone screen alone at
      // crop=392:854:702:148. The window never moves, so one crop holds for the
      // whole recording.
      //
      // The only demo here that keeps its audio, because on this app the voice
      // IS the feature — a silent VocalNotes demo shows the UI and hides the
      // product. The first clause is spoken around 0:24.
      ios: {
        src: "/videos/vocalnotes-ios.mp4",
        poster: "/videos/vocalnotes-ios.jpg",
        aspect: 588 / 1280,
      },
    },
    languages: [{ name: "Swift", share: 100 }],
    body: [
      "The problem is physical, not technical: copying off a screen means looking up and down every few words, and that wrecks your handwriting and your neck long before it wrecks your notes. So the screen leaves the loop — it reads you a clause, goes quiet while you write it, and taps you when the next one is coming. Sizing that silence is the whole product; playback is the easy half.",
      "A diagnostic in Settings reads three sentences aloud, has you write each from memory and stops on a tap, then drops the outlier, subtracts the reach-for-the-phone latency and averages the rest into a characters-per-second profile. Every gap after that is costed from the clause itself against that profile. Page follows the real PDF with the current clause highlighted, Focus throws the page away and sets the text large, punctuation and spelling and dictionary lookups sit one tap away, and everything but the voice runs on-device.",
    ],
  },
  {
    slug: "placed",
    logo: "/logos/placed.png",
    title: "Placed",
    description:
      "Placement prep for final-year computer science students. It covers what an interview actually asks for: 85 topic quizzes that unlock in a chain as you pass them, coding practice lists sorted by the 38 companies that set them, and mock interviews you answer out loud and get a follow-up question back from. One app across iPhone, iPad and the Mac.",
    descriptionHighlights: [
      "85 topic quizzes",
      "answer out loud",
      "iPhone, iPad and the Mac",
    ],
    tech: ["SwiftUI", "Metal", "FastAPI", "Python", "SQLModel", "Groq", "Whisper"],
    highlight: "Answer the mock interview out loud and it asks a follow-up, the way a real one would",
    demos: {
      // Two simulator recordings joined end to end — onboarding through a full
      // quiz, then the mock interview and the LeetCode lists. The five
      // interview rounds run at 3x: they're the same hold-to-talk loop five
      // times over, and three minutes of it is the one stretch of this demo
      // nobody watches to the end.
      ios: {
        src: "/videos/placed-ios.mp4",
        poster: "/videos/placed-ios.jpg",
        aspect: 588 / 1280,
      },
    },
    languages: [
      { name: "Swift", share: 70.3 },
      { name: "Python", share: 22.8 },
      { name: "TeX", share: 6.6 },
      { name: "Other", share: 0.3 },
    ],
    body: [
      "Placed is aimed at the last year of a CS degree, the point where the syllabus stops being the thing standing between you and a job. It is one SwiftUI target with no third-party dependencies — a design system, every screen and the eight stores behind them — against a FastAPI backend, and the same binary runs on iPhone, iPad and the Mac.",
      "Quizzes chain per topic rather than per category, so nobody clears seven Operating Systems quizzes to reach DBMS, and a validator rejects duplicate prompts and any answer key a student could ride without reading a question. Solved state is keyed by the LeetCode slug, so ticking Two Sum marks it solved in every company that asks for it. The mock interview had to be voice or it was pointless: hold to answer, Whisper transcribes server-side, and the model comes back with a follow-up rather than the next scripted question.",
    ],
  },
  {
    slug: "asciify",
    logo: "/logos/asciify.png",
    title: "ASCIIFY",
    description:
      "Turns any photo into a picture made of text characters. Two styles — one shaded for photographs, one two-tone for logos — and a slider for how wide the result should be. Copy it as text or save it straight to Photos as an image.",
    descriptionHighlights: [
      "a picture made of text characters",
      "as text",
      "as an image",
    ],
    tech: ["SwiftUI", "CoreGraphics", "ImageIO", "PhotosUI", "XCUITest"],
    highlight: "Finds the subject and gives it the whole frame, so logos come out as sharp as photographs",
    languages: [{ name: "Swift", share: 100 }],
    demos: {
      // A phone screen recording, narrower than the 9/16 default.
      ios: {
        src: "/videos/asciify-ios.mp4",
        poster: "/videos/asciify-ios.jpg",
        aspect: 588 / 1280,
      },
    },
    body: [
      "Five steps, each one there because the picture came out wrong without it: decode at a bounded size with the EXIF orientation applied, trim the uniform border so the subject gets the whole grid, resample to one pixel per character cell — halving the vertical resolution, since a cell is about half as wide as it is tall — measure Rec. 709 luminance and stretch the middle 96% of the tonal range, then look up a character per cell.",
      "Copying puts two flavours on the clipboard at once: plain text in a triple-backtick fence, so chat apps render it monospaced instead of shredding the alignment, and RTF with a pinned monospace font for rich-text targets. Text wraps past roughly 100 columns, so the width slider marks that boundary and anything past it is for the image export. The engine imports no UIKit on purpose, so the same code compiles into a macOS CLI and a ramp change can be judged from the command line.",
    ],
  },
];

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
  /** In listed order, first author first. */
  authors?: string[];
  /** Venue, or where it's hosted. Optional. */
  venue?: string;
  year?: string;
  /**
   * A write-up page on this site, served at `/research/<slug>`. Takes
   * precedence over `href` — an internal page is always there, where a PDF
   * link is only as good as the file behind it.
   */
  slug?: string;
  /**
   * Either an external URL (arXiv, a journal, etc.) or a path to a PDF you drop
   * in `public/papers/`. A local path is checked on disk at build time, so the
   * entry renders as plain text until the file actually exists.
   */
  href?: string;
};

export const research: { preprints: Paper[] } = {
  preprints: [
    {
      title:
        "A Multi-Tiered Stacking Ensemble for Network Intrusion Detection and Alert Correlation",
      authors: ["Mohit Samant", "Prof. Datta H. Deshmukh"],
      year: "2026",
      slug: "nids-stacking-ensemble",
    },
  ],
};

/**
 * Guestbook, backed by this repo's GitHub Discussions through giscus.
 *
 * The IDs are not secrets — giscus needs them client-side, and they only
 * identify a public repo and a public discussion category.
 *
 * One-time setup: install the giscus app on the repo at
 * https://github.com/apps/giscus (Discussions is already enabled).
 */
export const giscus = {
  /**
   * Flip to true once the giscus app is installed on the repo. Until then the
   * widget renders "giscus is not installed on this repository" to every
   * visitor, so the page shows a placeholder instead.
   */
  enabled: true,
  repo: "gxlactuss/gxlactuss.github.io",
  repoId: "R_kgDOT4lFhw",
  category: "General",
  categoryId: "DIC_kwDOT4lFh84DDuV6",
  /** All entries land in one discussion thread with this title. */
  term: "Guestbook",
} as const;

/**
 * Built from `site` so the handles live in exactly one place. Rendered under the
 * intro and again in the footer; `icon` keys into the set in social-links.tsx.
 *
 * Email is deliberately not here. An address is worth reading, and a row of
 * identical pills is the one place on the page it would not be read — it says
 * "Reach me at …" under the intro instead.
 */
export const socials = [
  { label: "GitHub", icon: "github", href: `https://github.com/${site.github}` },
  { label: "LinkedIn", icon: "linkedin", href: `https://www.linkedin.com/in/${site.linkedin}/` },
  { label: "X", icon: "x", href: `https://x.com/${site.x}` },
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
  {
    name: "chishxd",
    href: "https://chishxd.xyz/",
    avatar: "https://avatars.githubusercontent.com/u/182657360?v=4",
  },
  {
    name: "quantinium",
    href: "https://quantinium.dev/",
    avatar: "https://avatars.githubusercontent.com/u/72118517?v=4",
  },
  {
    name: "lyra",
    href: "https://lyradossier.vercel.app/",
    avatar: "https://avatars.githubusercontent.com/u/309473272?v=4",
  },
] as const;
