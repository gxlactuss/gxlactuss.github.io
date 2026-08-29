import { site, socials } from "@/lib/config";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-border">
      <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-4 px-5 py-8 text-sm text-fg-muted">
        <span>
          © {new Date().getFullYear()} {site.name}
        </span>
        <ul className="flex flex-wrap gap-4">
          {socials.map((s) => (
            <li key={s.label}>
              <a href={s.href} className="hover:text-fg" rel="me noopener">
                {s.label.toLowerCase()}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
