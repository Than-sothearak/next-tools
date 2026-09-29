"use client";
import { ToolPage } from "@/components/tool-runner";
import type { Locale } from "@/lib/i18n";
import { convertImage } from "../../_components/imageProcessing";
export function JpgToPngToolPage({ locale }: {
  locale: Locale;
}) {
  return <ToolPage slug="jpg-to-png" locale={locale} config={{
    accept: "image/jpeg,image/png,image/webp", acceptedLabel: "JPG, PNG, WebP · up to 50 MB", actionLabel: { en: "Convert to PNG", km: "បម្លែងជា PNG" }, multiple: false, process: async (files, _text, _options, save) => {
      if (!files.length)
        throw new Error("Please select at least one file."); const file=files[0]; const stem=file.name.replace(/\.[^.]+$/u, ""); save(await convertImage(file, "image/png"), `${stem}.png`);
    }
  }} />;
}
