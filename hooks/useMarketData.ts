"use client";

import { useQuery } from "@tanstack/react-query";
import { MarketDataResponse } from "@/types";

export function useMarketData() {
  return useQuery<MarketDataResponse>({
    queryKey: ["market-data"],
    queryFn: async () => {
      const res = await fetch("/api/quotes");
      if (!res.ok) throw new Error("Failed to fetch market data");
      return res.json();
    },
    refetchInterval: 1_000,
    refetchIntervalInBackground: false,
    staleTime: 500,
    retry: 2,
    retryDelay: 5000,
  });
}
