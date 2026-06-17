import puppeteer from "puppeteer";
import { readdirSync, mkdirSync } from "fs";
import { join } from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const SCREENSHOT_DIR = join(__dirname, "temporary_screenshots");
mkdirSync(SCREENSHOT_DIR, { recursive: true });

const url = process.argv[2];
const selector = process.argv[3] || "#pricing";
const label = process.argv[4] || "focus";

function getNextIndex() {
  const files = readdirSync(SCREENSHOT_DIR).filter((f) => f.startsWith("screenshot-"));
  let max = 0;
  for (const f of files) {
    const match = f.match(/^screenshot-(\d+)/);
    if (match) max = Math.max(max, parseInt(match[1], 10));
  }
  return max + 1;
}

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });
  await page.evaluate(() => {
    document.querySelectorAll('.fade-in-section, .will-fade').forEach(el => el.classList.add('will-fade', 'is-visible'));
    document.querySelectorAll('.counter').forEach(el => { el.textContent = (el.dataset.target || '') + (el.dataset.suffix || ''); });
  });
  await new Promise(r => setTimeout(r, 800));
  const el = await page.$(selector);
  if (!el) { console.error('Selector not found:', selector); process.exit(1); }
  const idx = getNextIndex();
  const filename = `screenshot-${idx}-${label}.png`;
  await el.screenshot({ path: join(SCREENSHOT_DIR, filename) });
  console.log(`Saved: ${filename}`);
  await browser.close();
})();
