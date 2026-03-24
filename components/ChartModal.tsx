"use client";

import { useState, useEffect, useCallback } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { SymbolMeta } from "@/types";
import { formatPrice } from "@/lib/formatters";

interface ChartDataPoint {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface ChartResponse {
  symbol: string;
  currency: string;
  exchangeName: string;
  regularMarketPrice: number;
  previousClose: number;
  regularMarketDayHigh: number;
  regularMarketDayLow: number;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
  regularMarketVolume: number;
  points: ChartDataPoint[];
}

interface ChartModalProps {
  meta: SymbolMeta;
  onClose: () => void;
}

const TIMEFRAMES = ["1D", "5D", "1M", "3M", "6M", "1Y", "5Y"] as const;

export function ChartModal({ meta, onClose }: ChartModalProps) {
  const [timeframe, setTimeframe] = useState<string>("1D");
  const [data, setData] = useState<ChartResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchChart = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/chart?symbol=${encodeURIComponent(meta.yahoo)}&range=${timeframe}`
      );
      if (res.ok) {
        setData(await res.json());
      }
    } catch {
      // silently fail
    }
    setLoading(false);
  }, [meta.yahoo, timeframe]);

  useEffect(() => {
    fetchChart();
  }, [fetchChart]);

  // Auto-refresh for 1D
  useEffect(() => {
    if (timeframe !== "1D") return;
    const interval = setInterval(fetchChart, 5000);
    return () => clearInterval(interval);
  }, [timeframe, fetchChart]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const points = data?.points ?? [];
  const isPositive =
    points.length >= 2
      ? points[points.length - 1].close >= points[0].close
      : true;
  const color = isPositive ? "#34d399" : "#f87171";
  const currentPrice = data?.regularMarketPrice ?? 0;
  const prevClose = data?.previousClose ?? 0;
  const change = currentPrice - prevClose;
  const changePct = prevClose !== 0 ? (change / prevClose) * 100 : 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-[#0d1117] border border-gray-200 dark:border-gray-800 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 pb-3 border-b border-gray-100 dark:border-gray-800">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {meta.displayName}
              </h2>
              <span className="text-xs font-mono text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
                {meta.yahoo}
              </span>
            </div>
            <div className="flex items-baseline gap-3 mt-1">
              <span className="text-3xl font-mono font-bold text-gray-900 dark:text-white">
                {formatPrice(currentPrice, meta)}
              </span>
              <span
                className={`text-sm font-mono font-semibold ${
                  change >= 0
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {change >= 0 ? "+" : ""}
                {change.toFixed(2)} ({change >= 0 ? "+" : ""}
                {changePct.toFixed(2)}%)
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Timeframe selector */}
        <div className="flex gap-1 px-5 pt-3">
          {TIMEFRAMES.map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1.5 text-xs font-mono font-semibold rounded-md transition-colors ${
                timeframe === tf
                  ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900"
                  : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              {tf}
            </button>
          ))}
        </div>

        {/* Chart */}
        <div className="px-5 pt-3 pb-1 h-[350px]">
          {loading ? (
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-gray-300 dark:border-gray-600 border-t-emerald-500 rounded-full animate-spin" />
            </div>
          ) : points.length === 0 ? (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              No chart data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={points}
                margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
              >
                <defs>
                  <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#1f293722"
                  vertical={false}
                />
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={(ts) => formatTimestamp(ts, timeframe)}
                  tick={{ fontSize: 11, fill: "#6b7280" }}
                  axisLine={false}
                  tickLine={false}
                  minTickGap={40}
                />
                <YAxis
                  domain={["auto", "auto"]}
                  tick={{ fontSize: 11, fill: "#6b7280" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => formatAxisPrice(v)}
                  width={65}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.[0]) return null;
                    const p = payload[0].payload as ChartDataPoint;
                    return (
                      <ChartTooltip point={p} meta={meta} timeframe={timeframe} />
                    );
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="close"
                  stroke={color}
                  strokeWidth={2}
                  fill="url(#chartGrad)"
                  dot={false}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Stats grid */}
        {data && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-gray-100 dark:bg-gray-800 border-t border-gray-100 dark:border-gray-800 rounded-b-xl overflow-hidden">
            <StatItem label="Prev Close" value={formatPrice(data.previousClose, meta)} />
            <StatItem label="Day High" value={formatPrice(data.regularMarketDayHigh, meta)} />
            <StatItem label="Day Low" value={formatPrice(data.regularMarketDayLow, meta)} />
            <StatItem
              label="Volume"
              value={formatVolume(data.regularMarketVolume)}
            />
            <StatItem label="52W High" value={formatPrice(data.fiftyTwoWeekHigh, meta)} />
            <StatItem label="52W Low" value={formatPrice(data.fiftyTwoWeekLow, meta)} />
            <StatItem label="Exchange" value={data.exchangeName || "—"} />
            <StatItem label="Currency" value={data.currency || "—"} />
          </div>
        )}
      </div>
    </div>
  );
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white dark:bg-[#0d1117] px-4 py-3">
      <p className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-0.5">
        {label}
      </p>
      <p className="text-sm font-mono text-gray-900 dark:text-white">{value}</p>
    </div>
  );
}

function ChartTooltip({
  point,
  meta,
  timeframe,
}: {
  point: ChartDataPoint;
  meta: SymbolMeta;
  timeframe: string;
}) {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-lg text-xs">
      <p className="text-gray-500 dark:text-gray-400 mb-1.5 font-mono">
        {formatTooltipTime(point.timestamp, timeframe)}
      </p>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 font-mono">
        <span className="text-gray-400">O</span>
        <span className="text-gray-900 dark:text-white text-right">
          {formatPrice(point.open, meta)}
        </span>
        <span className="text-gray-400">H</span>
        <span className="text-gray-900 dark:text-white text-right">
          {formatPrice(point.high, meta)}
        </span>
        <span className="text-gray-400">L</span>
        <span className="text-gray-900 dark:text-white text-right">
          {formatPrice(point.low, meta)}
        </span>
        <span className="text-gray-400">C</span>
        <span className="text-gray-900 dark:text-white text-right font-semibold">
          {formatPrice(point.close, meta)}
        </span>
        <span className="text-gray-400">Vol</span>
        <span className="text-gray-900 dark:text-white text-right">
          {formatVolume(point.volume)}
        </span>
      </div>
    </div>
  );
}

function formatTimestamp(ts: number, timeframe: string): string {
  const d = new Date(ts);
  if (timeframe === "1D" || timeframe === "5D") {
    return d.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Asia/Kolkata",
    });
  }
  if (timeframe === "1M" || timeframe === "3M") {
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      timeZone: "Asia/Kolkata",
    });
  }
  return d.toLocaleDateString("en-IN", {
    month: "short",
    year: "2-digit",
    timeZone: "Asia/Kolkata",
  });
}

function formatTooltipTime(ts: number, timeframe: string): string {
  const d = new Date(ts);
  if (timeframe === "1D" || timeframe === "5D") {
    return d.toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata",
    });
  }
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });
}

function formatAxisPrice(value: number): string {
  if (value >= 100000) return `${(value / 1000).toFixed(0)}K`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return value.toFixed(value < 10 ? 2 : 0);
}

function formatVolume(vol: number): string {
  if (vol >= 1e9) return `${(vol / 1e9).toFixed(2)}B`;
  if (vol >= 1e7) return `${(vol / 1e7).toFixed(2)}Cr`;
  if (vol >= 1e5) return `${(vol / 1e5).toFixed(2)}L`;
  if (vol >= 1e3) return `${(vol / 1e3).toFixed(1)}K`;
  return vol.toString();
}
