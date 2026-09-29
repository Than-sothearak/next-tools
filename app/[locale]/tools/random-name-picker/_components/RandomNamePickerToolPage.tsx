import { ToolPage } from "@/components/tool-runner";
import type { Locale } from "@/lib/i18n";

export function RandomNamePickerToolPage({ locale }: { locale: Locale }) {
  return <ToolPage slug="random-name-picker" locale={locale} />;
}
