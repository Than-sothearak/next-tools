"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { tools } from "@/lib/tools";
import { copy, type Locale } from "@/lib/i18n";
import { ToolGrid } from "./tool-grid";

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
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#9199a3]"
        />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={copy[locale].search}
          className="field rounded-xl pl-12! text-[15px] shadow-sm"
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
