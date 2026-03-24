import { NextResponse } from "next/server";
import { getAllYahooSymbols, getSymbolMeta } from "@/lib/symbols";
import { getMarketStatus } from "@/lib/formatters";
import { QuoteData, MarketDataResponse } from "@/types";

export const dynamic = "force-dynamic";

const YF_BASE = "https://query1.finance.yahoo.com";
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fetchQuote(symbol: string): Promise<QuoteData | null> {
  try {
    // Use range=5d&interval=1d for sparkline + previous close derivation
    const url = `${YF_BASE}/v8/finance/chart/${encodeURIComponent(symbol)}?range=5d&interval=1d&includePrePost=false`;
    const res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT },
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      console.error(`Yahoo ${symbol}: ${res.status} ${res.statusText}`);
      return null;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = await res.json();
    const result = data.chart?.result?.[0];
    if (!result?.meta) return null;

    const meta = result.meta;
    const closes: number[] =
      result.indicators?.quote?.[0]?.close?.filter(
        (v: number | null): v is number => v != null
      ) ?? [];

    const currentPrice: number = meta.regularMarketPrice ?? 0;
    const chartPrevClose: number = meta.chartPreviousClose ?? 0;

    // previousClose from meta is the close before the chart range starts
    // For a 5d range, chartPreviousClose = close the day before the range
    // We want yesterday's close: second-to-last value in closes array
    // OR if closes has today's candle already, the one before it
    let previousClose: number;
    if (closes.length >= 2) {
      // Last close in array may be today's close (if market is open) or the latest trading day
      // Second-to-last is yesterday's close
      previousClose = closes[closes.length - 2];
    } else if (chartPrevClose > 0) {
      previousClose = chartPrevClose;
    } else {
      previousClose = meta.previousClose ?? currentPrice;
    }

    const change = currentPrice - previousClose;
    const changePercent =
      previousClose !== 0 ? (change / previousClose) * 100 : 0;

    return {
      symbol: meta.symbol ?? symbol,
      price: currentPrice,
      change,
      changePercent,
      previousClose,
      high: meta.regularMarketDayHigh ?? 0,
      low: meta.regularMarketDayLow ?? 0,
      marketState: meta.marketState ?? "REGULAR",
      sparklineData: closes,
    };
  } catch (e) {
    console.error(`Failed to fetch ${symbol}:`, e);
    return null;
  }
}

export async function GET() {
  try {
    const symbols = getAllYahooSymbols();

    // Fetch all in parallel — each is a lightweight HTTP call, no crumb needed
    const results = await Promise.all(symbols.map(fetchQuote));

    const quotes: Record<string, QuoteData> = {};

    results.forEach((result, i) => {
      const symbol = symbols[i];
      const meta = getSymbolMeta(symbol);
      if (!meta) return;

      if (result) {
        quotes[symbol] = result;
      } else {
        quotes[symbol] = {
          symbol,
          price: 0,
          change: 0,
          changePercent: 0,
          previousClose: 0,
          high: 0,
          low: 0,
          marketState: "CLOSED",
          sparklineData: [],
          error: "Data unavailable",
        };
      }
    });

    const response: MarketDataResponse = {
      quotes,
      timestamp: Date.now(),
      marketStatus: getMarketStatus(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Failed to fetch market data:", error);
    return NextResponse.json(
      { error: "Failed to fetch market data", details: String(error) },
      { status: 500 }
    );
  }
}
