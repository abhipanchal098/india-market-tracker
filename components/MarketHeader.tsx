"use client";

import { useEffect, useState } from "react";
import { MarketStatus } from "@/types";
import { getMarketStatus, getISTTime, getISTDate } from "@/lib/formatters";
import { ThemeToggle } from "./ThemeToggle";

interface MarketHeaderProps {
  lastUpdated?: number;
}

export function MarketHeader({ lastUpdated }: MarketHeaderProps) {
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");
  const [status, setStatus] = useState<MarketStatus>("closed");

  useEffect(() => {
    function tick() {
      setTime(getISTTime());
      setDate(getISTDate());
      setStatus(getMarketStatus());
    }
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  const statusConfig: Record<
    MarketStatus,
    { label: string; dotClass: string; textClass: string }
  > = {
    open: {
      label: "Market Open",
      dotClass: "bg-emerald-400 animate-pulse",
      textClass: "text-emerald-600 dark:text-emerald-400",
    },
    "pre-open": {
      label: "Pre-Open",
      dotClass: "bg-yellow-400 animate-pulse",
      textClass: "text-yellow-600 dark:text-yellow-400",
    },
    closed: {
      label: "Market Closed",
      dotClass: "bg-gray-400 dark:bg-gray-500",
      textClass: "text-gray-500",
    },
  };

  const { label, dotClass, textClass } = statusConfig[status];

  return (
    <header className="border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/50 backdrop-blur-sm sticky top-0 z-10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
            India Market Tracker
          </h1>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${dotClass}`} />
            <span className={`text-sm font-mono ${textClass}`}>{label}</span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm">
          {lastUpdated && (
            <span className="text-gray-400 dark:text-gray-500 font-mono hidden sm:inline">
              Updated:{" "}
              {new Date(lastUpdated).toLocaleTimeString("en-IN", {
                timeZone: "Asia/Kolkata",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </span>
          )}
          <div className="text-right hidden sm:block">
            <div className="text-gray-900 dark:text-white font-mono">{time}</div>
            <div className="text-gray-400 dark:text-gray-500 text-xs">{date} IST</div>
          </div>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
