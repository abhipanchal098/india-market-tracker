"use client";

import { useState } from "react";
import { useMarketData } from "@/hooks/useMarketData";
import { MarketHeader } from "@/components/MarketHeader";
import { CategorySection } from "@/components/CategorySection";
import { ChartModal } from "@/components/ChartModal";
import { CATEGORIES, getSymbolsByCategory } from "@/lib/symbols";
import { SymbolMeta } from "@/types";

export default function DashboardPage() {
  const { data, isLoading, error } = useMarketData();
  const [selectedSymbol, setSelectedSymbol] = useState<SymbolMeta | null>(null);

  return (
    <div className="min-h-screen">
      <MarketHeader lastUpdated={data?.timestamp} />

      <main className="max-w-7xl mx-auto px-4 py-6">
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 dark:text-red-400 text-sm font-mono">
            Failed to fetch market data. Retrying...
          </div>
        )}

        {CATEGORIES.map((category) => (
          <CategorySection
            key={category}
            category={category}
            symbols={getSymbolsByCategory(category)}
            quotes={data?.quotes ?? {}}
            isLoading={isLoading}
            onCardClick={setSelectedSymbol}
          />
        ))}

        <footer className="mt-8 pb-4 text-center text-xs text-gray-400 dark:text-gray-600 font-mono">
          Data sourced from Yahoo Finance. Prices may be delayed.
          <br />
          Auto-refreshes every second.
        </footer>
      </main>

      {selectedSymbol && (
        <ChartModal
          meta={selectedSymbol}
          onClose={() => setSelectedSymbol(null)}
        />
      )}
    </div>
  );
}
