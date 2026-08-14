/**
 * Static export for GitHub Pages.
 *
 * `basePath` is empty for a user site (repo named `<user>.github.io`, served at
 * the domain root). For a *project* repo the site lives under `/<repo>`, so the
 * workflow passes BASE_PATH and every asset and link is prefixed to match.
 */
const basePath = process.env.BASE_PATH ?? "";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  basePath,
  // Emit `blog/index.html` rather than `blog.html`, which is what GitHub Pages
  // resolves cleanly for a URL with no file extension.
  trailingSlash: true,
  images: {
    // There is no server to optimize on demand, so images are served as-is.
    unoptimized: true,
  },
};

export default nextConfig;
