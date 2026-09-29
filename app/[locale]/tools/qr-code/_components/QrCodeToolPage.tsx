"use client";
import QRCode from "qrcode";
import { ToolPage } from "@/components/tool-runner";
import type { Locale } from "@/lib/i18n";
import type { ToolControlsProps } from "@/components/tool-runner";
function Controls({ locale, text, setText, options, update }: ToolControlsProps) { return <div className="mb-5 grid gap-3"><label className="text-sm font-medium">{locale==="en"? "Content":"មាតិកា"}<textarea className="field mt-1 min-h-[120px] resize-y font-mono text-sm" value={text} onChange={(event) => setText(event.target.value)} /></label><label className="text-sm">QR size<select className="field mt-1" value={String(options.size??256)} onChange={(event) => update("size", event.target.value)}><option value="128">128 px</option><option value="256">256 px</option><option value="512">512 px</option><option value="1024">1024 px</option></select></label></div>; }
export function QrCodeToolPage({ locale }: {
  locale: Locale;
}) {
  return <ToolPage slug="qr-code" locale={locale} config={{
    accept: "*/*", acceptedLabel: "", actionLabel: { en: "Generate QR code", km: "បង្កើត QR Code" }, hideUploader: true, allowEmptyInput: false, controls: Controls, imagePreview: true, process: async (_files, text, options, save) => {
      if (!text.trim())
        throw new Error("Enter content for your QR code."); const size=Number(options.size)||256; const png=await QRCode.toDataURL(text, { width: size, margin: 2, errorCorrectionLevel: "M" }); const blob=await (await fetch(png)).blob(); save(blob, "tools-qr-code.png"); const svg=await QRCode.toString(text, { type: "svg", width: size, margin: 2, errorCorrectionLevel: "M" }); save(new Blob([svg], { type: "image/svg+xml" }), "tools-qr-code.svg");
    }
  }} />;
}
