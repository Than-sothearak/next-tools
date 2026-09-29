import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { categoryLabel, type Tool } from "@/lib/tools";
import type { Locale } from "@/lib/i18n";

export function ToolCard({ tool, locale }: { tool: Tool; locale: Locale }) {
  const Icon = tool.icon;
  return (
    <Link
      href={`/${locale}/tools/${tool.slug}`}
      className="group card flex min-h-[166px] flex-col p-5 transition hover:-translate-y-0.5 hover:border-[#bdcbc5] hover:shadow-sm"
    >
      <div className="mb-4 flex items-center justify-between">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f2f5f4] text-[#3d6c5e]">
          <Icon size={18} />
        </span>
        <ArrowRight
          className="text-[#9aa1a9] transition group-hover:translate-x-1 group-hover:text-[#265d50]"
          size={17}
        />
      </div>
      <div className="font-semibold">{tool.name[locale]}</div>
      <p className="mt-1 line-clamp-2 text-[13px] leading-5 text-[#737b87]">
        {tool.description[locale]}
      </p>
      <span className="mt-auto pt-3 text-[11px] font-semibold uppercase tracking-wide text-[#9299a2]">
        {categoryLabel[tool.category][locale]}
      </span>
    </Link>
  );
}
