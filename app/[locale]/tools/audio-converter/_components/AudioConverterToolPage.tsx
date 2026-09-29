import { ToolPage } from "@/components/tool-runner";
import type { Locale } from "@/lib/i18n";

export function AudioConverterToolPage({ locale }: { locale: Locale }) {
  return <ToolPage slug="audio-converter" locale={locale} />;
}
