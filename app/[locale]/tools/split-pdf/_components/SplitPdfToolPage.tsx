"use client";
import { PDFDocument } from "pdf-lib";
import { ToolPage } from "@/components/tool-runner";
import type { Locale } from "@/lib/i18n";
import type { ToolControlsProps } from "@/components/tool-runner";
function Controls({ options, update }: ToolControlsProps) { return <div className="mb-5 max-w-sm"><label className="text-sm">Pages to extract (e.g. 1-3, 5)<input className="field mt-2" placeholder="1-3, 5" value={String(options.pages??"")} onChange={(event) => update("pages", event.target.value)} /></label></div>; }
function parsePageRange(value: string, total: number) {
  const pages=new Set<number>(); for (const part of value.split(",").map((item) => item.trim()).filter(Boolean)) {
    const match=part.match(/^(\d+)(?:\s*-\s*(\d+))?$/);
    if (!match)
      throw new Error("Use page ranges such as 1-3, 5, 7-10.");
    const first=Number(match[1]);
    const last=Number(match[2]??match[1]);
    if (first<1||last<first||last>total)
      throw new Error(`Page numbers must be between 1 and ${total}.`);
    for (let page=first;page<=last;page++)
      pages.add(page-1);
  } return [...pages].sort((a, b) => a-b);
}
export function SplitPdfToolPage({ locale }: {
  locale: Locale;
}) {
  return <ToolPage slug="split-pdf" locale={locale} config={{
    accept: "application/pdf", acceptedLabel: "PDF files · up to 50 MB", actionLabel: { en: "Extract pages", km: "ទាញយកទំព័រ" }, multiple: false, allowEmptyInput: true, controls: Controls, process: async (files, _text, options, save) => {
      if (!files.length)
        throw new Error("Please select at least one file."); const source=await PDFDocument.load(await files[0].arrayBuffer()); const total=source.getPageCount(); const range=String(options.pages??`1-${total}`); const indexes=parsePageRange(range, total); if (!indexes.length)
        throw new Error("No pages selected."); const output=await PDFDocument.create(); const pages=await output.copyPages(source, indexes); pages.forEach((page) => output.addPage(page)); save(new Blob([new Uint8Array(await output.save()).buffer as ArrayBuffer], { type: "application/pdf" }), "extracted-pages.pdf");
    }
  }} />;
}
