import Link from "next/link";
import { Sparkles, LockKeyhole, ShieldCheck, Zap, Check } from "lucide-react";
import { tools } from "@/lib/tools";
import { copy, type Locale } from "@/lib/i18n";
import { Navbar } from "./navbar";
import { Footer } from "./footer";
import { ToolSearch } from "./tool-search";
import { ToolGrid } from "./tool-grid";
import { CategoryTiles } from "./category-tiles";

export function HomePage({ locale }: { locale: Locale }) {
  const t = copy[locale];
  return (
    <>
      <Navbar locale={locale} />
      <main>
        <section className="shell pb-14 pt-16 text-center sm:pb-16 sm:pt-24">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#e9eeeb] bg-[#f8faf9] px-3 py-1.5 text-xs font-medium text-[#477566]">
            <Sparkles size={14} /> {t.tagline}
          </div>
          <h1 className="mx-auto max-w-3xl text-4xl font-bold leading-[1.13] tracking-[-.04em] sm:text-6xl">
            {t.hero}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-[#737b87] sm:text-lg">
            {t.heroDesc}
          </p>
          <div className="mt-8">
            <ToolSearch locale={locale} />
          </div>
          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-[#9299a2]">
            <LockKeyhole size={13} />
            {t.supported}
          </div>
        </section>
        <section className="shell border-t border-[#f0f1f2] py-12">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-bold">{t.popular}</h2>
            <Link
              className="text-sm font-semibold text-[#477566]"
              href={`/${locale}/tools`}
            >
              {t.browse} →
            </Link>
          </div>
          <ToolGrid
            items={tools.filter((x) => x.popular).slice(0, 8)}
            locale={locale}
          />
        </section>
        <section className="shell py-10">
          <h2 className="mb-5 text-xl font-bold">{t.categories}</h2>
          <CategoryTiles locale={locale} />
        </section>
        <section className="shell py-10">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-bold">{t.allTools}</h2>
            <Link
              className="text-sm font-semibold text-[#477566]"
              href={`/${locale}/tools`}
            >
              {t.browse} →
            </Link>
          </div>
          <ToolGrid items={tools.slice(0, 8)} locale={locale} />
        </section>
        <section id="why" className="mt-12 bg-[#f8f9fa] py-14">
          <div className="shell">
            <h2 className="mb-8 text-center text-2xl font-bold">{t.why}</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { Icon: Zap, title: t.fast, body: t.fastDesc },
                { Icon: ShieldCheck, title: t.private, body: t.privateDesc },
                { Icon: Check, title: t.simple, body: t.simpleDesc },
              ].map((x) => (
                <div className="card p-6" key={x.title}>
                  <x.Icon size={21} className="mb-4 text-[#477566]" />
                  <h3 className="font-semibold">{x.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#737b87]">
                    {x.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section id="privacy" className="shell py-10">
          <div className="flex items-start gap-3 rounded-xl border border-[#e8eeeb] bg-[#f8faf9] p-5">
            <ShieldCheck size={20} className="mt-0.5 shrink-0 text-[#477566]" />
            <div>
              <h3 className="text-sm font-semibold">{t.privacy}</h3>
              <p className="mt-1 text-sm leading-6 text-[#737b87]">
                {t.privacyText}
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer locale={locale} />
    </>
  );
}
