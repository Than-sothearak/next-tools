import assert from "node:assert/strict";
import { test } from "node:test";
import { enhanceDocumentPixels } from "./documentEnhancement";

const width = 384;
const height = 512;
const paper = [240, 228, 209];

function makePage() {
  const pixels = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) paint(pixels, x, y, [1, 1, 1]);
  }
  return pixels;
}

function paint(pixels: Uint8ClampedArray, x: number, y: number, color: number[]) {
  const index = (y * width + x) * 4;
  const lighting = 0.58 + 0.36 * x / (width - 1) + 0.04 * y / (height - 1);
  for (let channel = 0; channel < 3; channel++) {
    pixels[index + channel] = paper[channel] * lighting * color[channel];
  }
  pixels[index + 3] = 255;
}

function pixelAt(pixels: Uint8ClampedArray, x: number, y: number) {
  return Array.from(pixels.slice((y * width + x) * 4, (y * width + x) * 4 + 3));
}

test("whitens shaded, warm paper without tile seams or a colored cast", () => {
  const pixels = makePage();
  enhanceDocumentPixels(pixels, width, height, "color");
  for (const y of [0, 100, 250, height - 1]) {
    for (let x = 0; x < width; x++) {
      const color = pixelAt(pixels, x, y);
      assert.ok(Math.min(...color) >= 243, `Paper should be white at ${x}, ${y}: ${color}`);
      assert.ok(Math.max(...color) - Math.min(...color) <= 5, `Paper should be neutral: ${color}`);
      if (x) {
        const previous = pixelAt(pixels, x - 1, y);
        assert.ok(color.every((value, channel) => Math.abs(value - previous[channel]) <= 3));
      }
    }
  }
});

test("preserves dark strokes, faint writing and single-pixel letter edges", () => {
  const pixels = makePage();
  for (let x = 12; x < width - 12; x++) {
    paint(pixels, x, 100, [0.12, 0.12, 0.12]);
    paint(pixels, x, 102, [0.6, 0.6, 0.6]);
    paint(pixels, x, 104, [0.9, 0.9, 0.9]);
  }
  enhanceDocumentPixels(pixels, width, height, "color");
  for (const x of [16, 128, 256, 360]) {
    const black = pixelAt(pixels, x, 100)[0];
    const edge = pixelAt(pixels, x, 102)[0];
    const faint = pixelAt(pixels, x, 104)[0];
    const background = pixelAt(pixels, x, 106)[0];
    assert.ok(black <= 25, `Black text became gray: ${black}`);
    assert.ok(black < edge && edge < faint && faint < background);
    assert.ok(background - faint >= 20, `Faint text was washed out: ${faint}`);
  }
});

test("preserves colored ink and pale highlights even where they cover entire tiles", () => {
  const pixels = makePage();
  const colors = [
    [0.9, 0.1, 0.12],
    [0.08, 0.18, 0.9],
    [0.08, 0.7, 0.2],
    [0.95, 0.94, 0.55],
  ];
  for (let block = 0; block < colors.length; block++) {
    for (let y = 120; y < 210; y++) {
      for (let x = 12 + block * 90; x < 82 + block * 90; x++) {
        paint(pixels, x, y, colors[block]);
      }
    }
  }
  enhanceDocumentPixels(pixels, width, height, "color");
  for (let block = 0; block < colors.length; block++) {
    const actual = pixelAt(pixels, 45 + block * 90, 160);
    const expected = colors[block].map((value) => value * 255);
    assert.ok(actual.every((value, channel) => Math.abs(value - expected[channel]) < 22),
      `Ink color changed: expected ${expected}, got ${actual}`);
  }
});

test("dense text does not darken the paper estimate or erase strokes", () => {
  const pixels = makePage();
  for (let y = 50; y < 450; y++) {
    for (let x = 20; x < 360; x++) {
      if (y % 10 < 6 && x % 5 < 3) paint(pixels, x, y, [0.16, 0.16, 0.16]);
    }
  }
  enhanceDocumentPixels(pixels, width, height, "color");
  assert.ok(Math.max(...pixelAt(pixels, 200, 100)) <= 35);
  assert.ok(Math.min(...pixelAt(pixels, 204, 107)) >= 243);
});

test("gray graphics are not mistaken for nearby white paper", () => {
  const pixels = makePage();
  for (let y = 150; y < 220; y++) {
    for (let x = 150; x < 220; x++) paint(pixels, x, y, [0.65, 0.65, 0.65]);
  }
  enhanceDocumentPixels(pixels, width, height, "color");
  const graphic = pixelAt(pixels, 185, 185)[0];
  const background = pixelAt(pixels, 230, 185)[0];
  assert.ok(graphic >= 100 && graphic <= 185, `Gray graphic was bleached: ${graphic}`);
  assert.ok(background - graphic >= 50);
});

test("grayscale removes color while preserving alpha and leaving transparent pixels alone", () => {
  const pixels = makePage();
  paint(pixels, 100, 100, [0.1, 0.2, 0.8]);
  pixels[3] = 0;
  pixels[7] = 128;
  const transparent = Array.from(pixels.slice(0, 4));
  enhanceDocumentPixels(pixels, width, height, "grayscale");
  assert.deepEqual(Array.from(pixels.slice(0, 4)), transparent);
  assert.equal(pixels[7], 128);
  const [red, green, blue] = pixelAt(pixels, 100, 100);
  assert.equal(red, green);
  assert.equal(green, blue);
});

test("images without identifiable paper are not bleached", () => {
  for (const color of [[0, 0, 0, 255], [12, 30, 120, 255]]) {
    const pixels = new Uint8ClampedArray(color);
    enhanceDocumentPixels(pixels, 1, 1, "color");
    assert.deepEqual(Array.from(pixels), color);
  }
  const paperPixel = new Uint8ClampedArray([200, 200, 200, 255]);
  enhanceDocumentPixels(paperPixel, 1, 1, "color");
  assert.deepEqual(Array.from(paperPixel), [255, 255, 255, 255]);
});

test("rejects corrupt dimensions", () => {
  assert.throws(() => enhanceDocumentPixels(new Uint8ClampedArray(4), 2, 2, "color"));
  assert.throws(() => enhanceDocumentPixels(new Uint8ClampedArray(), 0, 0, "color"));
});
