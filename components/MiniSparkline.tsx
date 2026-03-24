"use client";

import { LineChart, Line, ResponsiveContainer } from "recharts";

interface MiniSparklineProps {
  data: number[];
  isPositive: boolean;
}

export function MiniSparkline({ data, isPositive }: MiniSparklineProps) {
  if (data.length < 2) {
    return <div className="w-20 h-10" />;
  }

  const chartData = data.map((value) => ({ value }));
  const color = isPositive ? "#34d399" : "#f87171";

  return (
    <div className="w-20 h-10">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
