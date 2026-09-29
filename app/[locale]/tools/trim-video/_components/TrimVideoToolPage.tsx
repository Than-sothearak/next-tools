import { ToolPage } from "@/components/tool-runner";
import type { Locale } from "@/lib/i18n";

export function TrimVideoToolPage({ locale }: { locale: Locale }) {
  return <ToolPage slug="trim-video" locale={locale} />;
}
