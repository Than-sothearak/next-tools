"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, Wrench as ToolLogo, X } from "lucide-react";
import { copy, type Locale } from "@/lib/i18n";
import { AuthControl } from "./auth-control";

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
