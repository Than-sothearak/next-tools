export function convertImage(
  file: File,
  type: string,
  quality = 0.92,
  size?: { width?: number; height?: number; ratio: boolean },
) {
  return new Promise<Blob>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      let width = size?.width ?? image.naturalWidth;
      let height = size?.height ?? image.naturalHeight;

      if (size?.ratio) {
        const ratio = image.naturalWidth / image.naturalHeight;
        if (size.width && !size.height) height = Math.round(width / ratio);
        else if (size.height && !size.width) width = Math.round(height * ratio);
        else if (size.width && size.height) {
          const scale = Math.min(
            width / image.naturalWidth,
            height / image.naturalHeight,
          );
          width = Math.round(image.naturalWidth * scale);
          height = Math.round(image.naturalHeight * scale);
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d");
      if (!context) {
        URL.revokeObjectURL(url);
        reject(new Error("Could not process this image."));
        return;
      }

      if (type === "image/jpeg") {
        context.fillStyle = "white";
        context.fillRect(0, 0, width, height);
      }
      context.drawImage(image, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(url);
          if (blob) resolve(blob);
          else reject(new Error("Could not convert this image."));
        },
        type,
        quality,
      );
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Unsupported image format."));
    };
    image.src = url;
  });
}

export async function imageAsPngBytes(file: File) {
  const blob = await convertImage(file, "image/png");
  return blob.arrayBuffer();
}

export function arrayBufferToBase64(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const chunkSize = 0x8000;
  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
  }
  return btoa(binary);
}
