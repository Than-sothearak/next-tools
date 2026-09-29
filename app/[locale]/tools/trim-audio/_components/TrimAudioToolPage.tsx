import { ToolPage } from "@/components/tool-runner";
import type { Locale } from "@/lib/i18n";

export function TrimAudioToolPage({ locale }: { locale: Locale }) {
  return <ToolPage slug="trim-audio" locale={locale} />;
}
