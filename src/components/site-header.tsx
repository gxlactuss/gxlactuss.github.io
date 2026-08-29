import Link from "next/link";
import { nav, site } from "@/lib/config";
import { Logo } from "./logo";
import { ThemeToggle } from "./theme-toggle";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-bg/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-4xl items-center gap-4 px-5">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 font-medium tracking-tight hover:text-accent"
        >
          <Logo className="size-5 text-accent" />
          {site.name.split(" ")[0].toLowerCase()}
        </Link>
        <nav className="flex flex-1 items-center gap-4 overflow-x-auto text-sm text-fg-muted">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="whitespace-nowrap hover:text-fg">
              {item.label}
            </Link>
          ))}
        </nav>
        <ThemeToggle />
      </div>
    </header>
  );
}
