import assert from "node:assert/strict";
import { test } from "node:test";
import { changeCrop, drawCrop, pixelCrop, type Handle } from "./geometry";

const bounds = { width: 800, height: 600 };
const crop = { x: 100, y: 100, width: 400, height: 300 };

test("moving a selection keeps its size and clamps it inside the image", () => {
  assert.deepEqual(changeCrop(crop, "move", -1000, 1000, bounds), { x: 0, y: 300, width: 400, height: 300 });
});

test("corner dragging preserves the opposite corner", () => {
  assert.deepEqual(changeCrop(crop, "nw", 50, 25, bounds), { x: 150, y: 125, width: 350, height: 275 });
  assert.deepEqual(changeCrop(crop, "se", 50, 25, bounds), { x: 100, y: 100, width: 450, height: 325 });
});

test("all eight handles stay in bounds and cannot invert the crop", () => {
  for (const handle of ["n", "s", "e", "w", "nw", "ne", "sw", "se"] as Handle[]) {
    for (const delta of [-10000, 10000]) {
      const result = changeCrop(crop, handle, delta, delta, bounds);
      assert.ok(result.x >= 0 && result.y >= 0);
      assert.ok(result.width >= 1 && result.height >= 1);
      assert.ok(result.x + result.width <= bounds.width);
      assert.ok(result.y + result.height <= bounds.height);
    }
  }
});

test("new selections can be drawn in either direction", () => {
  const start = { x: 100, y: 80 }, end = { x: 500, y: 400 };
  assert.deepEqual(drawCrop(start, end, bounds), { x: 100, y: 80, width: 400, height: 320 });
  assert.deepEqual(drawCrop(end, start, bounds), drawCrop(start, end, bounds));
});

test("fractional preview coordinates round to valid export pixels", () => {
  assert.deepEqual(pixelCrop({ x: 100.6, y: 20.3, width: 699.4, height: 579.7 }), { x: 101, y: 20, width: 699, height: 580 });
  assert.deepEqual(drawCrop({ x: 800, y: 600 }, { x: 800, y: 600 }, bounds), { x: 799, y: 599, width: 1, height: 1 });
});
