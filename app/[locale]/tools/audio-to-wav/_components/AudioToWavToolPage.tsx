import { ToolPage } from "@/components/tool-runner";
import type { Locale } from "@/lib/i18n";

export function AudioToWavToolPage({ locale }: { locale: Locale }) {
  return <ToolPage slug="audio-to-wav" locale={locale} />;
}
