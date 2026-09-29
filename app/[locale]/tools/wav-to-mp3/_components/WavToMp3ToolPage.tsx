import { ToolPage } from "@/components/tool-runner";
import type { Locale } from "@/lib/i18n";

export function WavToMp3ToolPage({ locale }: { locale: Locale }) {
  return <ToolPage slug="wav-to-mp3" locale={locale} />;
}
