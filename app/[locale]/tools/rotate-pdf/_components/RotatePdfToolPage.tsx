import { ToolPage } from "@/components/tool-runner";
import type { Locale } from "@/lib/i18n";

export function RotatePdfToolPage({ locale }: { locale: Locale }) {
  return <ToolPage slug="rotate-pdf" locale={locale} />;
}
