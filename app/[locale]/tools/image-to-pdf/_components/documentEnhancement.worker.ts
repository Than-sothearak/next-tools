import { enhanceDocumentPixels, type DocumentScanMode } from "./documentEnhancement";

type ScanRequest = {
  buffer: ArrayBuffer;
  width: number;
  height: number;
  mode: DocumentScanMode;
};

self.onmessage = (event: MessageEvent<ScanRequest>) => {
  const { buffer, width, height, mode } = event.data;
  try {
    enhanceDocumentPixels(new Uint8ClampedArray(buffer), width, height, mode);
    self.postMessage({ buffer }, { transfer: [buffer] });
  } catch {
    self.postMessage({ error: "Could not enhance this scan." });
  }
};
