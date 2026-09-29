export type Crop = { x: number; y: number; width: number; height: number };
export type Bounds = { width: number; height: number };
export type Handle = "move" | "n" | "s" | "e" | "w" | "nw" | "ne" | "sw" | "se";

export const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export function changeCrop(crop: Crop, handle: Handle, dx: number, dy: number, bounds: Bounds): Crop {
  if (handle === "move") {
    return { ...crop, x: clamp(crop.x + dx, 0, bounds.width - crop.width), y: clamp(crop.y + dy, 0, bounds.height - crop.height) };
  }
  let { x, y } = crop;
  let right = x + crop.width;
  let bottom = y + crop.height;
  if (handle.includes("w")) x = clamp(x + dx, 0, right - 1);
  if (handle.includes("e")) right = clamp(right + dx, x + 1, bounds.width);
  if (handle.includes("n")) y = clamp(y + dy, 0, bottom - 1);
  if (handle.includes("s")) bottom = clamp(bottom + dy, y + 1, bounds.height);
  return { x, y, width: right - x, height: bottom - y };
}

export function drawCrop(start: { x: number; y: number }, end: { x: number; y: number }, bounds: Bounds): Crop {
  const x = clamp(Math.min(start.x, end.x), 0, bounds.width - 1);
  const y = clamp(Math.min(start.y, end.y), 0, bounds.height - 1);
  return { x, y, width: clamp(Math.abs(end.x - start.x), 1, bounds.width - x), height: clamp(Math.abs(end.y - start.y), 1, bounds.height - y) };
}

export function pixelCrop(crop: Crop): Crop {
  return { x: Math.round(crop.x), y: Math.round(crop.y), width: Math.max(1, Math.round(crop.x + crop.width) - Math.round(crop.x)), height: Math.max(1, Math.round(crop.y + crop.height) - Math.round(crop.y)) };
}
