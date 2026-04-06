const sharp = require("sharp");
const { imagesToIco } = require("png-to-ico");
const fs = require("fs");
const path = require("path");

const SVG_PATH = path.join(__dirname, "../assets/logo/matchlab-symbol-dark.svg");
const APP_DIR = path.join(__dirname, "../app");

async function toRawBitmap(svgBuffer, size) {
  const { data, info } = await sharp(svgBuffer)
    .resize(size, size)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  return { data, width: info.width, height: info.height };
}

async function main() {
  const svgBuffer = fs.readFileSync(SVG_PATH);

  // Raw bitmaps for ICO
  const bmp16 = await toRawBitmap(svgBuffer, 16);
  const bmp32 = await toRawBitmap(svgBuffer, 32);

  // Generate multi-size ICO (16x16 + 32x32)
  const icoBuffer = imagesToIco([bmp16, bmp32]);

  // 180x180 PNG for apple-touch-icon
  const png180 = await sharp(svgBuffer).resize(180, 180).png().toBuffer();

  fs.writeFileSync(path.join(APP_DIR, "favicon.ico"), icoBuffer);
  fs.writeFileSync(path.join(APP_DIR, "apple-icon.png"), png180);

  console.log("favicon.ico created:", fs.statSync(path.join(APP_DIR, "favicon.ico")).size, "bytes");
  console.log("apple-icon.png created:", fs.statSync(path.join(APP_DIR, "apple-icon.png")).size, "bytes");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
