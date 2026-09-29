"use client";
import { ToolPage } from "@/components/tool-runner";
import type { Locale } from "@/lib/i18n";
function Controls({ locale, text, setText }: {
  locale: Locale;
  text: string;
  setText: (value: string) => void;
}) {
  const words=text.trim()? text.trim().split(/\s+/u).length:0;
  const characters=Array.from(text).length;
  const sentences=text.trim()? text.split(/[.!?។]+/u).filter((part) => part.trim()).length:0;
  const paragraphs=text.trim()? text.trim().split(/\n\s*\n/u).length:0;
  const items=locale==="en"? [["Characters", characters], ["No spaces", Array.from(text.replace(/\s/g, "")).length], ["Words", words], ["Sentences", sentences], ["Paragraphs", paragraphs], ["Reading time", `${Math.max(1, Math.ceil(words/200))} min`]]:[["តួអក្សរ", characters], ["គ្មានដកឃ្លា", Array.from(text.replace(/\s/g, "")).length], ["ពាក្យ", words], ["ប្រយោគ", sentences], ["កថាខណ្ឌ", paragraphs], ["ពេលអាន", `${Math.max(1, Math.ceil(words/200))} min`]];
  return <><textarea className="field min-h-[160px] resize-y font-mono text-sm" placeholder={locale==="km"? "បញ្ចូលអត្ថបទនៅទីនេះ...":"Enter text here..."} value={text} onChange={(event) => setText(event.target.value)} /><div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">{items.map(([label, value]) => <div className="rounded-lg bg-[#f7f8fa] p-3" key={String(label)}><div className="text-xs text-[#737b87]">{label}</div><div className="mt-1 font-semibold">{value}</div></div>)}</div></>;
}
export function WordCounterToolPage({ locale }: {
  locale: Locale;
}) { return <ToolPage slug="word-counter" locale={locale} config={{ accept: "*/*", acceptedLabel: "Text input", actionLabel: { en: "Count words", km: "រាប់ពាក្យ" }, textInput: true, controls: Controls, process: async (_files, text, _options, _save, setResult) => setResult(text) }} />; }
