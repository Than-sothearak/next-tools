"use client";

import { useEffect, useState } from "react";
import type { ToolControlsProps } from "@/components/tool-runner";
import { ImageCropEditor } from "@/components/image-crop/image-crop-editor";
import { pixelCrop, type Crop, type Bounds } from "@/components/image-crop/geometry";

export const imageKey = (file: File) => JSON.stringify([file.name, file.size, file.lastModified]);

export function ResizeImageControls({ files, options, update, locale }: ToolControlsProps) {
  const file = files[0];
  const km = locale === "km";
  const [preview, setPreview] = useState<{ file: File; url: string; bounds: Bounds; crop: Crop } | null>(null);
  const [failure, setFailure] = useState<File | null>(null);

  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    const image = new window.Image();
    let active = true;
    image.onload = () => {
      if (!active) return;
      const bounds = { width: image.naturalWidth, height: image.naturalHeight };
      const crop = { x: 0, y: 0, ...bounds };
      setPreview({ file, url, bounds, crop });
      setFailure(null);
      update("crop", JSON.stringify({ source: imageKey(file), ...crop }));
    };
    image.onerror = () => { if (active) setFailure(file); };
    image.src = url;
    return () => { active = false; URL.revokeObjectURL(url); };
  }, [file, update]);

  return (
    <div className="mb-5 grid gap-6 rounded-xl border border-[#e7e9ed] bg-[#fafbfc] p-4 sm:p-5">
      {file && preview?.file === file ? (
        <ImageCropEditor src={preview.url} bounds={preview.bounds} crop={preview.crop} locale={locale} onChange={(crop) => {
          setPreview({ ...preview, crop });
          update("crop", JSON.stringify({ source: imageKey(file), ...pixelCrop(crop) }));
        }} />
      ) : (
        <p className="py-6 text-center text-sm text-[#737b87]" role="status">{file ? failure === file ? (km ? "មិនអាចបើករូបភាពនេះបានទេ។" : "Could not open this image. Please choose another file.") : (km ? "កំពុងផ្ទុករូបភាព…" : "Loading image…") : (km ? "បង្ហោះរូបភាពដើម្បីចាប់ផ្ដើមកាត់។" : "Upload an image to start cropping.")}</p>
      )}
      <div className="border-t border-[#e7e9ed] pt-4">
        <h2 className="font-semibold">{km ? "ទំហំរូបភាពចេញ" : "Output size"}</h2>
        <p className="mt-1 text-sm text-[#737b87]">{km ? "ទុកទទេដើម្បីរក្សាទំហំតំបន់កាត់។" : "Leave dimensions empty to keep the crop's original size."}</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="text-sm">{km ? "ទទឹង (px)" : "Width (px)"}<input type="number" min={1} max={16384} step={1} className="field mt-1" placeholder={preview && preview.file === file ? String(pixelCrop(preview.crop).width) : "Width"} value={String(options.width ?? "")} onChange={(event) => update("width", event.target.value)} /></label>
          <label className="text-sm">{km ? "កម្ពស់ (px)" : "Height (px)"}<input type="number" min={1} max={16384} step={1} className="field mt-1" placeholder={preview && preview.file === file ? String(pixelCrop(preview.crop).height) : "Height"} value={String(options.height ?? "")} onChange={(event) => update("height", event.target.value)} /></label>
          <label className="flex items-center gap-2 text-sm sm:col-span-2"><input type="checkbox" checked={options.ratio !== false} onChange={(event) => update("ratio", event.target.checked)} />{km ? "រក្សាសមាមាត្រនៃតំបន់កាត់" : "Maintain crop aspect ratio"}</label>
        </div>
      </div>
    </div>
  );
}
