import { MarketStatus, SymbolMeta } from "@/types";

export function formatPrice(value: number, meta: SymbolMeta): string {
  if (meta.isVix) {
    return value.toFixed(meta.decimals);
  }

  const locale = meta.formatStyle === "indian" ? "en-IN" : "en-US";
  const formatted = new Intl.NumberFormat(locale, {
    minimumFractionDigits: meta.decimals,
    maximumFractionDigits: meta.decimals,
  }).format(value);

  return `${meta.currencySymbol}${formatted}`;
}

export function formatChange(
  change: number,
  changePercent: number
): { text: string; colorClass: string } {
  const sign = change >= 0 ? "+" : "";
  const text = `${sign}${change.toFixed(2)} (${sign}${changePercent.toFixed(2)}%)`;
  const colorClass = change >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400";
  return { text, colorClass };
}

export function formatCompactPrice(value: number, meta: SymbolMeta): string {
  const locale = meta.formatStyle === "indian" ? "en-IN" : "en-US";
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function getMarketStatus(): MarketStatus {
  const now = new Date();
  const istString = now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
  const ist = new Date(istString);
  const day = ist.getDay();
  const minutes = ist.getHours() * 60 + ist.getMinutes();

  // Weekend
  if (day === 0 || day === 6) return "closed";

  // Pre-open: 9:00 - 9:15
  if (minutes >= 540 && minutes < 555) return "pre-open";

  // Market open: 9:15 - 15:30
  if (minutes >= 555 && minutes <= 930) return "open";

  return "closed";
}

export function getISTTime(): string {
  return new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
}

export function getISTDate(): string {
  return new Date().toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
