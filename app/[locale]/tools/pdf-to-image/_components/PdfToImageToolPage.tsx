import { ToolPage } from "@/components/tool-runner";
import type { Locale } from "@/lib/i18n";

export function PdfToImageToolPage({ locale }: { locale: Locale }) {
  return <ToolPage slug="pdf-to-image" locale={locale} />;
}
