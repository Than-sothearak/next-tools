import { ToolPage } from "@/components/tool-runner";
import type { Locale } from "@/lib/i18n";

export function VideoToMp3ToolPage({ locale }: { locale: Locale }) {
  return <ToolPage slug="video-to-mp3" locale={locale} />;
}
