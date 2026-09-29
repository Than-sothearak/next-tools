import Link from "next/link";
import { FileText, Image, Video, AudioLines, Braces, Type, Wrench } from "lucide-react";
import { categories, categoryLabel } from "@/lib/tools";
import type { Locale } from "@/lib/i18n";

export function CategoryTiles({ locale }: { locale: Locale }) {
  const icons = [FileText, Image, Video, AudioLines, Braces, Type, Wrench];
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
      {categories.map((c, i) => {
        const Icon = icons[i];
        return (
          <Link
            href={`/${locale}/tools?category=${c}`}
            key={c}
            className="card flex flex-col items-center gap-3 p-5 text-center transition hover:border-[#bdcbc5]"
          >
            <Icon size={20} className="text-[#477566]" />
            <span className="text-xs font-semibold">
              {categoryLabel[c][locale]}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
