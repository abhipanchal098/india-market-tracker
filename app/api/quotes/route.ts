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
  if (symbol === "GIFT_NIFTY") {
    return fetchGiftNifty();
  }

  try {
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

    let previousClose: number;
    if (closes.length >= 2) {
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

async function fetchGiftNifty(): Promise<QuoteData | null> {
  // Try multiple sources in order

  // Source 1: Groww API (internal endpoint)
  try {
    const res = await fetch(
      "https://groww.in/v1/api/stocks_fo_data/v1/charting_service/chart/exchange/NSE_IX/segment/FNO_CURRENCY/GIFTNIFTY25MARFUT?endTimeInMillis=" +
        Date.now() +
        "&intervalInMinutes=1&startTimeInMillis=" +
        (Date.now() - 86400000),
      {
        headers: {
          "User-Agent": USER_AGENT,
          Accept: "application/json",
        },
        next: { revalidate: 0 },
      }
    );
    if (res.ok) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data: any = await res.json();
      if (data?.candles?.length > 0) {
        const candles = data.candles;
        const latest = candles[candles.length - 1];
        const firstCandle = candles[0];
        const price = latest[4]; // close
        const prevClose = firstCandle[1]; // open of first candle as proxy
        const change = price - prevClose;
        const changePercent = prevClose !== 0 ? (change / prevClose) * 100 : 0;
        const sparkline = candles
          .filter((_: unknown, i: number) => i % 10 === 0)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((c: any) => c[4])
          .filter((v: number) => v > 0);

        return {
          symbol: "GIFT_NIFTY",
          price,
          change,
          changePercent,
          previousClose: prevClose,
          high: Math.max(...candles.map((c: number[]) => c[2])),
          low: Math.min(...candles.map((c: number[]) => c[3]).filter((v: number) => v > 0)),
          marketState: "REGULAR",
          sparklineData: sparkline,
        };
      }
    }
  } catch {
    // continue to next source
  }

  // Source 2: Scrape from Google Finance
  try {
    const res = await fetch(
      "https://www.google.com/finance/quote/NIFTY_50:INDEXNSE",
      {
        headers: {
          "User-Agent": USER_AGENT,
          "Accept-Language": "en-US,en;q=0.9",
        },
        next: { revalidate: 0 },
      }
    );

    if (res.ok) {
      const html = await res.text();
      const priceMatch = html.match(/data-last-price="([0-9.]+)"/);
      const prevCloseMatch = html.match(/data-previous-close="([0-9.]+)"/);

      if (priceMatch) {
        const price = parseFloat(priceMatch[1]);
        const prevClose = prevCloseMatch
          ? parseFloat(prevCloseMatch[1])
          : price;
        const change = price - prevClose;
        const changePercent =
          prevClose !== 0 ? (change / prevClose) * 100 : 0;

        return {
          symbol: "GIFT_NIFTY",
          price,
          change,
          changePercent,
          previousClose: prevClose,
          high: 0,
          low: 0,
          marketState: "REGULAR",
          sparklineData: [],
        };
      }
    }
  } catch {
    // continue to next source
  }

  // Source 3: Scrape from moneycontrol
  try {
    const res = await fetch(
      "https://www.moneycontrol.com/indian-indices/gift-nifty-24.html",
      {
        headers: {
          "User-Agent": USER_AGENT,
          "Accept-Language": "en-US,en;q=0.9",
        },
        next: { revalidate: 0 },
      }
    );

    if (res.ok) {
      const html = await res.text();
      // Moneycontrol uses spans with specific IDs or classes for price data
      const priceMatch = html.match(
        /id="giftniftyvalue"[^>]*>([0-9,]+\.?\d*)/
      );
      const changeMatch = html.match(
        /id="giftniftychange"[^>]*>([+-]?[0-9,]+\.?\d*)/
      );
      const pctMatch = html.match(
        /id="giftniftypercent"[^>]*>\(?([+-]?[0-9.]+)%?\)?/
      );

      if (priceMatch) {
        const price = parseFloat(priceMatch[1].replace(/,/g, ""));
        const change = changeMatch
          ? parseFloat(changeMatch[1].replace(/,/g, ""))
          : 0;
        const changePercent = pctMatch ? parseFloat(pctMatch[1]) : 0;

        return {
          symbol: "GIFT_NIFTY",
          price,
          change,
          changePercent,
          previousClose: price - change,
          high: 0,
          low: 0,
          marketState: "REGULAR",
          sparklineData: [],
        };
      }
    }
  } catch {
    // all sources failed
  }

  console.error("Gift Nifty: all data sources failed");
  return null;
}

export async function GET() {
  try {
    const symbols = getAllYahooSymbols();

    // Fetch all in parallel
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
