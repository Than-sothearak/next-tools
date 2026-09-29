"use client";

import Link from "next/link";
import { useState } from "react";
import { tools, categories, categoryLabel, type Category } from "@/lib/tools";
import { copy, type Locale } from "@/lib/i18n";
import { Navbar } from "./navbar";
import { Footer } from "./footer";
import { ToolSearch } from "./tool-search";
import { ToolGrid } from "./tool-grid";

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
