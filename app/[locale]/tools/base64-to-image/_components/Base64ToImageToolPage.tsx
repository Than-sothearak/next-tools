"use client";
import { ToolPage } from "@/components/tool-runner";
import type { Locale } from "@/lib/i18n";
function Controls({ locale, text, setText }: {
  locale: Locale;
  text: string;
  setText: (value: string) => void;
}) { return <textarea className="field min-h-[160px] resize-y font-mono text-sm" placeholder={locale==="km"? "បញ្ចូលអត្ថបទនៅទីនេះ...":"Enter text here..."} value={text} onChange={(event) => setText(event.target.value)} />; }
export function Base64ToImageToolPage({ locale }: {
  locale: Locale;
}) {
  return <ToolPage slug="base64-to-image" locale={locale} config={{
    accept: "*/*", acceptedLabel: "Text input", actionLabel: { en: "Create image", km: "បង្កើតរូបភាព" }, textInput: true, controls: Controls, process: async (_files, text, _options, save) => {
      try {
        const [metadata, data]=text.includes(",")? text.split(",", 2):["data:image/png;base64", text];
        const mime=metadata.match(/data:(.*?);/)?.[1]??"image/png";
        const binary=atob(data.trim());
        const bytes=new Uint8Array(binary.length);
        for (let index=0;index<binary.length;index++)
          bytes[index]=binary.charCodeAt(index);
        save(new Blob([bytes], { type: mime }), "image.png");
      }
      catch {
        throw new Error("Invalid Base64 input.");
      }
    }
  }} />;
}
