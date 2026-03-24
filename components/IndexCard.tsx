"use client";

import { SymbolMeta, QuoteData } from "@/types";
import { formatPrice, formatChange, formatCompactPrice } from "@/lib/formatters";
import { MiniSparkline } from "./MiniSparkline";

interface IndexCardProps {
  meta: SymbolMeta;
  data?: QuoteData;
  isLoading: boolean;
}

export function IndexCard({ meta, data, isLoading }: IndexCardProps) {
  if (isLoading) {
    return (
      <div className="bg-gray-100 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-800 rounded-lg p-4 animate-pulse">
        <div className="flex justify-between items-start mb-3">
          <div className="h-4 w-20 bg-gray-300 dark:bg-gray-700 rounded" />
          <div className="h-10 w-20 bg-gray-300 dark:bg-gray-700 rounded" />
        </div>
        <div className="h-7 w-28 bg-gray-300 dark:bg-gray-700 rounded mb-2" />
        <div className="h-4 w-36 bg-gray-300 dark:bg-gray-700 rounded mb-2" />
        <div className="h-3 w-32 bg-gray-300 dark:bg-gray-700 rounded" />
      </div>
    );
  }

  if (!data || data.error) {
    return (
      <div className="bg-gray-100/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-lg p-4 opacity-50">
        <div className="flex justify-between items-start mb-3">
          <span className="text-xs font-mono uppercase tracking-wider text-gray-400 dark:text-gray-500">
            {meta.shortName}
          </span>
        </div>
        <p className="text-lg font-mono text-gray-400 dark:text-gray-600">{meta.displayName}</p>
        <p className="text-sm text-gray-400 dark:text-gray-600">Data unavailable</p>
      </div>
    );
  }

  const { text: changeText, colorClass } = formatChange(
    data.change,
    data.changePercent
  );
  const isPositive = data.change >= 0;

  return (
    <div className="bg-gray-50 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-800 rounded-lg p-4 hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs font-mono uppercase tracking-wider text-gray-500 dark:text-gray-400">
          {meta.shortName}
        </span>
        <MiniSparkline data={data.sparklineData} isPositive={isPositive} />
      </div>

      <p className="text-xl font-mono font-bold text-gray-900 dark:text-white mb-1">
        {formatPrice(data.price, meta)}
      </p>

      <div className="flex items-center justify-between mb-2">
        <span className={`text-sm font-mono ${colorClass}`}>{changeText}</span>
        <MarketStateBadge state={data.marketState} />
      </div>

      <div className="flex gap-4 text-xs text-gray-400 dark:text-gray-500 font-mono">
        <span>H: {formatCompactPrice(data.high, meta)}</span>
        <span>L: {formatCompactPrice(data.low, meta)}</span>
      </div>
    </div>
  );
}

function MarketStateBadge({ state }: { state: string }) {
  const config: Record<string, { label: string; className: string }> = {
    REGULAR: { label: "OPEN", className: "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400" },
    PRE: { label: "PRE", className: "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400" },
    POST: { label: "POST", className: "bg-blue-500/20 text-blue-600 dark:text-blue-400" },
    PREPRE: { label: "PRE", className: "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400" },
    POSTPOST: { label: "CLOSED", className: "bg-gray-500/20 text-gray-500 dark:text-gray-400" },
    CLOSED: { label: "CLOSED", className: "bg-gray-500/20 text-gray-500 dark:text-gray-400" },
  };

  const { label, className } = config[state] || config.CLOSED;

  return (
    <span
      className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${className}`}
    >
      {label}
    </span>
  );
}
