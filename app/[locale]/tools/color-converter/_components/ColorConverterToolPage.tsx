import { ToolPage } from "@/components/tool-runner";
import type { Locale } from "@/lib/i18n";

export function ColorConverterToolPage({ locale }: { locale: Locale }) {
  return <ToolPage slug="color-converter" locale={locale} />;
}
