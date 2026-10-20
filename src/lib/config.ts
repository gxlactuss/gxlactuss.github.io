export const site = {
  name: "Mohit Samant",
  // Used for <title>, OG tags and canonical URLs.
  url: "https://mohitsamant.me",
  description: "Mohit Samant - iOS app developer & CSE student at KJSIT, I make iOS apps and ML models",
  role: "iOS developer · CSE student at KJSIT",
  intro:
    "I build native apps for iPhone and Mac, and ML models on the side. Most of them started as something that bugged me in my own life. I also fix bugs in open source iOS apps like Firefox and OneBusAway, and I like competitive programming too.",
  /** Phrases in `intro` shown in full ink against the muted rest. */
  introHighlights: ["native apps", "ML models", "open source", "competitive programming"],
  location: "India",
  timeZone: "Asia/Kolkata",
  email: "mohitsamant1487@gmail.com",
  github: "gxlactuss",
  linkedin: "mohit-samant-7a76302ba",
  x: "Gxlactuss",
  leetcode: "gxlactus",
  /** Repo with the solutions, and a solved count table in its README. */
  solutions: "gxlactuss/Leetcode",
} as const;

export const socials = [
  { label: "GitHub", icon: "github", href: `https://github.com/${site.github}` },
  { label: "LinkedIn", icon: "linkedin", href: `https://www.linkedin.com/in/${site.linkedin}/` },
  { label: "X", icon: "x", href: `https://x.com/${site.x}` },
] as const;

/** Section ids, in page order. The dock and the section headers both read this. */
export const sections = [
  { id: "projects", label: "Projects" },
  { id: "research", label: "Research" },
  { id: "open-source", label: "Open source" },
  { id: "contests", label: "Contests" },
  { id: "guestbook", label: "Guestbook" },
] as const;

export type SectionId = (typeof sections)[number]["id"];

export type Project = {
  slug: string;
  title: string;
  status: "shipped" | "building";
  /** The one line on the card. */
  summary: string;
  /** Longer copy for the expanded view. One string per paragraph. */
  body: string[];
  tech: string[];
  /** App icon, e.g. "/logos/placed.png". */
  logo: string;
  platforms: string;
  repo?: string;
  video?: { src: string; poster: string };
  /** App screenshots, shown behind a toggle in the expanded view. */
  screenshots?: string[];
  /** Short feature names that scroll past on the card. */
  features?: string[];
};

export const projects: Project[] = [
  {
    slug: "quasar",
    title: "Quasar",
    status: "building",
    summary: "",
    body: [],
    tech: ["Swift", "SwiftUI", "AppKit", "ScreenCaptureKit"],
    logo: "/logos/quasar.png",
    platforms: "macOS 15+",
    features: [
      "Scrolling capture",
      "Command center",
      "Notch Hub",
      "Clipboard history",
      "Screen recording",
      "Text snippets",
      "File Shelf",
      "Now Playing",
      "Quick Notes",
      "Download Organizer",
    ],
  },
  {
    slug: "placed",
    title: "Placed",
    status: "shipped",
    summary: "Placement prep with a mock interviewer that talks back.",
    body: [
      "Placement season, shrunk to fit in your pocket. Grind 925 quiz questions, work through the LeetCode problems 38 companies actually ask, get your resume scored out of 100, then sit a mock interview where you answer out loud and it pushes back.",
      "Pure SwiftUI with zero third-party packages, down to a liquid-wave effect written as a Metal shader, talking to a FastAPI backend. The interview climbs or drops a five-level difficulty ladder based on how you answered.",
    ],
    tech: ["SwiftUI", "Metal", "FastAPI", "Groq", "Whisper"],
    logo: "/logos/placed.png",
    platforms: "iPhone · iPad · Mac",
    repo: "https://github.com/gxlactuss/PPIP",
    video: { src: "/videos/placed-showcase.mp4", poster: "/videos/placed-showcase.jpg" },
    screenshots: [
      "/screenshots/placed/01-home.jpg",
      "/screenshots/placed/02-home-target.jpg",
      "/screenshots/placed/03-session.jpg",
      "/screenshots/placed/04-picker.jpg",
      "/screenshots/placed/05-style.jpg",
      "/screenshots/placed/06-common.jpg",
      "/screenshots/placed/07-common-detail.jpg",
      "/screenshots/placed/08-transcript.jpg",
      "/screenshots/placed/09-transcript-rubric.jpg",
      "/screenshots/placed/10-transcript-chart.jpg",
      "/screenshots/placed/11-transcript-answers.jpg",
      "/screenshots/placed/12-resume.jpg",
      "/screenshots/placed/13-resume-2.jpg",
      "/screenshots/placed/14-resume-3.jpg",
      "/screenshots/placed/15-amazon.jpg",
      "/screenshots/placed/16-amazon-insight.jpg",
      "/screenshots/placed/18-meta.jpg",
      "/screenshots/placed/19-companies.jpg",
    ],
  },
];

export const research = [
  {
    title: "Ensemble learning for multiclass network intrusion detection",
    authors: ["Mohit Samant"],
    status: "In progress",
    year: "2026",
    hook: "Can a team of models catch the rare attacks that a single model misses? Write-up coming soon.",
  },
];

export const friends = [
  {
    name: "arnesh",
    href: "https://arneshbanerjee.dev/",
    avatar: "https://avatars.githubusercontent.com/u/177954836?v=4",
  },
  {
    name: "xevrion",
    href: "https://xevrion.dev/",
    avatar: "https://avatars.githubusercontent.com/u/77008538?v=4",
  },
] as const;

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
