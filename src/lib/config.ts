/**
 * Single source of truth for everything on the site.
 * Edit this file to change content — no component changes needed.
 */

export const site = {
  name: "Mohit Samant",
  // Used for <title>, OG tags and canonical URLs.
  url: "https://mohitsamant.me",
  /**
   * The line search results and link previews get. Separate from `intro`
   * because the two are read in different places: this one arrives with no
   * context and has to say who and what up front, while `intro` sits directly
   * under a heading that already gives the name.
   *
   * Everything after the name is also printed into the link-preview banner at
   * src/app/opengraph-image.jpg, which is a flat image and cannot read this —
   * change one and the other goes stale without anything failing. Regenerate
   * the banner when this changes.
   */
  description:
    "Mohit Samant - iOS app developer & CSE student at KJSIT, I make iOS apps and ML models",
  // The two sentences a visitor reads first. Keep it concrete and in your voice.
  intro:
    "I build fully native iOS apps and ML models. Almost every one of them started as an inconvenience in my own life.",
  /** Words in `intro` painted in the accent. Matched whole-word, case-insensitive. */
  introHighlights: ["fully native iOS apps", "ML models", "an inconvenience in my own life"],
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
  { id: "chrome", label: "Chrome", aspect: 16 / 9 },
] as const;

export type Platform = (typeof platforms)[number]["id"];

export type Demo = {
  /** Path under `public/videos/`, e.g. "/videos/placed-ios.mp4". */
  src: string;
  /**
   * The frame shown before playback, e.g. "/videos/placed-ios.jpg".
   *
   * These are generated, not grabbed from the recording — the app's icon on the
   * site's own dark ground, at the video's exact dimensions. A still pulled out
   * of the middle of a demo lands on whatever screen the app happened to be on,
   * which reads as a mistake rather than a title card.
   */
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
  JavaScript: "#f1e05a",
  CSS: "#663399",
  HTML: "#e34c26",
  Other: "#8b8b8b",
};

export function languageColor(name: string) {
  return languageColors[name] ?? languageColors.Other;
}

export type Project = {
  /** URL segment: /projects/<slug>. Lowercase, hyphens only. */
  slug: string;
  /**
   * Leaves the project off the home page and skips building its page, without
   * deleting anything. Flip it back to bring the project back as it was.
   */
  hidden?: boolean;
  title: string;
  description: string;
  /** The one short line on the home page card. Falls back to `description`. */
  summary?: string;
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
  /**
   * The produced launch video, as opposed to a plain recording of the app.
   * Setting this (even to null) splits the video column into two tabs,
   * Showcase and App demo; null keeps the Showcase tab with a "coming soon"
   * slot until the file exists, and an App demo with no `demos` does the same.
   */
  showcase?: Demo | null;
  /** System architecture diagram, shown after `body`. Light background expected. */
  architecture?: { src: string; alt: string; width: number; height: number };
  /** Long-form copy for the project page. One string per paragraph. */
  body?: string[];
};

