import { ToolPage } from "@/components/tool-runner";
import type { Locale } from "@/lib/i18n";

export function VideoInformationToolPage({ locale }: { locale: Locale }) {
  return <ToolPage slug="video-information" locale={locale} />;
}
