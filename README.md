# Personal website

Next.js 16 · TypeScript · Tailwind 4, exported as a static site and hosted on
GitHub Pages.

```bash
npm run dev        # http://localhost:3000
npm run build      # static export into out/
npm run start      # serve the built out/ folder locally
npm run typecheck  # tsc --noEmit
```

| What | Where |
|---|---|
| Site name, URL, giscus settings | [src/lib/config.ts](src/lib/config.ts) |
| Guestbook (GitHub sign-in via giscus) | [src/components/guestbook.tsx](src/components/guestbook.tsx) |
| Deploy workflow | [.github/workflows/deploy.yml](.github/workflows/deploy.yml) |
