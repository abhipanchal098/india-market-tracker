export type Category =
  | "indian-indices"
  | "commodities"
  | "currencies"
  | "global-indices"
  | "crypto";

export interface SymbolMeta {
  yahoo: string;
  displayName: string;
  shortName: string;
  category: Category;
  currency: string;
  currencySymbol: string;
  formatStyle: "indian" | "international";
  decimals: number;
  isVix?: boolean;
}

export interface QuoteData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  previousClose: number;
  high: number;
  low: number;
  marketState: string;
  sparklineData: number[];
  error?: string;
}

export type MarketStatus = "pre-open" | "open" | "closed";

export interface MarketDataResponse {
  quotes: Record<string, QuoteData>;
  timestamp: number;
  marketStatus: MarketStatus;
}
