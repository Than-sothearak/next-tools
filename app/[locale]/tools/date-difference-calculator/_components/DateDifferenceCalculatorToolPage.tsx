import { ToolPage } from "@/components/tool-runner";
import type { Locale } from "@/lib/i18n";

export function DateDifferenceCalculatorToolPage({ locale }: { locale: Locale }) {
  return <ToolPage slug="date-difference-calculator" locale={locale} />;
}
