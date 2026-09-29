import { ToolPage } from "@/components/tool-runner";
import type { Locale } from "@/lib/i18n";

export function VideoToAudioToolPage({ locale }: { locale: Locale }) {
  return <ToolPage slug="video-to-audio" locale={locale} />;
}
