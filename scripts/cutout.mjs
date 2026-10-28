// Removes the plain background around a device mockup: flood-fills light pixels
// connected to the image border and turns them into a soft transparent shadow.
// Usage: node scripts/cutout.mjs <input> <output.png> [threshold]
import sharp from "sharp";

const [input, output, thr = "228"] = process.argv.slice(2);
const threshold = Number(thr);
const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width: w, height: h } = info;
const lum = (i) => 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];

const seen = new Uint8Array(w * h);
const stack = [];
const push = (x, y) => {
  if (x < 0 || y < 0 || x >= w || y >= h) return;
  const p = y * w + x;
  if (seen[p] || lum(p * 4) < threshold) return;
  seen[p] = 1;
  stack.push(p);
};
for (let x = 0; x < w; x++) { push(x, 0); push(x, h - 1); }
for (let y = 0; y < h; y++) { push(0, y); push(w - 1, y); }
while (stack.length) {
  const p = stack.pop();
  const x = p % w, y = (p - x) / w;
  push(x + 1, y); push(x - 1, y); push(x, y + 1); push(x, y - 1);
}

// Background brightness reference: brightest border pixel.
let bg = 0;
for (let p = 0; p < w * h; p++) if (seen[p]) bg = Math.max(bg, lum(p * 4));
for (let p = 0; p < w * h; p++) {
  if (!seen[p]) continue;
  const i = p * 4;
  const a = Math.max(0, Math.min(255, (bg - lum(i)) * 3));
  data[i] = data[i + 1] = data[i + 2] = 20;
  data[i + 3] = a < 6 ? 0 : a;
}
await sharp(data, { raw: { width: w, height: h, channels: 4 } }).trim().png().toFile(output);
console.log("wrote", output);
