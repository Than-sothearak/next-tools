import { ToolPage } from "@/components/tool-runner";
import type { Locale } from "@/lib/i18n";

export function RemovePdfPagesToolPage({ locale }: { locale: Locale }) {
  return <ToolPage slug="remove-pdf-pages" locale={locale} />;
}
