// Generates every derivative the Meta landing page needs, into public/images/meta/.
// Never writes outside that folder, so the originals and the Google Ads pages are untouched.
// Run: node build-images-meta.mjs

import sharp from "sharp";
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from "fs";

const SRC = "public/images/";
const OUT = "public/images/meta/";
mkdirSync(OUT, { recursive: true });

// filenames with odd characters get resolved from disk rather than typed out
const gal = readdirSync(SRC + "galerie");
const find = (re) => "galerie/" + gal.find((f) => re.test(f));

const HERO = "galerie/1.jpg";

const GALLERY = [
  ["g01", "joint-debout-800w.webp"],
  ["g02", "projet-4-800w.webp"],
  ["g03", "galerie/7.png"],
  ["g04", "img3.jpg"],
  ["g05", "galerie/6.png"],
  ["g06", "galerie/9.png"],
  ["g07", "galerie/107.webp"],
  ["g08", "galerie/9(2).png"],
  ["g09", "galerie/200.png"],
  ["g10", "galerie/125.webp"],
  ["g11", "galerie/120.webp"],
  ["g12", "galerie/12.jpg"],
  ["g13", "projet-2-800w.webp"],
  ["g14", find(/^imgi_112/)],
];

const PRODUCTS = [
  ["prod-joint", "joint-debout-800w.webp"],
  ["prod-tuiles", find(/^imgi_104/)],
];

const TESTI = [
  ["t1", "img1.jpg"],
  ["t2", "galerie/125.webp"],
  ["t3", "galerie/6.png"],
  ["t4", "galerie/107.webp"],
];

const manifest = [];

async function emit(name, src, widths, opts = {}) {
  const buf = readFileSync(SRC + src);
  const meta = await sharp(buf).metadata();
  const made = [];
  const seen = new Set();
  for (const w of widths) {
    const target = Math.min(w, meta.width); // never upscale beyond the source
    if (seen.has(target)) continue;
    seen.add(target);
    let p = sharp(buf).resize({ width: Math.min(w, meta.width), withoutEnlargement: true });
    if (opts.box) p = sharp(buf).resize(opts.box[0], opts.box[1], { fit: "cover", position: opts.position || "centre" });
    const out = await p.webp({ quality: opts.q ?? 74, effort: 6 }).toBuffer();
    const m = await sharp(out).metadata();
    const file = `${name}-${m.width}w.webp`;
    writeFileSync(OUT + file, out);
    made.push({ file, w: m.width, h: m.height, kb: Math.round(out.length / 1024) });
    if (opts.box) break; // fixed-box outputs get a single size
  }
  manifest.push({ name, src, made });
  console.log(name.padEnd(13) + src.padEnd(34) + made.map((x) => `${x.w}x${x.h} ${x.kb}KB`).join("  |  "));
}

console.log("=== HERO ===");
await emit("hero", HERO, [1920, 1200, 768, 480], { q: 72 });

console.log("\n=== AVANT / APRES (meme boite, pour le fondu croise) ===");
// the two drone shots are framed differently; crop BEFORE to approach AFTER's framing
{
  const before = readFileSync(SRC + "before.webp");
  const cropped = await sharp(before).extract({ left: 120, top: 40, width: 450, height: 355 }).toBuffer();
  const a = await sharp(cropped).resize(900, 675, { fit: "cover" }).webp({ quality: 78, effort: 6 }).toBuffer();
  writeFileSync(OUT + "ba-avant-900w.webp", a);
  const b = await sharp(readFileSync(SRC + "after.webp")).resize(900, 675, { fit: "cover" }).webp({ quality: 78, effort: 6 }).toBuffer();
  writeFileSync(OUT + "ba-apres-900w.webp", b);
  console.log(`ba-avant-900w.webp  900x675 ${Math.round(a.length / 1024)}KB`);
  console.log(`ba-apres-900w.webp  900x675 ${Math.round(b.length / 1024)}KB`);
  manifest.push({ name: "avant-apres", src: "before.webp + after.webp", made: [{ file: "ba-avant-900w.webp", w: 900, h: 675 }, { file: "ba-apres-900w.webp", w: 900, h: 675 }] });
}

console.log("\n=== GALERIE ===");
for (const [name, src] of GALLERY) await emit(name, src, [1400, 800, 400]);

console.log("\n=== CARTES PRODUITS ===");
for (const [name, src] of PRODUCTS) await emit(name, src, [1200, 800, 400]);

console.log("\n=== TEMOIGNAGES ===");
for (const [name, src] of TESTI) await emit(name, src, [800, 400]);

writeFileSync(OUT + "manifest.json", JSON.stringify(manifest, null, 1));
const total = readdirSync(OUT).filter((f) => f.endsWith(".webp"))
  .reduce((s, f) => s + readFileSync(OUT + f).length, 0);
console.log(`\n${readdirSync(OUT).filter((f) => f.endsWith(".webp")).length} fichiers, ${Math.round(total / 1024)}KB au total`);
