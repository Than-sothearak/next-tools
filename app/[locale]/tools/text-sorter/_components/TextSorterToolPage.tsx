import { ToolPage } from "@/components/tool-runner";
import type { Locale } from "@/lib/i18n";

export function TextSorterToolPage({ locale }: { locale: Locale }) {
  return <ToolPage slug="text-sorter" locale={locale} />;
}
