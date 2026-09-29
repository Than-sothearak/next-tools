import type { Tool } from "@/lib/tools";
import type { Locale } from "@/lib/i18n";
import { ToolCard } from "./tool-card";

export function ToolGrid({ items, locale }: { items: Tool[]; locale: Locale }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {items.map((tool) => (
        <ToolCard key={tool.slug} tool={tool} locale={locale} />
      ))}
    </div>
  );
}
