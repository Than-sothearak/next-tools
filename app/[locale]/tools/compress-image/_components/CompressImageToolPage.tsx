"use client";
import { ToolPage } from "@/components/tool-runner";
import type { Locale } from "@/lib/i18n";
import type { ToolControlsProps } from "@/components/tool-runner";
import { convertImage } from "../../_components/imageProcessing";
function Controls({ options, update }: ToolControlsProps) { return <div className="mb-5 grid gap-3 rounded-lg bg-[#fafbfc] p-4"><label className="text-sm">Quality: {String(options.quality??75)}%<input type="range" min="10" max="100" className="mt-3 w-full accent-[#356859]" value={String(options.quality??75)} onChange={(event) => update("quality", event.target.value)} /></label></div>; }
export function CompressImageToolPage({ locale }: {
  locale: Locale;
}) {
  return <ToolPage slug="compress-image" locale={locale} config={{
    accept: "image/jpeg,image/png,image/webp", acceptedLabel: "JPG, PNG, WebP · up to 50 MB", actionLabel: { en: "Compress image", km: "បង្រួមរូបភាព" }, multiple: true, controls: Controls, process: async (files, _text, options, save) => {
      if (!files.length)
        throw new Error("Please select at least one file."); for (const file of files) {
          const blob=await convertImage(file, "image/jpeg", Number(options.quality??75)/100);
          const stem=file.name.replace(/\.[^.]+$/u, "");
          save(blob, `${stem}.jpeg`);
        }
    }
  }} />;
}
