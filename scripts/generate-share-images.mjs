// Generates the share/icon images from existing assets only:
//   public/og.png               1200x630 Open Graph / Twitter card (profile photo + type)
//   public/apple-touch-icon.png 180x180  (K.svg mark on the ink colour)
//   public/favicon-32.png       32x32    (K.svg mark on the ink colour)
// Run manually after changing the name/role line or the logo: `npm run share-images`.
//
// The two static TTFs in assets-src/fonts are instances (wght 500 / 700) of the
// same Space Grotesk variable font the site serves from public/fonts.
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const W = 1200;
const H = 630;
const PHOTO = 630;
const PAD = 64;

const INK = "#22282C";
const PAPER = "#FBFBFB";
const MUTED = "#C3C9CD";
const ACCENT = "#F8B21A";

const fonts = {
  500: path.join(root, "assets-src/fonts/SpaceGrotesk-500.ttf"),
  700: path.join(root, "assets-src/fonts/SpaceGrotesk-700.ttf"),
};

const text = (markup, weight, size, color, width) =>
  sharp({
    text: {
      text: `<span foreground="${color}">${markup}</span>`,
      font: `Space Grotesk ${weight} ${size}px`,
      fontfile: fonts[weight],
      width,
      rgba: true,
      dpi: 72,
      spacing: Math.round(size * 0.12),
    },
  })
    .png()
    .toBuffer();

const textWidth = W - PHOTO - PAD * 2;

const [name, role, url, photo] = await Promise.all([
  text("Bill Jeferson\nNababan", 700, 60, PAPER, textWidth),
  text("Web developer. Node.js, Express, React, MySQL, PostgreSQL.", 500, 26, MUTED, textWidth),
  text("billjeferson.vercel.app", 500, 24, ACCENT, textWidth),
  sharp(path.join(root, "assets-src/images/FotoProfil.jpeg")).resize(PHOTO, PHOTO, { fit: "cover" }).toBuffer(),
]);

const nameMeta = await sharp(name).metadata();
const nameTop = 132;

await sharp({ create: { width: W, height: H, channels: 3, background: INK } })
  .composite([
    { input: photo, left: W - PHOTO, top: 0 },
    { input: { create: { width: 64, height: 6, channels: 3, background: ACCENT } }, left: PAD, top: nameTop - 40 },
    { input: name, left: PAD, top: nameTop },
    { input: role, left: PAD, top: nameTop + nameMeta.height + 28 },
    { input: url, left: PAD, top: H - PAD - 28 },
  ])
  .png({ compressionLevel: 9, palette: true, quality: 90, dither: 0.6 })
  .toFile(path.join(root, "public/og.png"));

// Icons: the existing K.svg mark centred on an ink square.
const mark = path.join(root, "public/images/K.svg");
for (const [file, size] of [["apple-touch-icon.png", 180], ["favicon-32.png", 32]]) {
  const glyph = await sharp(mark, { density: 1200 })
    .resize({ height: Math.round(size * 0.6) })
    .png()
    .toBuffer();
  await sharp({ create: { width: size, height: size, channels: 3, background: INK } })
    .composite([{ input: glyph, gravity: "center" }])
    .png({ compressionLevel: 9 })
    .toFile(path.join(root, "public", file));
}

console.log("share-images: og.png, apple-touch-icon.png, favicon-32.png written");
