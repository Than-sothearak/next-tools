import { ToolPage } from "@/components/tool-runner";
import type { Locale } from "@/lib/i18n";

export function AudioMergerToolPage({ locale }: { locale: Locale }) {
  return <ToolPage slug="audio-merger" locale={locale} />;
}
