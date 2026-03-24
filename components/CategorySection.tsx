"use client";

import { Category, SymbolMeta, QuoteData } from "@/types";
import { CATEGORY_LABELS } from "@/lib/symbols";
import { IndexCard } from "./IndexCard";

interface CategorySectionProps {
  category: Category;
  symbols: SymbolMeta[];
  quotes: Record<string, QuoteData>;
  isLoading: boolean;
}

export function CategorySection({
  category,
  symbols,
  quotes,
  isLoading,
}: CategorySectionProps) {
  return (
    <section className="mb-6">
      <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 px-1">
        {CATEGORY_LABELS[category]}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {symbols.map((meta) => (
          <IndexCard
            key={meta.yahoo}
            meta={meta}
            data={quotes[meta.yahoo]}
            isLoading={isLoading}
          />
        ))}
      </div>
    </section>
  );
}