export const projects: Project[] = [
  {
    slug: "vocalnotes",
    hidden: true,
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
    summary: "Placement prep with a mock interviewer that talks back.",
    description:
      "Placed is placement season, shrunk to fit in your pocket. Grind 925 quiz questions until the aptitude round gets boring, work through the LeetCode problems 38 companies actually ask, get your resume scored out of 100, then sit a mock interview where you answer out loud and it pushes back. Got an Amazon round on Friday? It'll grill you on the Leadership Principles first. Runs on iPhone, iPad and Mac.",
    descriptionHighlights: [
      "925 quiz questions",
      "38 companies",
      "answer out loud",
      "iPhone, iPad and Mac",
    ],
    tech: ["SwiftUI", "Metal", "FastAPI", "Python", "SQLModel", "Groq", "Whisper"],
    highlight: "Answer the mock interview out loud and it asks a follow-up, the way a real one would",
    // The launch video, cut with /brag and re-encoded from the 45 MB master.
    // The plain app recording goes under `demos` once it's recorded.
    showcase: {
      src: "/videos/placed-showcase.mp4",
      poster: "/videos/placed-showcase.jpg",
      aspect: 16 / 9,
    },
    languages: [
      { name: "Swift", share: 70.3 },
      { name: "Python", share: 22.8 },
      { name: "TeX", share: 6.6 },
      { name: "Other", share: 0.3 },
    ],
    body: [
      "The app is pure SwiftUI with zero third-party packages, down to its own design system and a liquid-wave effect written as a Metal shader, talking to a FastAPI backend on Fly.io in Mumbai. The mock interview is the hard part. Every round opens with a few calibration questions, then climbs or drops a five-level difficulty ladder based on how accurate and how fluent you were. You hold to talk, Groq Whisper transcribes, and the questions come from gpt-oss-120b with Gemini waiting as a fallback, so one provider having a bad day doesn't end your interview halfway. The resume reviewer is deliberately paranoid: the file is read on your phone, your email, number and links are stripped before anything leaves it, the ATS checks are plain code rather than a model guessing, and any bullet it rewrites has to quote you exactly, with numbers left as [placeholders] so it can't invent achievements you never had.",
    ],
    architecture: {
      src: "/architecture/placed.png",
      alt: "Placed system architecture: the SwiftUI app talks over HTTPS to a FastAPI backend with auth, content and AI modules, backed by SQLite, calling Groq, Gemini, Whisper, Resend and Google/GitHub OAuth.",
      width: 2400,
      height: 2077,
    },
  },
  {
    slug: "matchday",
    hidden: true,
    logo: "/logos/matchday.png",
    title: "Matchday",
    description:
      "Match predictions for football across ten European leagues. Pick a league, then a club, choose who is playing at home, and it shows the chances of a home win, a draw and an away win as a single bar. It works for any two of 390 clubs, even from different leagues, and flags the fixtures where its view differs from the bookmakers'.",
    descriptionHighlights: [
      "ten European leagues",
      "any two of 390 clubs",
      "differs from the bookmakers'",
    ],
    tech: ["SwiftUI", "Python", "pandas", "scikit-learn", "LightGBM", "SciPy", "XCUITest"],
    highlight: "Predicts the win percentage of any European football game",
    demos: {
      // A simulator recording, scaled to the same 588x1280 as the other phone
      // demos. Recorded silent, so there is no audio track.
      ios: {
        src: "/videos/matchday-ios.mp4",
        poster: "/videos/matchday-ios.jpg",
        aspect: 588 / 1280,
      },
    },
    languages: [
      { name: "Python", share: 83.7 },
      { name: "Swift", share: 14.2 },
      { name: "Other", share: 2.1 },
    ],
    body: [
      "The model never sees bookmaker odds. They sit in a separate table and are joined only at evaluation time, as the benchmark — a model trained on odds just relearns the odds and can never usefully disagree with the market. It covers ten divisions and 98,205 matches back to 1993/94, and the five leagues with no free expected-goals data run a separate Elo-only model rather than the production one on imputed values, with every prediction saying which model produced it.",
      "The app models nothing. Every number on screen is computed in Python and fetched from a server that holds the fitted model warm — a prediction takes 0.8 ms, but starting Python and importing pandas, SciPy and scikit-learn takes 1.3 s, so the model lives in a running process rather than being started per question. Clubs are chosen league first, three to a row with crests, in the server's editorial order rather than alphabetically, and a cross-league fixture carries the assumption it rests on next to the numbers it applies to.",
    ],
  },
  {
    slug: "formify",
    logo: "/logos/formify.png",
    title: "Formify",
    summary: "Turns a Google Doc of questions into a graded Google Forms quiz.",
    description:
      "Formify is for anyone who has ever typed forty multiple-choice questions into Google Forms one dropdown at a time. Write the quiz in a Google Doc the way you normally would, open the side panel, and it pulls out every question, option, answer and mark, lets you fix whatever it wasn't sure about, then hands you a graded Google Forms quiz with the feedback already filled in. No answer options at all? It figures you want a feedback form and turns every question into a 1 to 5 rating.",
    descriptionHighlights: [
      "the way you normally would",
      "graded Google Forms quiz",
      "1 to 5 rating",
    ],
    tech: ["JavaScript", "Chrome Extensions", "Google Docs API", "Google Forms API", "OAuth 2.0", "node:test"],
    highlight: "From a doc of questions to a graded, shareable quiz in one click",
    demos: {
      // An OBS capture of the whole desktop: the doc on the left, the side panel
      // on the right, through to the finished form. Recorded silent, so the
      // audio track is dropped rather than shipped as 70 seconds of nothing.
      chrome: {
        src: "/videos/formify-chrome.mp4",
        poster: "/videos/formify-chrome.jpg",
      },
    },
    // The launch video, cut with /brag.
    showcase: {
      src: "/videos/formify-showcase.mp4",
      poster: "/videos/formify-showcase.jpg",
      aspect: 16 / 9,
    },
    languages: [
      { name: "JavaScript", share: 80.8 },
      { name: "CSS", share: 14.0 },
      { name: "HTML", share: 5.1 },
      { name: "Other", share: 0.1 },
    ],
    body: [
      "It's a Manifest V3 Chrome extension in plain JavaScript with zero dependencies, reading the doc through the Docs API and building the form with batched Forms API requests. The parser is where the time went, because nobody formats a quiz the same way twice: questions turn up as 1., Q1, Question 1: or a numbered list, options as A), (a), [a] or four crammed onto one line, and the right answer might be an Answer: line, a trailing ✓, bold text or a highlight. Bold and highlight only count when not every option has them, since a doc that's bold from top to bottom says nothing about which option is right. Headings become form sections, Explanation: lines become feedback, and (2 marks) after a question grades it for exactly that. Sign-in rides on Chrome's own identity API, requests quietly refresh an expired token and back off when Google rate-limits, and the parser is pure functions covered by node:test, with an end-to-end test that drives real Chrome.",
    ],
  },
  {
    slug: "asciify",
    logo: "/logos/asciify.png",
    title: "ASCIIFY",
    summary: "Turns your photos into art made of text.",
    description:
      "ASCIIFY turns your photos into art made entirely of keyboard characters, the way every hacker in a 90s movie would have wanted. Pick a photo, drag a slider to decide how many characters wide it gets, choose soft shading or hard-edged two-tone, then paste it into the group chat or save it to Photos as an image. Your cat, rendered in @ and #.",
    descriptionHighlights: [
      "made entirely of keyboard characters",
      "paste it into the group chat",
      "save it to Photos",
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
    // The launch video, cut with /brag and re-encoded from the 10 MB master.
    showcase: {
      src: "/videos/asciify-showcase.mp4",
      poster: "/videos/asciify-showcase.jpg",
      aspect: 16 / 9,
    },
    body: [
      "No libraries, just CoreGraphics and a conversion engine of about 460 lines. The photo is decoded with its orientation fixed, then the app hunts for a plain border and crops it away, because a logo floating in white space would otherwise get a third of the grid and turn to mush. A character is roughly twice as tall as it is wide, so the image gets squashed vertically to match, contrast is stretched across the middle 96% of tones, and each cell picks from .:-=+*#%@ by how much ink it needs. Copying was sneakier than expected: chat apps wreck the alignment, so the clipboard gets a code-fenced copy that renders monospaced plus RTF with a pinned font for everything else. The engine never touches UIKit, so the same code also builds a Mac command-line tool for tuning the output without booting a simulator.",
    ],
    architecture: {
      src: "/architecture/asciify.png",
      alt: "ASCIIFY architecture: the SwiftUI app passes a picked photo to AsciiCore, which decodes it and runs five steps (crop, grid size, sample, normalize, map) before the art goes back to the clipboard as text and RTF or to Photos as a PNG.",
      width: 1886,
      height: 944,
    },
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
