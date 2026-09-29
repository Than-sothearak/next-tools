import { ToolPage } from "@/components/tool-runner";
import type { Locale } from "@/lib/i18n";

export function CompressPdfToolPage({ locale }: { locale: Locale }) {
  return <ToolPage slug="compress-pdf" locale={locale} />;
}
