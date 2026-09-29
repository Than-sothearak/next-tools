export type DocumentScanMode = "color" | "grayscale";

type PaperColor = [number, number, number];

const BINS = 256;
const clamp = (value: number) => Math.max(0, Math.min(1, value));
const luminance = (red: number, green: number, blue: number) =>
  red * 0.2126 + green * 0.7152 + blue * 0.0722;

function smoothstep(low: number, high: number, value: number) {
  const amount = clamp((value - low) / (high - low));
  return amount * amount * (3 - 2 * amount);
}

// Each brightness bin stores a count and the sum of its RGB samples. Taking
// the upper part of the distribution excludes ink without selecting hot pixels.
function estimatePaper(histogram: Uint32Array, samples: number): PaperColor {
  const start = samples * 0.75;
  const end = samples * 0.95;
  const color: PaperColor = [0, 0, 0];
  let cumulative = 0;
  let weight = 0;
  for (let bin = 0; bin < BINS; bin++) {
    const offset = bin * 4;
    const count = histogram[offset];
    const selected = Math.max(
      0,
      Math.min(cumulative + count, end) - Math.max(cumulative, start),
    );
    if (selected > 0) {
      for (let channel = 0; channel < 3; channel++) {
        color[channel] += (histogram[offset + channel + 1] / count) * selected;
      }
      weight += selected;
    }
    cumulative += count;
    if (cumulative >= end) break;
  }
  return color.map((value) => value / Math.max(Number.EPSILON, weight)) as PaperColor;
}

