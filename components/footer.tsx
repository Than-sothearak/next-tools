import Link from "next/link";
import { categories, categoryLabel } from "@/lib/tools";
import { copy, type Locale } from "@/lib/i18n";

export function Footer({ locale }: { locale: Locale }) {
  const t = copy[locale];
  return (
    <footer className="mt-24 border-t border-[#eceef0] bg-[#fafbfc]">
      <div className="shell grid gap-9 py-12 md:grid-cols-[2fr_1fr_1fr_1fr]">
        <div>
          <Link href={`/${locale}`} className="text-xl font-bold">
            Tools
          </Link>
          <p className="mt-3 max-w-xs text-sm leading-6 text-[#737b87]">
            {t.tagline}
          </p>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-semibold">{t.all}</h3>
          <div className="grid gap-2 text-sm text-[#737b87]">
            {categories.slice(0, 4).map((c) => (
              <Link key={c} href={`/${locale}/tools?category=${c}`}>
                {categoryLabel[c][locale]}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-semibold">Tools</h3>
          <div className="grid gap-2 text-sm text-[#737b87]">
            <a href="#why">{t.about}</a>
            <a href="#privacy">{t.privacy}</a>
            <a href="#privacy">{t.terms}</a>
            <a href="mailto:hello@tools.example">{t.contact}</a>
          </div>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-semibold">Language</h3>
          <div className="grid gap-2 text-sm">
            <Link href={"/en"}>English</Link>
            <Link href={"/km"}>ខ្មែរ</Link>
          </div>
        </div>
      </div>
      <div className="border-t border-[#eceef0]">
        <div className="shell py-5 text-xs text-[#737b87]">
          © 2026 Tools. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
