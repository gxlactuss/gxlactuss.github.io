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
   * How long the thing took. `duration` is the headline and `window` the dates
   * it was measured across — both are free text, because "one afternoon" is a
   * truer answer than any number of days would be.
   */
  work?: { duration: string; window?: string };
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
      "A dictation app for students who have to copy long write-ups by hand. It breaks a PDF into clauses, speaks them one at a time, then holds the silence for exactly as long as that clause takes to write — marking every boundary with a haptic so you can keep your eyes on the notebook instead of the screen. Punctuation, spelling and dictionary lookups sit one tap away, the preview either follows the clause across the real page or strips everything but the text in Focus mode, and everything except the voice runs on-device.",
    descriptionHighlights: [
      "breaks a PDF into clauses",
      "exactly as long as that clause takes to write",
      "Focus mode",
      "on-device",
    ],
    tech: ["SwiftUI", "Swift 6", "PDFKit", "Vision", "NaturalLanguage", "SwiftData", "AVFoundation"],
    highlight:
      "Calibrates your handwriting speed from three timed trials, drops the outlier, then sizes every silence to match",
    work: { duration: "4 weeks", window: "Jul – Aug 2026" },
    languages: [{ name: "Swift", share: 100 }],
    body: [
      "The problem here is physical, not technical. Copying a write-up off a screen means looking up and down between the page and the phone every few words, and that wrecks your handwriting and your neck long before it wrecks your notes. VocalNotes takes the screen out of the loop: it reads you a clause, goes quiet while you write it, and taps you when the next one is coming.",
      "Sizing that silence is the whole product — playback is the easy half. Settings holds a short diagnostic that reads three sentences aloud, has you write each one from memory and stops on a tap. It subtracts the reach-for-the-phone latency, throws away the outlier of the three and averages what's left into a characters-per-second profile, and reports itself inconclusive rather than inventing a number when a run doesn't hold up. Every gap after that is costed from the clause itself — its length, its numbers and symbols, whether it opens a fresh paragraph — against that profile, with a pace trim to widen or tighten the lot per document when a particular book needs more room.",
      "The reader has two faces because they answer different questions. Page shows the real PDF with the current clause highlighted and the camera following it down the page, which is what you want when you've lost your place. Focus throws the page away and sets the text large in the middle of the screen, current clause bright and the rest dimmed like song lyrics, which is what you want when you've lost the words. While dictation is running the whole preview becomes the transport — tap for more time, swipe to repeat or skip, long-press to pause — because a control you can't look at has to be findable by thumb, and every one of them answers with a haptic.",
      "The study aids all came out of actually using it. Punctuation is a toggle with two honest settings: essential names only the marks you can't hear, since the writing gap already is the full stop, while all names everything for a quotation you have to match exactly. Spell hands you a picker of the words on the current clause with the ones no dictionary knows already flagged; Define passes the same answer to the system dictionary, on-device and already aware of whatever dictionaries you've installed; Skim filters a page down to its headings for a survey pass; and a rest-break timer counts dictating time rather than app-open time, then offers the break at a sentence boundary so you don't lose a clause to it.",
      "It's one SwiftUI target in Swift 6 language mode with strict concurrency, shipping to iPhone, iPad and the Mac through Catalyst rather than a second AppKit codebase — the value is in the pacing arithmetic, and keeping two readers in step is exactly where the subtle bugs would live. PDF handling, OCR, segmentation, pacing and persistence are Apple frameworks throughout and never touch the network. Only the voice is a cloud call, and its audio is cached to disk, so a passage costs quota once and replays offline, with the system synthesizer as an automatic fallback when the network isn't there.",
    ],
  },
  {
    slug: "placed",
    logo: "/logos/placed.png",
    title: "Placed",
    description:
      "Placement prep for final-year CS students, built with a team — I own the entire front end, and a teammate built the backend and the database behind it. It ships 85 quizzes on a pass-to-unlock chain, company-wise LeetCode lists for 38 recruiters, and AI mock interviews you answer out loud and get followed up on. One SwiftUI target runs on iPhone, iPad and the Mac.",
    descriptionHighlights: [
      "built with a team",
      "the entire front end",
      "85 quizzes",
      "AI mock interviews",
    ],
    tech: ["SwiftUI", "Metal", "FastAPI", "Python", "SQLModel", "Groq", "Whisper"],
    highlight:
      "Full voice interview loop — hold to answer, Whisper transcribes it, the model asks the follow-up",
    work: { duration: "4 weeks", window: "Jul – Aug 2026" },
    languages: [
      { name: "Swift", share: 70.3 },
      { name: "Python", share: 22.8 },
      { name: "TeX", share: 6.6 },
      { name: "Other", share: 0.3 },
    ],
    body: [
      "Placed is aimed at the last year of a CS degree, the point where the syllabus stops being the thing standing between you and a job. It's a team project with a clean split: I built the whole front end — the design system, every screen, the data layer and the eight stores behind it — and a teammate built the FastAPI backend and the schema it talks to.",
      "The quiz bank is 85 quizzes, one file each, arranged category → topic → quiz. That middle level exists because of the lock rather than the length: quiz N opens once N−1 is passed, and a chain only means something between quizzes about the same subject, so every topic gets its own instead of making someone clear seven Operating Systems quizzes to reach DBMS. A validator gates the bank before it ships — it checks each quiz's category and difficulty against the actual Swift enums, rejects duplicate prompts and colliding orders, and refuses an answer key a student could ride without reading a question.",
      "The DSA side carries company-wise LeetCode lists for 38 recruiters, parsed off the main actor on first open and cached after, with the companies that actually came to campus tagged apart from the rest. Solved state is keyed by the LeetCode slug rather than by a row's position, so ticking Two Sum marks it solved in every list that asks for it, and a deduplicated catalogue across all 38 is what the global progress counts against.",
      "The mock interview had to be voice or it was pointless. You hold to answer, the app records a 16 kHz mono take with a live level meter driving the visualiser, Whisper turns it into text server-side, and the model comes back with a follow-up rather than the next scripted question. The visualiser behind it is the app's one Metal shader: a domain-warped 3D simplex noise field drawn as three stacked sheets of the same liquid sampled a moment apart, folding harder the louder you get.",
      "Everything around that exists to make coming back cheap. XP is paid against a ledger of awards already settled, so retaking a cleared quiz earns nothing and un-ticking a problem to re-tick it earns nothing twice; tiers unlock alternate app icons; the streak stores the raw set of practised days rather than a counter, so it can't be left stale by a clock change or a missed write. Add saved questions, a resume import that OCRs the PDF, a focus mode, and four themes — two dark, two light — that can follow the clock. Sign-in is email OTP plus Google and GitHub, brokered through the backend so no client secrets ever ship inside the app.",
      "It's one target with no third-party dependencies, running on iPhone, iPad and the Mac. The iPad adaptation is a single file that caps every screen at the width it was drawn for and lets the ground show either side rather than stretching, and that's also what makes the Mac build work for free through Catalyst — same binary, same column, more ground.",
    ],
  },
  {
    slug: "asciify",
    logo: "/logos/asciify.png",
    title: "ASCIIFY",
    description:
      "A side project that ran the length of one afternoon: hand it any photo and it hands back a grid of characters — ten tones for shading, two for logos, with the tonal range stretched so a photograph doesn't collapse into midtone mush. Copy the result as text or save it straight to Photos as an image. The engine is CoreGraphics and nothing else, so the same source compiles into a macOS command-line tool and conversion quality gets checked without booting a simulator.",
    descriptionHighlights: [
      "one afternoon",
      "a grid of characters",
      "as text",
      "straight to Photos as an image",
    ],
    tech: ["SwiftUI", "CoreGraphics", "ImageIO", "PhotosUI", "XCUITest"],
    highlight:
      "Trims the uniform border first, so a logo shot on a white sweep spends all 100 columns on the logo rather than on the sweep",
    work: { duration: "One afternoon", window: "Aug 2026" },
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
      "The conversion is five steps, and each one is there because the picture came out wrong without it. The photo is decoded at a bounded size with its EXIF orientation applied; a uniform border is trimmed so the subject gets the whole grid instead of sharing it with empty backdrop; the image is resampled to one pixel per character cell, halving the vertical resolution because a cell is about half as wide as it is tall and skipping that stretches everything; Rec. 709 luminance is measured and the middle 96% of the tonal range stretched across it; and a character is looked up per cell from the selected ramp.",
      "Export is two different problems. Copying puts two flavours on the clipboard at once — plain text wrapped in a triple-backtick fence, so chat apps render it monospaced instead of shredding the alignment, and RTF with a pinned monospace font and row height for anything rich-text. Saving renders the art light-on-dark and writes it into Photos. Text destinations wrap past roughly 100 columns, so the width slider marks that boundary and anything past it is for the image export only.",
      "The engine lives in its own module and imports no UIKit on purpose, so the exact same code compiles into a macOS CLI. That is the whole testing story: a ramp or a threshold can be judged by piping a photo through the command line, rather than by booting a simulator and tapping through a picker to look at one result at a time.",
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
