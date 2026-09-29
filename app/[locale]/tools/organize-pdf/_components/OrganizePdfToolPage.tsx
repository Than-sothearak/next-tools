import { ToolPage } from "@/components/tool-runner";
import type { Locale } from "@/lib/i18n";

export function OrganizePdfToolPage({ locale }: { locale: Locale }) {
  return <ToolPage slug="organize-pdf" locale={locale} />;
}
