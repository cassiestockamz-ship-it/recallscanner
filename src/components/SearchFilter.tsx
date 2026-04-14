"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, X, ArrowRight } from "lucide-react";

interface Item {
  label: string;
  href: string;
  subtitle?: string;
}

interface Props {
  items: Item[];
  placeholder: string;
  columns?: string;
}

export default function SearchFilter({
  items,
  placeholder,
  columns = "grid-cols-2 sm:grid-cols-3 md:grid-cols-4",
}: Props) {
  const [query, setQuery] = useState("");

  const filtered = query
    ? items.filter((item) => item.label.toLowerCase().includes(query.toLowerCase()))
    : items;

  return (
    <div>
      <div className="relative max-w-md mb-5">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-[var(--color-border)] bg-white text-[14px] outline-none focus:border-[var(--color-brand)] focus:ring-4 focus:ring-[var(--color-brand)]/10 transition-all"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            aria-label="Clear search"
          >
            <X size={16} />
          </button>
        )}
      </div>
      {query && (
        <div className="text-[12px] text-slate-400 mb-3">
          {filtered.length} of {items.length} shown
        </div>
      )}
      <div className={`grid ${columns} gap-2`}>
        {filtered.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group rounded-xl border border-[var(--color-border)] bg-white p-3.5 hover:border-[var(--color-brand)] transition-colors"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="font-semibold text-slate-900 text-[14px] group-hover:text-[var(--color-brand)] transition-colors truncate">
                  {item.label}
                </div>
                {item.subtitle && (
                  <div className="text-[11px] text-slate-400 mt-0.5 truncate">
                    {item.subtitle}
                  </div>
                )}
              </div>
              <ArrowRight
                size={14}
                className="text-slate-300 group-hover:text-[var(--color-brand)] group-hover:translate-x-0.5 transition-all shrink-0"
              />
            </div>
          </Link>
        ))}
      </div>
      {query && filtered.length === 0 && (
        <div className="text-center py-10 text-slate-400 text-[13px]">
          No matches for &quot;{query}&quot;.{" "}
          <button
            onClick={() => setQuery("")}
            className="text-[var(--color-brand)] hover:underline cursor-pointer"
          >
            Clear search
          </button>
        </div>
      )}
    </div>
  );
}
