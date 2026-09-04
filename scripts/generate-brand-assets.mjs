/**
 * Generates favicon, apple-touch, PWA, and OG assets from brand colors.
 * Run: node scripts/generate-brand-assets.mjs
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = (...parts) => join(root, ...parts);

const PRIMARY = "#d30203";
const PRIMARY_DARK = "#a30101";

/** Favicon mark: brand red tile + white E from wordmark. */
const faviconSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
  <rect width="64" height="64" rx="14" fill="${PRIMARY}"/>
  <path fill="#fff" transform="translate(20.5 15.5) scale(1.32)" d="M0.514069 1.41338L18.4385 1.42833C18.4794 2.98953 18.4418 4.70543 18.4478 6.28566C17.1447 6.22989 15.5581 6.27405 14.2202 6.27429L6.30275 6.27374C6.3393 7.79863 6.30601 9.46065 6.30547 10.9964L17.2035 10.9969C17.1694 12.5731 17.2005 14.2367 17.2088 15.8203C13.7593 15.7475 10.1148 15.8058 6.65035 15.8055C6.53625 15.8053 6.44789 15.8138 6.33434 15.8224C6.25783 16.0126 6.30565 20.6326 6.3068 21.2164L18.6283 21.2212C18.63 22.8339 18.656 24.5391 18.6088 26.1432C12.6415 26.083 6.48511 26.1116 0.514734 26.1493C0.450455 24.8893 0.490464 23.352 0.490403 22.0628L0.492461 14.6883L0.49016 6.3039C0.489796 4.72744 0.452937 2.97627 0.514069 1.41338Z"/>
</svg>`;

/** Maskable PWA icon with safe padding. */
const maskableSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">
  <rect width="512" height="512" fill="${PRIMARY}"/>
  <path fill="#fff" transform="translate(164 148) scale(10.4)" d="M0.514069 1.41338L18.4385 1.42833C18.4794 2.98953 18.4418 4.70543 18.4478 6.28566C17.1447 6.22989 15.5581 6.27405 14.2202 6.27429L6.30275 6.27374C6.3393 7.79863 6.30601 9.46065 6.30547 10.9964L17.2035 10.9969C17.1694 12.5731 17.2005 14.2367 17.2088 15.8203C13.7593 15.7475 10.1148 15.8058 6.65035 15.8055C6.53625 15.8053 6.44789 15.8138 6.33434 15.8224C6.25783 16.0126 6.30565 20.6326 6.3068 21.2164L18.6283 21.2212C18.63 22.8339 18.656 24.5391 18.6088 26.1432C12.6415 26.083 6.48511 26.1116 0.514734 26.1493C0.450455 24.8893 0.490464 23.352 0.490403 22.0628L0.492461 14.6883L0.49016 6.3039C0.489796 4.72744 0.452937 2.97627 0.514069 1.41338Z"/>
</svg>`;

const ogSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" fill="none">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1200" y2="630" gradientUnits="userSpaceOnUse">
      <stop stop-color="${PRIMARY_DARK}"/>
      <stop offset="0.45" stop-color="${PRIMARY}"/>
      <stop offset="1" stop-color="${PRIMARY_DARK}"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <circle cx="1080" cy="90" r="220" fill="#fff" fill-opacity="0.06"/>
  <circle cx="80" cy="560" r="260" fill="#000" fill-opacity="0.12"/>
  <text x="96" y="292" fill="#fff" font-family="Arial, Helvetica, sans-serif" font-size="72" font-weight="800" letter-spacing="1.5">EPOS POCHTA</text>
  <text x="96" y="360" fill="#fff" fill-opacity="0.88" font-family="Arial, Helvetica, sans-serif" font-size="32" font-weight="500">Yetkazib berish · Oʻzbekiston</text>
</svg>`;

async function writePng(svg, path, size) {
  mkdirSync(dirname(path), { recursive: true });
  const pipeline = sharp(Buffer.from(svg));
  if (size) pipeline.resize(size, size);
  await pipeline.png().toFile(path);
  console.log("wrote", path.replace(root + "/", ""));
}

async function writeIco(png32Path, icoPath) {
  // Minimal single-image ICO (PNG-compressed), widely supported.
  const png = await sharp(png32Path).resize(32, 32).png().toBuffer();
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(1, 4);
  const entry = Buffer.alloc(16);
  entry.writeUInt8(32, 0);
  entry.writeUInt8(32, 1);
  entry.writeUInt8(0, 2);
  entry.writeUInt8(0, 3);
  entry.writeUInt16LE(1, 4);
  entry.writeUInt16LE(32, 6);
  entry.writeUInt32LE(png.length, 8);
  entry.writeUInt32LE(22, 12);
  writeFileSync(icoPath, Buffer.concat([header, entry, png]));
  console.log("wrote", icoPath.replace(root + "/", ""));
}

async function main() {
  writeFileSync(out("public/favicon.svg"), faviconSvg);
  console.log("wrote public/favicon.svg");

  await writePng(faviconSvg, out("public/favicon-32x32.png"), 32);
  await writePng(faviconSvg, out("public/favicon-16x16.png"), 16);
  await writePng(faviconSvg, out("public/apple-touch-icon.png"), 180);
  await writePng(maskableSvg, out("public/icons/icon-192.png"), 192);
  await writePng(maskableSvg, out("public/icons/icon-512.png"), 512);
  await writeIco(out("public/favicon-32x32.png"), out("public/favicon.ico"));

  mkdirSync(out("public/images/og"), { recursive: true });
  await sharp(Buffer.from(ogSvg)).png().toFile(out("public/images/og/default.png"));
  console.log("wrote public/images/og/default.png");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
