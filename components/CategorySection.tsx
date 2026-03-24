"use client";

import { useState } from "react";
import { Category, SymbolMeta, QuoteData } from "@/types";
import { CATEGORY_LABELS } from "@/lib/symbols";
import { IndexCard } from "./IndexCard";

interface CategorySectionProps {
  category: Category;
  symbols: SymbolMeta[];
  quotes: Record<string, QuoteData>;
  isLoading: boolean;
  onCardClick: (meta: SymbolMeta) => void;
}

export function CategorySection({
  category,
  symbols,
  quotes,
  isLoading,
  onCardClick,
}: CategorySectionProps) {
  const [expanded, setExpanded] = useState(true);

  return (
    <section className="mb-6">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 mb-3 px-1 group cursor-pointer"
      >
        <ChevronIcon expanded={expanded} />
        <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
          {CATEGORY_LABELS[category]}
        </h2>
        <span className="text-xs text-gray-400 dark:text-gray-600">
          {symbols.length}
        </span>
      </button>

      {expanded && (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
          {symbols.map((meta) => (
            <div key={meta.yahoo} className="min-w-[240px] flex-shrink-0">
              <IndexCard
                meta={meta}
                data={quotes[meta.yahoo]}
                isLoading={isLoading}
                onClick={() => onCardClick(meta)}
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`text-gray-400 dark:text-gray-500 transition-transform ${
        expanded ? "rotate-90" : "rotate-0"
      }`}
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}
