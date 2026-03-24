import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const YF_BASE = "https://query1.finance.yahoo.com";
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

const RANGE_CONFIG: Record<string, { range: string; interval: string }> = {
  "1D": { range: "1d", interval: "5m" },
  "5D": { range: "5d", interval: "15m" },
  "1M": { range: "1mo", interval: "1h" },
  "3M": { range: "3mo", interval: "1d" },
  "6M": { range: "6mo", interval: "1d" },
  "1Y": { range: "1y", interval: "1d" },
  "5Y": { range: "5y", interval: "1wk" },
};

export interface ChartDataPoint {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export async function GET(req: NextRequest) {
  const symbol = req.nextUrl.searchParams.get("symbol");
  const range = req.nextUrl.searchParams.get("range") || "1D";

  if (!symbol) {
    return NextResponse.json({ error: "Symbol required" }, { status: 400 });
  }

  const config = RANGE_CONFIG[range] || RANGE_CONFIG["1D"];

  try {
    const url = `${YF_BASE}/v8/finance/chart/${encodeURIComponent(symbol)}?range=${config.range}&interval=${config.interval}&includePrePost=false`;
    const res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT },
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Yahoo returned ${res.status}` },
        { status: 502 }
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = await res.json();
    const result = data.chart?.result?.[0];
    if (!result) {
      return NextResponse.json({ error: "No data" }, { status: 404 });
    }

    const timestamps: number[] = result.timestamp || [];
    const quote = result.indicators?.quote?.[0] || {};
    const meta = result.meta || {};

    const points: ChartDataPoint[] = timestamps
      .map((ts: number, i: number) => ({
        timestamp: ts * 1000,
        open: quote.open?.[i] ?? 0,
        high: quote.high?.[i] ?? 0,
        low: quote.low?.[i] ?? 0,
        close: quote.close?.[i] ?? 0,
        volume: quote.volume?.[i] ?? 0,
      }))
      .filter((p: ChartDataPoint) => p.close > 0);

    return NextResponse.json({
      symbol: meta.symbol ?? symbol,
      currency: meta.currency ?? "USD",
      exchangeName: meta.exchangeName ?? "",
      regularMarketPrice: meta.regularMarketPrice ?? 0,
      previousClose: meta.chartPreviousClose ?? meta.previousClose ?? 0,
      regularMarketDayHigh: meta.regularMarketDayHigh ?? 0,
      regularMarketDayLow: meta.regularMarketDayLow ?? 0,
      fiftyTwoWeekHigh: meta.fiftyTwoWeekHigh ?? 0,
      fiftyTwoWeekLow: meta.fiftyTwoWeekLow ?? 0,
      regularMarketVolume: meta.regularMarketVolume ?? 0,
      points,
    });
  } catch (e) {
    console.error("Chart fetch error:", e);
    return NextResponse.json(
      { error: "Failed to fetch chart data" },
      { status: 500 }
    );
  }
}
