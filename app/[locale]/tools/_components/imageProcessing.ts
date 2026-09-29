export function convertImage(
  file: File,
  type: string,
  quality = 0.92,
  size?: { width?: number; height?: number; ratio: boolean; crop?: { x: number; y: number; width: number; height: number } },
) {
  return new Promise<Blob>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      const crop = size?.crop ?? { x: 0, y: 0, width: image.naturalWidth, height: image.naturalHeight };
      if (![crop.x, crop.y, crop.width, crop.height].every(Number.isFinite) || crop.x < 0 || crop.y < 0 || crop.width < 1 || crop.height < 1 || crop.x + crop.width > image.naturalWidth || crop.y + crop.height > image.naturalHeight) {
        URL.revokeObjectURL(url);
        reject(new Error("Invalid crop selection. Reset the crop and try again."));
        return;
      }
      let width = size?.width ?? crop.width;
      let height = size?.height ?? crop.height;

      if (size?.ratio) {
        const ratio = crop.width / crop.height;
        if (size.width && !size.height) height = Math.round(width / ratio);
        else if (size.height && !size.width) width = Math.round(height * ratio);
        else if (size.width && size.height) {
          const scale = Math.min(
            width / crop.width,
            height / crop.height,
          );
          width = Math.round(crop.width * scale);
          height = Math.round(crop.height * scale);
        }
      }

      if (![width, height].every((value) => Number.isFinite(value) && value >= 1 && value <= 16384) || width * height > 64_000_000) {
        URL.revokeObjectURL(url);
        reject(new Error("Choose smaller output dimensions (maximum 16,384 px per side and 64 megapixels)."));
        return;
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
      context.imageSmoothingQuality = "high";
      context.drawImage(image, crop.x, crop.y, crop.width, crop.height, 0, 0, width, height);
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
