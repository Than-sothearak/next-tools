import { ToolPage } from "@/components/tool-runner";
import type { Locale } from "@/lib/i18n";

export function CropImageToolPage({ locale }: { locale: Locale }) {
  return <ToolPage slug="crop-image" locale={locale} />;
}
