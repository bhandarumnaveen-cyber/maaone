/**
 * Renders the product film (/demo/reel) into an MP4. Every frame is drawn at an exact time, so the
 * video is smooth even on a slow machine.
 *
 *   npm run build && npx next start -p 3000                      # in one terminal
 *   node scripts/record-demo.mjs portrait  [base-url] [out.mp4]   # 1080×1920: Reels, Shorts, Status
 *   node scripts/record-demo.mjs landscape [base-url] [out.mp4]   # 1920×1080: YouTube, website
 *
 * Needs Playwright and ffmpeg.
 */
import { createRequire } from "node:module";
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

// require() so a globally installed Playwright (NODE_PATH) works too.
const { chromium } = createRequire(import.meta.url)("playwright");

const format = process.argv[2] === "landscape" ? "landscape" : "portrait";
const base = process.argv[3] ?? "http://localhost:3000";
const out = process.argv[4] ?? `maa-one-demo-${format}.mp4`;
const viewport = format === "landscape" ? { width: 960, height: 540 } : { width: 540, height: 960 };
const fps = 30;
const holdEndMs = 2_000;

const workers = Number(process.env.WORKERS ?? 6);
const dir = mkdtempSync(path.join(tmpdir(), "maaone-demo-"));
const browser = await chromium.launch();
const open = async () => {
  const page = await browser.newPage({ viewport, deviceScaleFactor: 2 });
  await page.goto(`${base}/demo/reel?format=${format}`, { waitUntil: "networkidle" });
  await page.waitForFunction(() => window.__maaOneFilm);
  return page;
};
const first = await open();
const length = await first.evaluate(() => window.__maaOneFilm.length);
const frames = Math.round(((length + holdEndMs) / 1000) * fps);

// Several pages render interleaved frames in parallel.
let done = 0;
const render = async (page, w) => {
  for (let i = w; i < frames; i += workers) {
    const t = Math.min(length, (i * 1000) / fps);
    await page.evaluate((ms) => window.__maaOneFilm.seek(ms), t);
    await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
    await page.screenshot({ path: path.join(dir, `f${String(i).padStart(5, "0")}.png`) });
    if (++done % 150 === 0) console.log(`frame ${done}/${frames}`);
  }
};
const pages = [first, ...(await Promise.all(Array.from({ length: workers - 1 }, open)))];
await Promise.all(pages.map((p, w) => render(p, w)));
await browser.close();

execFileSync(
  "ffmpeg",
  ["-y", "-loglevel", "error", "-framerate", String(fps), "-i", path.join(dir, "f%05d.png"),
   "-c:v", "libx264", "-preset", "slow", "-crf", "18", "-pix_fmt", "yuv420p", "-movflags", "+faststart", out],
  { stdio: "inherit" },
);
rmSync(dir, { recursive: true, force: true });
console.log(`Saved ${out}`);
