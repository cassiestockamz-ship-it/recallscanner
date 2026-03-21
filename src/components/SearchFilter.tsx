"use client";

import { useState } from "react";
import Link from "next/link";

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

export default function SearchFilter({ items, placeholder, columns = "grid-cols-2 sm:grid-cols-3 md:grid-cols-4" }: Props) {
  const [query, setQuery] = useState("");

  const filtered = query
    ? items.filter((item) => item.label.toLowerCase().includes(query.toLowerCase()))
    : items;

  return (
    <div>
      <div className="mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full max-w-sm px-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand placeholder:text-slate-400"
        />
        {query && (
          <span className="ml-3 text-xs text-slate-400">
            {filtered.length} of {items.length} shown
          </span>
        )}
      </div>
      <div className={`grid ${columns} gap-3`}>
        {filtered.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="bg-white border border-border rounded-lg p-4 hover:border-brand transition-colors group"
          >
            <div className="font-medium text-slate-800 group-hover:text-brand transition-colors">
              {item.label}
            </div>
            <div className="text-xs text-slate-400 mt-1">{item.subtitle || "View recalls →"}</div>
          </Link>
        ))}
      </div>
      {query && filtered.length === 0 && (
        <div className="text-center py-8 text-slate-400 text-sm">
          No matches for &quot;{query}&quot;.{" "}
          <button onClick={() => setQuery("")} className="text-brand hover:underline cursor-pointer">
            Clear search
          </button>
        </div>
      )}
    </div>
  );
}
