import { ToolPage } from "@/components/tool-runner";
import type { Locale } from "@/lib/i18n";

export function RandomNumberGeneratorToolPage({ locale }: { locale: Locale }) {
  return <ToolPage slug="random-number-generator" locale={locale} />;
}
