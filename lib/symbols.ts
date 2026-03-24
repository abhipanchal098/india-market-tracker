import { Category, SymbolMeta } from "@/types";

export const SYMBOLS: SymbolMeta[] = [
  // Indian Indices
  {
    yahoo: "^NSEI",
    displayName: "Nifty 50",
    shortName: "NIFTY",
    category: "indian-indices",
    currency: "INR",
    currencySymbol: "₹",
    formatStyle: "indian",
    decimals: 2,
  },
  {
    yahoo: "^BSESN",
    displayName: "Sensex",
    shortName: "SENSEX",
    category: "indian-indices",
    currency: "INR",
    currencySymbol: "₹",
    formatStyle: "indian",
    decimals: 2,
  },
  {
    yahoo: "^NSEBANK",
    displayName: "Bank Nifty",
    shortName: "BANKNIFTY",
    category: "indian-indices",
    currency: "INR",
    currencySymbol: "₹",
    formatStyle: "indian",
    decimals: 2,
  },
  {
    yahoo: "^CNXIT",
    displayName: "Nifty IT",
    shortName: "NIFTYIT",
    category: "indian-indices",
    currency: "INR",
    currencySymbol: "₹",
    formatStyle: "indian",
    decimals: 2,
  },
  {
    yahoo: "NIFTY_MIDCAP_100.NS",
    displayName: "Nifty Midcap 100",
    shortName: "MIDCAP",
    category: "indian-indices",
    currency: "INR",
    currencySymbol: "₹",
    formatStyle: "indian",
    decimals: 2,
  },
  {
    yahoo: "NIFTYSMLCAP250.NS",
    displayName: "Nifty Smallcap 250",
    shortName: "SMALLCAP250",
    category: "indian-indices",
    currency: "INR",
    currencySymbol: "₹",
    formatStyle: "indian",
    decimals: 2,
  },
  {
    yahoo: "GIFT_NIFTY",
    displayName: "Gift Nifty",
    shortName: "GIFTNIFTY",
    category: "indian-indices",
    currency: "INR",
    currencySymbol: "₹",
    formatStyle: "indian",
    decimals: 2,
  },
  {
    yahoo: "^INDIAVIX",
    displayName: "India VIX",
    shortName: "VIX",
    category: "indian-indices",
    currency: "INR",
    currencySymbol: "",
    formatStyle: "indian",
    decimals: 2,
    isVix: true,
  },

  // Commodities
  {
    yahoo: "CL=F",
    displayName: "Crude Oil WTI",
    shortName: "WTI",
    category: "commodities",
    currency: "USD",
    currencySymbol: "$",
    formatStyle: "international",
    decimals: 2,
  },
  {
    yahoo: "BZ=F",
    displayName: "Brent Crude",
    shortName: "BRENT",
    category: "commodities",
    currency: "USD",
    currencySymbol: "$",
    formatStyle: "international",
    decimals: 2,
  },
  {
    yahoo: "GC=F",
    displayName: "Gold",
    shortName: "GOLD",
    category: "commodities",
    currency: "USD",
    currencySymbol: "$",
    formatStyle: "international",
    decimals: 2,
  },
  {
    yahoo: "SI=F",
    displayName: "Silver",
    shortName: "SILVER",
    category: "commodities",
    currency: "USD",
    currencySymbol: "$",
    formatStyle: "international",
    decimals: 2,
  },
  {
    yahoo: "NG=F",
    displayName: "Natural Gas",
    shortName: "NATGAS",
    category: "commodities",
    currency: "USD",
    currencySymbol: "$",
    formatStyle: "international",
    decimals: 3,
  },

  // Currencies
  {
    yahoo: "USDINR=X",
    displayName: "USD/INR",
    shortName: "USD/INR",
    category: "currencies",
    currency: "INR",
    currencySymbol: "₹",
    formatStyle: "indian",
    decimals: 4,
  },
  {
    yahoo: "EURINR=X",
    displayName: "EUR/INR",
    shortName: "EUR/INR",
    category: "currencies",
    currency: "INR",
    currencySymbol: "₹",
    formatStyle: "indian",
    decimals: 4,
  },
  {
    yahoo: "GBPINR=X",
    displayName: "GBP/INR",
    shortName: "GBP/INR",
    category: "currencies",
    currency: "INR",
    currencySymbol: "₹",
    formatStyle: "indian",
    decimals: 4,
  },

  // Global Indices
  {
    yahoo: "^DJI",
    displayName: "Dow Jones",
    shortName: "DOW",
    category: "global-indices",
    currency: "USD",
    currencySymbol: "$",
    formatStyle: "international",
    decimals: 2,
  },
  {
    yahoo: "^GSPC",
    displayName: "S&P 500",
    shortName: "S&P500",
    category: "global-indices",
    currency: "USD",
    currencySymbol: "$",
    formatStyle: "international",
    decimals: 2,
  },
  {
    yahoo: "^IXIC",
    displayName: "NASDAQ",
    shortName: "NASDAQ",
    category: "global-indices",
    currency: "USD",
    currencySymbol: "$",
    formatStyle: "international",
    decimals: 2,
  },
  {
    yahoo: "^N225",
    displayName: "Nikkei 225",
    shortName: "NIKKEI",
    category: "global-indices",
    currency: "JPY",
    currencySymbol: "¥",
    formatStyle: "international",
    decimals: 2,
  },
  {
    yahoo: "^HSI",
    displayName: "Hang Seng",
    shortName: "HSI",
    category: "global-indices",
    currency: "HKD",
    currencySymbol: "HK$",
    formatStyle: "international",
    decimals: 2,
  },

  // Crypto
  {
    yahoo: "BTC-USD",
    displayName: "Bitcoin",
    shortName: "BTC",
    category: "crypto",
    currency: "USD",
    currencySymbol: "$",
    formatStyle: "international",
    decimals: 2,
  },
];

export const CATEGORY_LABELS: Record<Category, string> = {
  "indian-indices": "Indian Indices",
  commodities: "Commodities",
  currencies: "Currencies",
  "global-indices": "Global Indices",
  crypto: "Crypto",
};

export const CATEGORIES: Category[] = [
  "indian-indices",
  "commodities",
  "currencies",
  "global-indices",
  "crypto",
];

export function getSymbolsByCategory(category: Category): SymbolMeta[] {
  return SYMBOLS.filter((s) => s.category === category);
}

export function getAllYahooSymbols(): string[] {
  return SYMBOLS.map((s) => s.yahoo);
}

export function getSymbolMeta(yahoo: string): SymbolMeta | undefined {
  return SYMBOLS.find((s) => s.yahoo === yahoo);
}
