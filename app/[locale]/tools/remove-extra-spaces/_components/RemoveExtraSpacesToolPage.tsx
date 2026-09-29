import { ToolPage } from "@/components/tool-runner";
import type { Locale } from "@/lib/i18n";

export function RemoveExtraSpacesToolPage({ locale }: { locale: Locale }) {
  return <ToolPage slug="remove-extra-spaces" locale={locale} />;
}
