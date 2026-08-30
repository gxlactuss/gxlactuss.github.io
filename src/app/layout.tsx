import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ThemeScript } from "@/components/theme-toggle";
import { site } from "@/lib/config";
import "./globals.css";

const sans = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });
const mono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.name, template: `%s · ${site.name}` },
  description: site.intro,
  openGraph: {
    title: site.name,
    description: site.intro,
    url: site.url,
    siteName: site.name,
    type: "website",
  },
  twitter: { card: "summary_large_image", title: site.name, description: site.intro },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // `data-scroll-behavior="smooth"` is not decoration: globals.css sets
    // `scroll-behavior: smooth` on <html> for the in-page anchor links, and as
    // of Next 16 the router no longer suspends that during a route change
    // unless this attribute says to. Without it, navigating smooth-scrolls to
    // the top of the new page over ~200ms — which the view transition then
    // snapshots mid-flight, so the morph lands against a page that is still
    // sliding. With it, anchors stay smooth and navigation jumps instantly.
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        <ThemeScript />
      </head>
      <body className={`${sans.variable} ${mono.variable} font-sans`}>
        <SiteHeader />
        <main className="mx-auto max-w-4xl px-5">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
