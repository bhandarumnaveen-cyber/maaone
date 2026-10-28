// Builds optimised, responsive images into public/ from assets/source.
//  - phone-*.png: background removed (scripts/cutout.mjs), 320/480/640 wide
//  - laptop-crm.png: background removed, 640/960/1440 wide
//  - maa-one-logo.png: trimmed, 280/560/840 wide WebP + a 560 PNG for emails
//  - banner-poora-business.png: 1200x630 Open Graph / Twitter image
// Run: node scripts/build-images.mjs
import { execFileSync } from "node:child_process";
import { mkdirSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import sharp from "sharp";

const SRC = "assets/source";
mkdirSync("public/images", { recursive: true });
mkdirSync("public/brand", { recursive: true });

const cutout = (file, threshold) => {
  const out = path.join(tmpdir(), `${path.basename(file, ".png")}-cutout.png`);
  execFileSync("node", ["scripts/cutout.mjs", path.join(SRC, file), out, String(threshold)], { stdio: "inherit" });
  return out;
};

async function variants(input, name, widths, dir = "public/images") {
  for (const w of widths) {
    const out = `${dir}/${name}-${w}.webp`;
    await sharp(input).resize({ width: w }).webp({ quality: 84, alphaQuality: 90, effort: 6 }).toFile(out);
    const m = await sharp(out).metadata();
    console.log(out, `${m.width}x${m.height}`);
  }
}

for (const file of readdirSync(SRC).filter((f) => f.startsWith("phone-"))) {
  await variants(cutout(file, 228), file.replace(".png", ""), [320, 480, 640]);
}
await variants(cutout("laptop-crm.png", 236), "laptop-crm", [480, 640, 960, 1440]);

// The source logo has a grey smoke glow that looks dirty on light backgrounds:
// fade out semi-transparent, low-saturation pixels and keep the gold and red.
async function cleanLogo(file, crop) {
  const src = crop ? sharp(file).extract(crop) : sharp(file);
  const { data, info } = await src.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let i = 0; i < data.length; i += 4) {
    const a = data[i + 3];
    if (!a || a >= 245) continue;
    const max = Math.max(data[i], data[i + 1], data[i + 2]);
    const min = Math.min(data[i], data[i + 1], data[i + 2]);
    const sat = max ? (max - min) / max : 0;
    // Grey smoke has low saturation; the dark drop shadow is dim. Keep only bright, coloured pixels.
    const keep = Math.min(1, Math.max(0, (sat - 0.18) / 0.22)) * Math.min(1, Math.max(0, (max - 70) / 90));
    data[i + 3] = a < 40 ? 0 : Math.round(a * keep);
  }
  return sharp(data, { raw: info }).trim({ threshold: 1 }).png().toBuffer();
}
const logo = await cleanLogo(path.join(SRC, "maa-one-logo.png"));
await variants(logo, "maa-one-logo", [280, 560, 840], "public/brand");
await sharp(logo).resize({ width: 560 }).png({ compressionLevel: 9 }).toFile("public/brand/maa-one-logo.png");

// The ML monogram on its own, for Maa Labs credits.
const ml = await cleanLogo(path.join(SRC, "maa-one-logo.png"), { left: 0, top: 0, width: 752, height: 724 });
await variants(ml, "maa-labs-mark", [96, 192, 288], "public/brand");

// "Maa One by Maa Labs | NaveenCodes" banner for the About page.
await variants(path.join(SRC, "banner-maaone-maalabs-naveencodes.webp"), "maaone-maalabs-naveencodes", [640, 960, 1440], "public/brand");

for (const name of ["opengraph-image", "twitter-image"]) {
  await sharp(path.join(SRC, "banner-poora-business.png"))
    .resize(1200, 630, { fit: "cover", position: "centre" })
    .jpeg({ quality: 84, mozjpeg: true })
    .toFile(`src/app/${name}.jpg`);
}
console.log("done");
