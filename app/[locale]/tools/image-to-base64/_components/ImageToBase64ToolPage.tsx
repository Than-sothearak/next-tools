"use client";
import { ToolPage } from "@/components/tool-runner";
import type { Locale } from "@/lib/i18n";
import { arrayBufferToBase64 } from "../../_components/imageProcessing";
export function ImageToBase64ToolPage({ locale }: {
  locale: Locale;
}) {
  return <ToolPage slug="image-to-base64" locale={locale} config={{
    accept: "image/jpeg,image/png,image/webp", acceptedLabel: "JPG, PNG, WebP · up to 50 MB", actionLabel: { en: "Convert to Base64", km: "បម្លែងជា Base64" }, multiple: false, process: async (files, _text, _options, _save, setResult) => {
      if (!files.length)
        throw new Error("Please select at least one file."); const file=files[0]; setResult(`data:${file.type};base64,${arrayBufferToBase64(await file.arrayBuffer())}`);
    }
  }} />;
}
