"use client";
import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  ArrowRight,
  Menu,
  Search,
  Wrench as ToolLogo,
  X,
  ShieldCheck,
  Zap,
  Check,
  LockKeyhole,
  FileText,
  Image,
  Video,
  AudioLines,
  Braces,
  Type,
  Wrench,
  Sparkles,
} from "lucide-react";
import { tools, categories, categoryLabel, Tool, Category } from "@/lib/tools";
import { copy, Locale } from "@/lib/i18n";
export function Navbar({ locale }: { locale: Locale }) {
  const t = copy[locale],
    path = usePathname(),
    [open, setOpen] = useState(false);
  const nav = [
    { label: t.home, href: `/${locale}` },
    { label: t.all, href: `/${locale}/tools` },
    { label: t.pdf, href: `/${locale}/tools?category=PDF` },
    { label: t.image, href: `/${locale}/tools?category=Image` },
    { label: t.video, href: `/${locale}/tools?category=Video` },
    { label: t.audio, href: `/${locale}/tools?category=Audio` },
    { label: t.developer, href: `/${locale}/tools?category=Developer` },
  ];
  return (
    <header className="sticky top-0 z-30 border-b border-[#eceef0] bg-white/95 backdrop-blur">
      <div className="shell flex h-[68px] items-center justify-between">
        <Link
          href={`/${locale}`}
          className="flex items-center gap-2 text-[20px] font-bold tracking-tight"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#eaf1ee] text-[#265d50]">
            <ToolLogo size={18} />
          </span>
          Tools
        </Link>
        <nav className="hidden items-center gap-6 lg:flex">
          {nav.map((n, i) => (
            <Link
              key={n.label}
              href={n.href}
              className={`text-[13px] font-medium ${i === 0 && path === `/${locale}` ? "text-[#265d50]" : "text-[#59616b] hover:text-[#171a1f]"}`}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-4 sm:flex">
          <Link
            href={`${path.replace(/^\/(en|km)/, locale === "en" ? "/km" : "/en")}`}
            className="text-sm font-semibold text-[#59616b] hover:text-[#171a1f]"
          >
            {locale === "en" ? "ខ្មែរ" : "EN"}
          </Link>
          <AuthControl locale={locale} />
        </div>
        <button
          className="rounded-lg p-2 lg:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      {open && (
        <nav className="border-t px-6 py-3 lg:hidden">
          {nav.map((n) => (
            <Link
              key={n.label}
              onClick={() => setOpen(false)}
              href={n.href}
              className="block py-2 text-sm"
            >
              {n.label}
            </Link>
          ))}
          <div className="flex items-center gap-4 py-2">
            <Link
              href={path.replace(/^\/(en|km)/, locale === "en" ? "/km" : "/en")}
            >
              {locale === "en" ? "ខ្មែរ" : "EN"}
            </Link>
            <AuthControl locale={locale} />
          </div>
        </nav>
      )}
    </header>
  );
}
function AuthControl({ locale }: { locale: Locale }) {
  const key = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  if (!key)
    return (
      <Link
        className="btn btn-primary !px-4 !py-2 text-sm"
        href={`/${locale}/sign-in`}
      >
        {copy[locale].signIn}
      </Link>
    );
  return (
    <>
      <SignedOut>
        <SignInButton mode="modal">
          <button className="btn btn-primary !px-4 !py-2 text-sm">
            {copy[locale].signIn}
          </button>
        </SignInButton>
      </SignedOut>
      <SignedIn>
        <UserButton />
      </SignedIn>
    </>
  );
}
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
export function ToolGrid({ items, locale }: { items: Tool[]; locale: Locale }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {items.map((tool) => (
        <ToolCard key={tool.slug} tool={tool} locale={locale} />
      ))}
    </div>
  );
}
export function ToolSearch({
  locale,
  initial = "",
  value,
  onChange,
  showResults = true,
}: {
  locale: Locale;
  initial?: string;
  value?: string;
  onChange?: (q: string) => void;
  showResults?: boolean;
}) {
  const [localQ, setLocalQ] = useState(initial);
  const q = value ?? localQ;
  const setQ = onChange ?? setLocalQ;
  const result = tools.filter((x) =>
    `${x.name.en} ${x.name.km} ${x.description.en} ${x.category}`
      .toLowerCase()
      .includes(q.toLowerCase()),
  );
  return (
    <div>
      <div className="relative mx-auto max-w-[620px]">
        <Search
          size={19}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9199a3]"
        />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={copy[locale].search}
          className="field h-[54px] rounded-xl pl-12 text-[15px] shadow-sm"
        />
      </div>
      {q && showResults && (
        <div className="mt-8">
          <div className="mb-4 text-sm text-[#737b87]">
            {result.length}{" "}
            {locale === "en" ? "tools found" : "ឧបករណ៍ដែលបានរកឃើញ"}
          </div>
          {result.length ? (
            <ToolGrid items={result} locale={locale} />
          ) : (
            <p className="py-10 text-center text-[#737b87]">
              {copy[locale].empty}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
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
export function ToolListPage({
  locale,
  category,
}: {
  locale: Locale;
  category?: string;
}) {
  const t = copy[locale],
    [query, setQuery] = useState("");
  const selected = categories.find((x) => x === category);
  const items = (
    selected ? tools.filter((x) => x.category === selected) : tools
  ).filter((x) =>
    `${x.name.en} ${x.name.km} ${x.description.en} ${x.category}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  return (
    <>
      <Navbar locale={locale} />
      <main className="shell min-h-[60vh] py-12">
        <div className="mb-8">
          <p className="mb-2 text-sm text-[#737b87]">
            {t.home} / {t.all}
          </p>
          <h1 className="text-3xl font-bold tracking-tight">
            {selected ? categoryLabel[selected][locale] : t.allTools}
          </h1>
          <p className="mt-2 text-[#737b87]">
            {locale === "en"
              ? "Find the right tool for your everyday tasks."
              : "ស្វែងរកឧបករណ៍សម្រាប់ការងារប្រចាំថ្ងៃរបស់អ្នក។"}
          </p>
        </div>
        <ToolSearch
          locale={locale}
          value={query}
          onChange={setQuery}
          showResults={false}
        />
        {!category && (
          <div className="mt-8 flex flex-wrap gap-2">
            {["All", ...categories].map((c) => (
              <Link
                className={`btn !px-4 !py-2 text-sm ${category === c || (!category && c === "All") ? "btn-primary" : ""}`}
                href={
                  c === "All"
                    ? `/${locale}/tools`
                    : `/${locale}/tools?category=${c}`
                }
                key={c}
              >
                {c === "All"
                  ? t.allTools
                  : categoryLabel[c as Category][locale]}
              </Link>
            ))}
          </div>
        )}
        <div className="mt-8">
          {items.length ? (
            <ToolGrid items={items} locale={locale} />
          ) : (
            <p className="py-10 text-center text-sm text-[#737b87]">
              {t.empty}
            </p>
          )}
        </div>
      </main>
      <Footer locale={locale} />
    </>
  );
}
