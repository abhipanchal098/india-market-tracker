"use client";

import { useMarketData } from "@/hooks/useMarketData";
import { MarketHeader } from "@/components/MarketHeader";
import { CategorySection } from "@/components/CategorySection";
import { CATEGORIES, getSymbolsByCategory } from "@/lib/symbols";

export default function DashboardPage() {
  const { data, isLoading, error } = useMarketData();

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
          />
        ))}

        <footer className="mt-8 pb-4 text-center text-xs text-gray-400 dark:text-gray-600 font-mono">
          Data sourced from Yahoo Finance. Prices may be delayed.
          <br />
          Auto-refreshes every 60 seconds.
        </footer>
      </main>
    </div>
  );
}
