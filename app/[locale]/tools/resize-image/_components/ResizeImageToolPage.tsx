"use client";
import { ToolPage } from "@/components/tool-runner";
import type { Locale } from "@/lib/i18n";
import type { ToolControlsProps } from "@/components/tool-runner";
import { convertImage } from "../../_components/imageProcessing";
function Controls({ options, update }: ToolControlsProps) { return <div className="mb-5 grid gap-3 rounded-lg bg-[#fafbfc] p-4 sm:grid-cols-2"><label className="text-sm">Width (px)<input type="number" className="field mt-1" placeholder="Width" value={String(options.width??"")} onChange={(event) => update("width", event.target.value)} /></label><label className="text-sm">Height (px)<input type="number" className="field mt-1" placeholder="Height" value={String(options.height??"")} onChange={(event) => update("height", event.target.value)} /></label><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={Boolean(options.ratio??true)} onChange={(event) => update("ratio", event.target.checked)} />Maintain aspect ratio</label></div>; }
export function ResizeImageToolPage({ locale }: {
  locale: Locale;
}) {
  return <ToolPage slug="resize-image" locale={locale} config={{
    accept: "image/jpeg,image/png,image/webp", acceptedLabel: "JPG, PNG, WebP · up to 50 MB", actionLabel: { en: "Resize image", km: "ប្តូរទំហំ" }, multiple: false, controls: Controls, process: async (files, _text, options, save) => {
      if (!files.length)
        throw new Error("Please select at least one file."); const width=Number(options.width)||undefined; const height=Number(options.height)||undefined; if (!width&&!height)
        throw new Error("Enter a width or height."); const file=files[0]; const blob=await convertImage(file, "image/png", 0.92, { width, height, ratio: options.ratio!==false }); const stem=file.name.replace(/\.[^.]+$/u, ""); save(blob, `${stem}.png`);
    }
  }} />;
}
