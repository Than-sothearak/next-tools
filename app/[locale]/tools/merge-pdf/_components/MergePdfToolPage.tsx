"use client";
import { PDFDocument } from "pdf-lib";
import { ToolPage } from "@/components/tool-runner";
import type { Locale } from "@/lib/i18n";
export function MergePdfToolPage({ locale }: {
  locale: Locale;
}) {
  return <ToolPage slug="merge-pdf" locale={locale} config={{
    accept: "application/pdf", acceptedLabel: "PDF files · up to 50 MB", actionLabel: { en: "Merge PDFs", km: "បញ្ចូល PDF" }, multiple: true, reorderFiles: true, process: async (files, _text, _options, save) => {
      if (!files.length)
        throw new Error("Please select at least one file."); const merged=await PDFDocument.create(); for (const file of files) {
          const source=await PDFDocument.load(await file.arrayBuffer());
          const pages=await merged.copyPages(source, source.getPageIndices());
          pages.forEach((page) => merged.addPage(page));
        } save(new Blob([new Uint8Array(await merged.save()).buffer as ArrayBuffer], { type: "application/pdf" }), "merged.pdf");
    }
  }} />;
}
