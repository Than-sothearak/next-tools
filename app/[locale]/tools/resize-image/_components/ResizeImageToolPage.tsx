"use client";

import { ToolPage } from "@/components/tool-runner";
import type { Locale } from "@/lib/i18n";
import type { Crop } from "@/components/image-crop/geometry";
import { convertImage } from "../../_components/imageProcessing";
import { imageKey, ResizeImageControls } from "./ResizeImageControls";

export function ResizeImageToolPage({ locale }: { locale: Locale }) {
  return <ToolPage slug="resize-image" locale={locale} config={{
    accept: "image/jpeg,image/png,image/webp",
    acceptedLabel: "JPG, PNG, WebP · up to 50 MB",
    actionLabel: { en: "Crop & resize image", km: "កាត់ និងប្ដូរទំហំរូបភាព" },
    multiple: false,
    imagePreview: true,
    controls: ResizeImageControls,
    process: async (files, _text, options, save) => {
      const file = files[0];
      if (!file) throw new Error("Please select an image.");
      if (!options.crop) throw new Error("Wait for the image preview to load.");
      const crop = JSON.parse(String(options.crop)) as Crop & { source: string };
      if (crop.source !== imageKey(file)) throw new Error("Wait for the image preview to load.");
      const dimension = (value: string | boolean | undefined) => {
        if (value === undefined || value === "") return undefined;
        const number = Number(value);
        if (!Number.isInteger(number) || number < 1 || number > 16384) throw new Error("Enter whole-number dimensions between 1 and 16,384 pixels.");
        return number;
      };
      const blob = await convertImage(file, "image/png", 0.92, {
        width: dimension(options.width),
        height: dimension(options.height),
        ratio: options.ratio !== false,
        crop,
      });
      save(blob, `${file.name.replace(/\.[^.]+$/u, "")}-resized.png`);
    },
  }} />;
}
