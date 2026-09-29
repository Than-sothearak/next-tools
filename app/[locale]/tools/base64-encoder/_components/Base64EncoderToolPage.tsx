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
export function Base64EncoderToolPage({ locale }: {
  locale: Locale;
}) {
  return <ToolPage slug="base64-encoder" locale={locale} config={{ accept: "*/*", acceptedLabel: "Text input", actionLabel: { en: "Encode", km: "អ៊ិនកូដ" }, textInput: true, controls: Controls, process: async (_files, text, _options, _save, setResult) => setResult(btoa(unescape(encodeURIComponent(text)))) }} />;
}
