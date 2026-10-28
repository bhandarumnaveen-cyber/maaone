/**
 * Renders the product tour (/demo/reel) into a 1080×1920 MP4 for Instagram Reels, YouTube Shorts
 * and WhatsApp Status. Every frame is drawn at an exact time, so the video is smooth even on a
 * slow machine.
 *
 *   npm run build && npx next start -p 3000      # in one terminal
 *   node scripts/record-demo.mjs [url] [out.mp4]   # needs Playwright and ffmpeg
 */
import { createRequire } from "node:module";
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

// require() so a globally installed Playwright (NODE_PATH) works too.
const { chromium } = createRequire(import.meta.url)("playwright");

const url = process.argv[2] ?? "http://localhost:3000/demo/reel";
const out = process.argv[3] ?? "maa-one-demo.mp4";
const fps = 30;
const holdEndMs = 2_000;

const dir = mkdtempSync(path.join(tmpdir(), "maaone-demo-"));
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 540, height: 960 }, deviceScaleFactor: 2 });
await page.goto(url, { waitUntil: "networkidle" });
await page.waitForFunction(() => window.__maaOneTour);
const length = await page.evaluate(() => window.__maaOneTour.length);

const frames = Math.round(((length + holdEndMs) / 1000) * fps);
for (let i = 0; i < frames; i++) {
  const t = Math.min(length, (i * 1000) / fps);
  await page.evaluate((ms) => window.__maaOneTour.seek(ms), t);
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
  await page.screenshot({ path: path.join(dir, `f${String(i).padStart(5, "0")}.png`) });
  if (i % 150 === 0) console.log(`frame ${i}/${frames}`);
}
await browser.close();

execFileSync(
  "ffmpeg",
  ["-y", "-loglevel", "error", "-framerate", String(fps), "-i", path.join(dir, "f%05d.png"),
   "-c:v", "libx264", "-preset", "slow", "-crf", "18", "-pix_fmt", "yuv420p", "-movflags", "+faststart", out],
  { stdio: "inherit" },
);
rmSync(dir, { recursive: true, force: true });
console.log(`Saved ${out}`);
