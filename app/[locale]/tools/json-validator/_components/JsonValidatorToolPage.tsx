import { ToolPage } from "@/components/tool-runner";
import type { Locale } from "@/lib/i18n";

export function JsonValidatorToolPage({ locale }: { locale: Locale }) {
  return <ToolPage slug="json-validator" locale={locale} />;
}
