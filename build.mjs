// Builds dist.css with Tailwind, then inlines it into every landing page.
//
// Why inline: these are single-visit Google Ads landing pages. An external
// stylesheet costs one extra round trip before the browser can paint, and the
// visitor almost never comes back to reuse the cached copy. Inlining removes
// that round trip from the critical path.
//
// Run with: node build.mjs   (or: npm run build)

import { readFileSync, writeFileSync } from "fs";
import { execFileSync } from "child_process";

const PAGES = ["lp-metallique.html", "lp-tole.html", "lp-anglo.html", "lp-acier.html", "lp-metallique-meta.html"];
const OPEN = "<style id=\"dist-css\">";
const CLOSE = "</style><!--/dist-css-->";
const LINK = '<link rel="stylesheet" href="dist.css">';

// Strip any previously inlined CSS first. Tailwind scans ./*.html for class
// names, and it would happily harvest strings out of an inlined stylesheet.
function strip(html) {
  const start = html.indexOf(OPEN);
  if (start === -1) return html;
  const end = html.indexOf(CLOSE, start);
  if (end === -1) throw new Error("found an unterminated dist-css block");
  return html.slice(0, start) + LINK + html.slice(end + CLOSE.length);
}

for (const page of PAGES) {
  writeFileSync(page, strip(readFileSync(page, "utf8")));
}

execFileSync("npx", ["tailwindcss", "-i", "input.css", "-o", "dist.css", "--minify"], {
  stdio: "inherit",
  shell: true,
});

const css = readFileSync("dist.css", "utf8").trim();
for (const page of PAGES) {
  const html = readFileSync(page, "utf8");
  if (!html.includes(LINK)) throw new Error(`${page}: no dist.css link to replace`);
  writeFileSync(page, html.replace(LINK, OPEN + css + CLOSE));
  console.log(`${page}: inlined ${(css.length / 1024).toFixed(1)} KB of CSS`);
}
