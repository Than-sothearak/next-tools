import { ToolPage } from "@/components/tool-runner";
import type { Locale } from "@/lib/i18n";

export function RemoveDuplicateLinesToolPage({ locale }: { locale: Locale }) {
  return <ToolPage slug="remove-duplicate-lines" locale={locale} />;
}
