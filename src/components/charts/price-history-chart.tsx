"use client";

import { useEffect, useState } from "react";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import type { LiveMarketCandle } from "@/types";

export function PriceHistoryChart({ data }: { data: LiveMarketCandle[] }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-[260px] rounded-2xl border border-white/8 bg-white/4" />;
  }

  return (
    <div className="h-[260px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={[...data].reverse()}>
          <defs>
            <linearGradient id="priceGradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#66e0d5" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#66e0d5" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
          <XAxis dataKey="date" hide />
          <YAxis
            tick={{ fill: "rgba(203,213,225,0.7)", fontSize: 11 }}
            tickFormatter={(value) => `$${Number(value).toFixed(0)}`}
            width={48}
          />
          <Tooltip
            formatter={(value) => [`$${Number(value ?? 0).toFixed(2)}`, "Close"]}
            labelFormatter={(label) => `Date: ${label}`}
            contentStyle={{
              background: "rgba(9, 16, 26, 0.94)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 14,
            }}
          />
          <Area
            dataKey="close"
            stroke="#66e0d5"
            strokeWidth={2}
            fill="url(#priceGradient)"
            type="monotone"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
