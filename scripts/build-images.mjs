// Builds optimised, responsive mockup images into public/images from assets/mockups.
// Phone mockups get their white background removed (see cutout.mjs).
// Run: node scripts/build-images.mjs
import { execFileSync } from "node:child_process";
import { mkdirSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import sharp from "sharp";

const SRC = "assets/mockups";
const OUT = "public/images";
mkdirSync(OUT, { recursive: true });

const widths = { phone: [320, 480, 640], laptop: [640, 960, 1440] };

for (const file of readdirSync(SRC)) {
  const name = file.replace(/\.\w+$/, "");
  const kind = name.startsWith("phone") ? "phone" : "laptop";
  let input = path.join(SRC, file);
  if (kind === "phone") {
    const cut = path.join(tmpdir(), `${name}-cutout.png`);
    execFileSync("node", ["scripts/cutout.mjs", input, cut], { stdio: "inherit" });
    input = cut;
  }
  for (const w of widths[kind]) {
    const out = path.join(OUT, `${name}-${w}.webp`);
    await sharp(input).resize({ width: w }).webp({ quality: 82, alphaQuality: 90 }).toFile(out);
    const m = await sharp(out).metadata();
    console.log(out, `${m.width}x${m.height}`);
  }
}
