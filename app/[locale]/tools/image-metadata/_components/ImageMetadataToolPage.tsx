import { ToolPage } from "@/components/tool-runner";
import type { Locale } from "@/lib/i18n";

export function ImageMetadataToolPage({ locale }: { locale: Locale }) {
  return <ToolPage slug="image-metadata" locale={locale} />;
}
