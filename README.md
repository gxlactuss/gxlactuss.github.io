# Personal website

Next.js 16 · TypeScript · Tailwind 4 · MDX — exported as a static site and
hosted on GitHub Pages.

```bash
npm run dev        # http://localhost:3000
npm run build      # static export into out/
npm run start      # serve the built out/ folder locally
npm run typecheck  # tsc --noEmit
```

## Where things live

| What | Where |
|---|---|
| Name, intro, socials, nav | [src/lib/config.ts](src/lib/config.ts) |
| Profile block (age, college, degree) | `profile` in [src/lib/config.ts](src/lib/config.ts) |
| Projects, shenanigans, friends | [src/lib/config.ts](src/lib/config.ts) |
| Blog posts | [content/blog/](content/blog/) — one `.mdx` file per post |
| Colors and typography | [src/app/globals.css](src/app/globals.css) |
| Profile photo, resume, videos | [public/](public/) |
| Deploy workflow | [.github/workflows/deploy.yml](.github/workflows/deploy.yml) |

Everything on the home page is driven by `config.ts`. To add a project, append
to the `projects` array — no components to touch.

## The three things waiting on a file

Each shows an honest placeholder until the file exists, rather than a link that
404s:

1. **Resume** — drop a PDF at `public/resume.pdf`. The section detects it at
   build time and swaps the placeholder for View / Download buttons.
2. **Project videos** — drop a file at `public/videos/<name>.mp4` and set
   `video: "/videos/<name>.mp4"` on that project in `config.ts`. Optionally add
   `poster` for the still frame shown before playback.
3. **Project write-ups** — `body` on each project is an array of paragraphs
   shown on its `/projects/<slug>` page. They currently hold placeholder text.

## Theme

Black and neon orange, defined in [src/app/globals.css](src/app/globals.css):

- `--accent` / `--accent-strong` are the orange; every component reads them, so
  changing the palette is a two-line edit.
- **Light mode uses a deeper burnt orange on purpose.** The neon orange sits at
  oklch lightness 0.78 and fails contrast badly on white; the light palette
  keeps the hue and drops the lightness.
- `--gh-0…4` is the contributions ramp, in the same hue rather than GitHub's
  green. Replace those ten values to go back to green — nothing else reads them.
- Important words are wrapped in `<mark class="hl">`. On the home page they come
  from `site.introHighlights`; in blog posts, `**bold**` gets the same colour.

## Adding a blog post

Drop a file in `content/blog/`, e.g. `content/blog/my-post.mdx`:

```mdx
---
title: My post
description: One line, shown on the index and in link previews.
date: 2026-08-20
draft: false
---

Markdown here. GFM tables and syntax-highlighted code blocks work.
```

`draft: true` shows the post in `npm run dev` but hides it from the built site.
The URL is the filename: `/blog/my-post`.

## Deploying to GitHub Pages

**One-time setup:**

1. Create a repo named exactly **`gxlactuss.github.io`** — the name is what
   makes GitHub serve it at `https://gxlactuss.github.io` rather than under
   a subpath.
2. Push this project to its `main` branch.
3. In the repo: **Settings → Pages → Build and deployment → Source →
   GitHub Actions**. Do *not* pick "Deploy from a branch".

After that every push to `main` rebuilds and redeploys automatically. You can
also trigger a deploy by hand from the **Actions** tab (Run workflow).

### Using a project repo instead

If you'd rather host from a repo with a different name, the site lives at
`https://gxlactuss.github.io/<repo>/`, so every asset needs that prefix.
Set it in [.github/workflows/deploy.yml](.github/workflows/deploy.yml):

```yaml
env:
  BASE_PATH: "/your-repo-name"
```

and update `site.url` in `config.ts` to match.

### Adding a custom domain later

Buying a domain doesn't mean rebuilding anything:

1. Settings → Pages → Custom domain, enter it, and let GitHub provision the
   certificate.
2. At your registrar, point the apex at GitHub's IPs (or a `CNAME` for a
   subdomain) — GitHub shows the exact records.
3. Update `site.url` in `config.ts` so OG tags and canonical URLs match.
4. Tick **Enforce HTTPS** once the certificate is issued.

## Why the site is static

It's exported with `output: "export"`, which produces plain HTML/CSS/JS in
`out/`. That's what GitHub Pages can host — it serves files, it doesn't run a
server. The consequences worth knowing:

- **No guestbook.** It needed server actions, OAuth and a Postgres database,
  none of which can run here. It was removed rather than left half-working.
- **No API routes or server actions** of any kind.
- **Images aren't optimized on demand** (`images.unoptimized`), so remote
  avatars are served straight from their origin.
- **Data fetching happens at build time, not per request.** A section that pulls
  live data only refreshes when the site rebuilds.

If you ever want the guestbook back, the site has to move to a host that runs a
server — Vercel's free tier does, and the rest of the code is unchanged.

## Guestbook

Backed by this repo's **GitHub Discussions** through [giscus](https://giscus.app).
The site is a static export with no server, so it can't hold entries or run an
OAuth callback itself — giscus keeps the data in Discussions and does sign-in
inside its own iframe. Visitors need a GitHub account to post.

**To switch it on (one time):**

1. Install the giscus app on this repo: <https://github.com/apps/giscus>
   (Discussions is already enabled.)
2. Set `enabled: true` in the `giscus` block of
   [src/lib/config.ts](src/lib/config.ts).
3. Push.

Until step 1 is done the widget renders "giscus is not installed on this
repository" to every visitor, which is why the page shows a placeholder while
`enabled` is false.

Entries appear at
<https://github.com/gxlactuss/gxlactuss.github.io/discussions> — moderating a
post means deleting the comment there.

**If you ever want the original guestbook back** — custom sign-in with
GitHub/Google/Discord and your own Postgres table — the site has to move to a
host that runs a server. Vercel's free tier does, and nothing else about the
site would need to change.

## Re-enabling the auto-pulled Open Source section

The Open Source section shows a "coming soon" card. The live version — a
filterable table of merged/open/closed PRs from the GitHub API — is still in the
repo and working, just not mounted. It needs **public** repos to have anything
to show.

To switch it on, in [src/app/page.tsx](src/app/page.tsx):

```tsx
import { Contributions } from "@/components/contributions";
import { getContributions } from "@/lib/github";

const contributions = await getContributions();
// then swap the <ComingSoon /> in the Open Source section for:
<Contributions items={contributions} />
```

On a static export this runs **at build time**, so the list is a snapshot from
the last deploy rather than live. To keep it fresh, add a schedule to the deploy
workflow:

```yaml
on:
  schedule:
    - cron: "0 6 * * *"   # rebuild daily at 06:00 UTC
```

Optionally set a `GITHUB_TOKEN` secret — the search API allows 10 requests per
minute unauthenticated, which is fine at this rate, but a token avoids any
throttling.
