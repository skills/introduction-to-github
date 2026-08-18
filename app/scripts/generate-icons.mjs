/**
 * Generates the PWA icon set with zero third-party dependencies.
 *
 * Icons are rasterised procedurally and encoded as PNG using Node's built-in
 * zlib, so the build never needs an image toolchain. The mark is a four-point
 * "spark" astroid on a rounded-square field, matching the app accent colour.
 */
import { deflateSync } from 'node:zlib';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const outDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'icons');

const BG = [79, 70, 229]; // indigo 600 — matches --accent
const BG_DEEP = [55, 48, 163];
const FG = [255, 255, 255];

const clamp01 = (n) => (n < 0 ? 0 : n > 1 ? 1 : n);
const mix = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));

/** Signed coverage of a rounded rectangle, 1 inside, 0 outside. */
function roundedRectCoverage(x, y, size, inset, radius) {
  const min = inset;
  const max = size - inset;
  const cx = Math.min(Math.max(x, min + radius), max - radius);
  const cy = Math.min(Math.max(y, min + radius), max - radius);
  const dx = x - cx;
  const dy = y - cy;
  const dist = Math.hypot(dx, dy);
  return dist <= radius ? 1 : 0;
}

/** Four-point star (astroid): |x|^p + |y|^p <= r^p with p < 1. */
function sparkCoverage(x, y, cx, cy, r, power) {
  const dx = Math.abs(x - cx) / r;
  const dy = Math.abs(y - cy) / r;
  return Math.pow(dx, power) + Math.pow(dy, power) <= 1 ? 1 : 0;
}

function renderIcon(size, { padding = 0.0, rounded = true } = {}) {
  const ss = 3; // 3x3 supersampling for smooth edges
  const px = new Uint8Array(size * size * 4);
  const inset = size * padding;
  const field = size - inset * 2;
  const radius = rounded ? field * 0.235 : 0;
  const cx = size / 2;
  const cy = size / 2;
  const bigR = field * 0.3;
  const smallR = field * 0.115;
  const smallCx = cx + field * 0.245;
  const smallCy = cy - field * 0.245;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let bgA = 0;
      let fgA = 0;
      for (let sy = 0; sy < ss; sy++) {
        for (let sx = 0; sx < ss; sx++) {
          const px0 = x + (sx + 0.5) / ss;
          const py0 = y + (sy + 0.5) / ss;
          bgA += roundedRectCoverage(px0, py0, size, inset, radius);
          const spark =
            sparkCoverage(px0, py0, cx, cy, bigR, 0.62) ||
            sparkCoverage(px0, py0, smallCx, smallCy, smallR, 0.62);
          fgA += spark;
        }
      }
      const n = ss * ss;
      bgA = clamp01(bgA / n);
      fgA = clamp01(fgA / n);

      // Flat-ish field with a very subtle vertical depth shift (no loud gradient).
      const depth = clamp01((y / size) * 0.55);
      const base = mix(BG, BG_DEEP, depth);
      const color = mix(base, FG, fgA);
      const i = (y * size + x) * 4;
      px[i] = color[0];
      px[i + 1] = color[1];
      px[i + 2] = color[2];
      px[i + 3] = Math.round(bgA * 255);
    }
  }
  return px;
}

function crc32(buf) {
  let c;
  const table = crc32.table ?? (crc32.table = (() => {
    const t = new Int32Array(256);
    for (let n = 0; n < 256; n++) {
      c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      t[n] = c;
    }
    return t;
  })());
  let crc = -1;
  for (let i = 0; i < buf.length; i++) crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
  return (crc ^ -1) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function encodePng(width, height, rgba) {
  const raw = Buffer.alloc(height * (width * 4 + 1));
  for (let y = 0; y < height; y++) {
    raw[y * (width * 4 + 1)] = 0; // filter: none
    Buffer.from(rgba.buffer, y * width * 4, width * 4).copy(raw, y * (width * 4 + 1) + 1);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // colour type RGBA
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

const targets = [
  { file: 'icon-192.png', size: 192, opts: { padding: 0 } },
  { file: 'icon-512.png', size: 512, opts: { padding: 0 } },
  // Maskable icons need their content inside the safe zone (~80% of the canvas).
  { file: 'icon-maskable-512.png', size: 512, opts: { padding: 0.12 } },
  { file: 'apple-touch-icon.png', size: 180, opts: { padding: 0 } },
];

mkdirSync(outDir, { recursive: true });
for (const { file, size, opts } of targets) {
  const rgba = renderIcon(size, opts);
  writeFileSync(join(outDir, file), encodePng(size, size, rgba));
  console.log(`icons: wrote ${file} (${size}x${size})`);
}
