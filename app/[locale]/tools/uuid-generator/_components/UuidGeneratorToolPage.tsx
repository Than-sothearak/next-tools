"use client";
import { ToolPage } from "@/components/tool-runner";
import type { Locale } from "@/lib/i18n";
import type { ToolControlsProps } from "@/components/tool-runner";
function Controls({ options, update }: ToolControlsProps) { return <div className="mb-5 max-w-xs"><label className="text-sm">Number of UUIDs<input type="number" min="1" max="100" className="field mt-2" value={String(options.amount??10)} onChange={(event) => update("amount", event.target.value)} /></label></div>; }
export function UuidGeneratorToolPage({ locale }: {
  locale: Locale;
}) { return <ToolPage slug="uuid-generator" locale={locale} config={{ accept: "*/*", acceptedLabel: "", actionLabel: { en: "Generate UUIDs", km: "បង្កើត UUID" }, hideUploader: true, allowEmptyInput: true, controls: Controls, process: async (_files, _text, options, _save, setResult) => { const amount=Math.min(100, Math.max(1, Number(options.amount)||10)); setResult(Array.from({ length: amount }, () => crypto.randomUUID()).join("\n")); } }} />; }
