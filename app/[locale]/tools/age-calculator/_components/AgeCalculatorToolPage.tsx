import { ToolPage } from "@/components/tool-runner";
import type { Locale } from "@/lib/i18n";

export function AgeCalculatorToolPage({ locale }: { locale: Locale }) {
  return <ToolPage slug="age-calculator" locale={locale} />;
}
