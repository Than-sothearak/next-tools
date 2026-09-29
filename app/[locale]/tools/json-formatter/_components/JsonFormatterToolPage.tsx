"use client";
import { ToolPage } from "@/components/tool-runner";
import type { Locale } from "@/lib/i18n";
function Controls({ locale, text, setText }: {
  locale: Locale;
  text: string;
  setText: (value: string) => void;
}) {
  return <textarea className="field min-h-[160px] resize-y font-mono text-sm" placeholder={locale==="km"? "បញ្ចូលអត្ថបទនៅទីនេះ...":"Enter text here..."} value={text} onChange={(event) => setText(event.target.value)} />;
}
export function JsonFormatterToolPage({ locale }: {
  locale: Locale;
}) {
  return <ToolPage slug="json-formatter" locale={locale} config={{
    accept: "*/*", acceptedLabel: "Text input", actionLabel: { en: "Format JSON", km: "រៀបចំ JSON" }, textInput: true, controls: Controls, process: async (_files, text, _options, _save, setResult) => {
      try {
        setResult(JSON.stringify(JSON.parse(text), null, 2));
      }
      catch {
        throw new Error("Invalid JSON. Please check your input.");
      }
    }
  }} />;
}
