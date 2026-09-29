import { enhanceDocumentPixels, type DocumentScanMode } from "./documentEnhancement";

export async function enhanceDocument(canvas: HTMLCanvasElement, mode: DocumentScanMode) {
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) throw new Error("Could not read the captured image.");

  const image = context.getImageData(0, 0, canvas.width, canvas.height);
  if (typeof Worker === "undefined") {
    enhanceDocumentPixels(image.data, image.width, image.height, mode);
    context.putImageData(image, 0, 0);
    return;
  }

  const worker = new Worker(new URL("./documentEnhancement.worker.ts", import.meta.url), {
    type: "module",
  });
  let timeout: number | undefined;
  try {
    const buffer = await new Promise<ArrayBuffer>((resolve, reject) => {
      timeout = window.setTimeout(() => reject(new Error("Scan enhancement timed out.")), 20000);
      worker.onmessage = (event: MessageEvent<{ buffer?: ArrayBuffer; error?: string }>) => {
        window.clearTimeout(timeout);
        if (event.data.buffer) resolve(event.data.buffer);
        else reject(new Error(event.data.error || "Scan enhancement failed."));
      };
      worker.onerror = (event) => {
        event.preventDefault();
        window.clearTimeout(timeout);
        reject(new Error("Scan enhancement failed."));
      };
      worker.onmessageerror = () => {
        window.clearTimeout(timeout);
        reject(new Error("Could not read the enhanced scan."));
      };
      worker.postMessage(
        { buffer: image.data.buffer, width: image.width, height: image.height, mode },
        [image.data.buffer],
      );
    });
    context.putImageData(new ImageData(new Uint8ClampedArray(buffer), canvas.width, canvas.height), 0, 0);
  } finally {
    window.clearTimeout(timeout);
    worker.terminate();
  }
}