/** Enhances pixels in place, keeping dimensions and alpha unchanged. */
export function enhanceDocumentPixels(
  pixels: Uint8ClampedArray,
  width: number,
  height: number,
  mode: DocumentScanMode,
) {
  if (
    !Number.isInteger(width) ||
    !Number.isInteger(height) ||
    width < 1 ||
    height < 1 ||
    pixels.length !== width * height * 4
  ) {
    throw new Error("Invalid scan image dimensions.");
  }

  const tileSize = Math.max(16, Math.ceil(Math.max(width, height) / 24));
  const columns = Math.ceil(width / tileSize);
  const rows = Math.ceil(height / tileSize);
  const sampleStep = Math.max(1, Math.floor(Math.max(width, height) / 1200));
  const globalHistogram = new Uint32Array(BINS * 4);
  const paper: (PaperColor | null)[] = [];
  let globalSamples = 0;

  for (let row = 0; row < rows; row++) {
    for (let column = 0; column < columns; column++) {
      const histogram = new Uint32Array(BINS * 4);
      let samples = 0;
      let visible = 0;
      for (let y = row * tileSize; y < Math.min(height, (row + 1) * tileSize); y += sampleStep) {
        for (let x = column * tileSize; x < Math.min(width, (column + 1) * tileSize); x += sampleStep) {
          const index = (y * width + x) * 4;
          if (pixels[index + 3] < 224) continue;
          visible++;
          const red = pixels[index];
          const green = pixels[index + 1];
          const blue = pixels[index + 2];
          const maximum = Math.max(red, green, blue);
          const minimum = Math.min(red, green, blue);
          // Colored ink and deep blacks must not become the estimated paper.
          if (maximum < 48 || maximum - minimum > maximum * 0.32) continue;
          const offset = Math.round(luminance(red, green, blue)) * 4;
          histogram[offset]++;
          histogram[offset + 1] += red;
          histogram[offset + 2] += green;
          histogram[offset + 3] += blue;
          samples++;
        }
      }
      for (let index = 0; index < histogram.length; index++) {
        globalHistogram[index] += histogram[index];
      }
      globalSamples += samples;
      paper.push(samples >= Math.max(1, visible * 0.08) ? estimatePaper(histogram, samples) : null);
    }
  }

  const reference = estimatePaper(globalHistogram, globalSamples);
  const referenceLuminance = luminance(...reference);
  // Without identifiable paper, avoid guessing exposure or bleaching artwork.
  if (!globalSamples || referenceLuminance < 64) {
    if (mode === "grayscale") {
      for (let index = 0; index < pixels.length; index += 4) {
        if (!pixels[index + 3]) continue;
        const gray = luminance(pixels[index], pixels[index + 1], pixels[index + 2]);
        pixels[index] = pixels[index + 1] = pixels[index + 2] = gray;
      }
    }
    return;
  }

  const validTiles: number[] = [];
  const rejectedTiles: number[] = [];
  for (let index = 0; index < paper.length; index++) {
    const color = paper[index];
    let nearbyPaper = 0;
    const row = Math.floor(index / columns);
    const column = index % columns;
    for (let y = Math.max(0, row - 3); y <= Math.min(rows - 1, row + 3); y++) {
      for (let x = Math.max(0, column - 3); x <= Math.min(columns - 1, column + 3); x++) {
        const neighbor = paper[y * columns + x];
        if (neighbor) nearbyPaper = Math.max(nearbyPaper, luminance(...neighbor));
      }
    }
    // A sudden dark neutral patch can be a gray graphic or dense lettering.
    // Favor nearby paper there; smooth lighting gradients still qualify.
    if (color && luminance(...color) >= Math.max(referenceLuminance * 0.55, nearbyPaper * 0.85)) {
      validTiles.push(index);
    } else {
      rejectedTiles.push(index);
    }
  }
  for (const index of rejectedTiles) paper[index] = null;

  // Extend paper lighting through logos, photographs and dense text using nearby
  // paper samples, rather than normalizing those regions against their own ink.
  const background = new Float32Array(paper.length * 3);
  for (let index = 0; index < paper.length; index++) {
    let color = paper[index];
    if (!color) {
      const sum: PaperColor = [0, 0, 0];
      let totalWeight = 0;
      for (const neighbor of validTiles) {
        const dx = (index % columns) - (neighbor % columns);
        const dy = Math.floor(index / columns) - Math.floor(neighbor / columns);
        const weight = 1 / (dx * dx + dy * dy) ** 2;
        const neighborColor = paper[neighbor]!;
        for (let channel = 0; channel < 3; channel++) {
          sum[channel] += neighborColor[channel] * weight;
        }
        totalWeight += weight;
      }
      color = totalWeight ? sum.map((value) => value / totalWeight) as PaperColor : reference;
    }
    for (let channel = 0; channel < 3; channel++) {
      background[index * 3 + channel] = Math.max(48, color[channel]);
    }
  }

  // A narrow highlight shoulder keeps paper white; the continuous curve keeps
  // faint writing and antialiased letter edges, unlike a binary threshold.
  const tones = new Float32Array(4096);
  for (let index = 0; index < tones.length; index++) {
    tones[index] = Math.pow(clamp((index / 4095 - 0.025) / 0.96), 1.35);
  }

  for (let y = 0; y < height; y++) {
    const gridY = Math.max(0, Math.min(rows - 1, (y + 0.5) / tileSize - 0.5));
    const top = Math.floor(gridY);
    const bottom = Math.min(rows - 1, top + 1);
    const fy = gridY - top;
    for (let x = 0; x < width; x++) {
      const index = (y * width + x) * 4;
      if (!pixels[index + 3]) continue;
      const gridX = Math.max(0, Math.min(columns - 1, (x + 0.5) / tileSize - 0.5));
      const left = Math.floor(gridX);
      const right = Math.min(columns - 1, left + 1);
      const fx = gridX - left;
      const topLeft = (top * columns + left) * 3;
      const topRight = (top * columns + right) * 3;
      const bottomLeft = (bottom * columns + left) * 3;
      const bottomRight = (bottom * columns + right) * 3;
      const paperChannel = (channel: number) =>
        (background[topLeft + channel] * (1 - fx) + background[topRight + channel] * fx) * (1 - fy) +
        (background[bottomLeft + channel] * (1 - fx) + background[bottomRight + channel] * fx) * fy;
      let red = pixels[index] / paperChannel(0);
      let green = pixels[index + 1] / paperChannel(1);
      let blue = pixels[index + 2] / paperChannel(2);
      // Scale over-range colors together to preserve hue instead of clipping
      // individual RGB channels into a different color.
      const exposure = Math.max(1, red, green, blue);
      red /= exposure;
      green /= exposure;
      blue /= exposure;
      const lightness = luminance(red, green, blue);
      const ink = tones[Math.round(clamp(lightness) * 4095)];
      if (mode === "grayscale") {
        pixels[index] = pixels[index + 1] = pixels[index + 2] = ink * 255;
      } else {
        const maximum = Math.max(red, green, blue);
        const chroma = maximum - Math.min(red, green, blue);
        const colorProtection =
          smoothstep(0.04, 0.15, chroma) * smoothstep(0.08, 0.3, chroma / Math.max(0.001, maximum));
        const target = ink + (lightness - ink) * colorProtection;
        const gain = lightness > 0 ? target / lightness : 0;
        pixels[index] = red * gain * 255;
        pixels[index + 1] = green * gain * 255;
        pixels[index + 2] = blue * gain * 255;
      }
    }
  }
}
