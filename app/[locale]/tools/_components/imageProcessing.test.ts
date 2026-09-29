import assert from "node:assert/strict";
import { test } from "node:test";
import { convertImage } from "./imageProcessing";

test("image export uses the selected source rectangle and its aspect ratio", async (t) => {
  const draws: unknown[][] = [];
  const context = { imageSmoothingQuality: "low", drawImage: (...args: unknown[]) => draws.push(args) };
  const canvas = { width: 0, height: 0, getContext: () => context, toBlob: (callback: (blob: Blob) => void) => callback(new Blob(["image"], { type: "image/png" })) };
  class MockImage {
    naturalWidth = 800;
    naturalHeight = 600;
    onload: () => void = () => {};
    set src(_value: string) { queueMicrotask(() => this.onload()); }
  }
  const originalImage = Object.getOwnPropertyDescriptor(globalThis, "Image");
  const originalDocument = Object.getOwnPropertyDescriptor(globalThis, "document");
  Object.defineProperty(globalThis, "Image", { configurable: true, value: MockImage });
  Object.defineProperty(globalThis, "document", { configurable: true, value: { createElement: () => canvas } });
  t.after(() => {
    if (originalImage) Object.defineProperty(globalThis, "Image", originalImage);
    else Reflect.deleteProperty(globalThis, "Image");
    if (originalDocument) Object.defineProperty(globalThis, "document", originalDocument);
    else Reflect.deleteProperty(globalThis, "document");
  });
  const file = new File(["source"], "photo.png", { type: "image/png" });
  const crop = { x: 100, y: 50, width: 400, height: 200 };
  await convertImage(file, "image/png", 0.92, { crop, width: 200, ratio: true });
  assert.equal(canvas.width, 200);
  assert.equal(canvas.height, 100);
  assert.deepEqual(draws[0].slice(1), [100, 50, 400, 200, 0, 0, 200, 100]);

  await convertImage(file, "image/png", 0.92, { crop, ratio: true });
  assert.equal(canvas.width, 400);
  assert.equal(canvas.height, 200);

  await convertImage(file, "image/png", 0.92, { crop, width: 150, height: 150, ratio: false });
  assert.equal(canvas.width, 150);
  assert.equal(canvas.height, 150);

  await convertImage(file, "image/png");
  assert.deepEqual(draws.at(-1)!.slice(1), [0, 0, 800, 600, 0, 0, 800, 600]);

  await assert.rejects(convertImage(file, "image/png", 0.92, { crop: { ...crop, x: 700 }, ratio: true }), /Invalid crop/);
  await assert.rejects(convertImage(file, "image/png", 0.92, { width: -1, ratio: true }), /dimensions/);
});
