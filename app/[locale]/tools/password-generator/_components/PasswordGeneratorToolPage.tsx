"use client";
import { ToolPage } from "@/components/tool-runner";
import type { Locale } from "@/lib/i18n";
import type { ToolControlsProps } from "@/components/tool-runner";
function Controls({ options, update }: ToolControlsProps) { return <div className="mb-5 grid gap-4 sm:grid-cols-2"><label className="text-sm">Length<input type="number" min="6" max="128" className="field mt-2" value={String(options.length??16)} onChange={(event) => update("length", event.target.value)} /></label>{[["uppercase", "Uppercase"], ["lowercase", "Lowercase"], ["numbers", "Numbers"], ["symbols", "Symbols"]].map(([key, label]) => <label className="flex items-center gap-2 text-sm" key={key}><input type="checkbox" checked={Boolean(options[key]??true)} onChange={(event) => update(key, event.target.checked)} />{label}</label>)}</div>; }
export function PasswordGeneratorToolPage({ locale }: {
  locale: Locale;
}) {
  return <ToolPage slug="password-generator" locale={locale} config={{
    accept: "*/*", acceptedLabel: "", actionLabel: { en: "Generate password", km: "បង្កើតពាក្យសម្ងាត់" }, hideUploader: true, allowEmptyInput: true, controls: Controls, process: async (_files, _text, options, _save, setResult) => {
      const characters=`${options.lowercase===false? "":"abcdefghijklmnopqrstuvwxyz"}${options.uppercase===false? "":"ABCDEFGHIJKLMNOPQRSTUVWXYZ"}${options.numbers===false? "":"0123456789"}${options.symbols===false? "":"!@#$%^&*()-_=+"}`; if (!characters)
        throw new Error("Choose at least one character type."); const length=Math.min(128, Math.max(6, Number(options.length)||16)); const bytes=crypto.getRandomValues(new Uint8Array(length)); setResult(Array.from(bytes, (byte) => characters[byte%characters.length]).join(""));
    }
  }} />;
}
