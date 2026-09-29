import { ToolPage } from "@/components/tool-runner";
import type { Locale } from "@/lib/i18n";

export function CompressVideoToolPage({ locale }: { locale: Locale }) {
  return <ToolPage slug="compress-video" locale={locale} />;
}
