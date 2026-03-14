"use client";

import { useEffect, useState } from "react";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const data = [
  { label: "W-5", score: 52 },
  { label: "W-4", score: 58 },
  { label: "W-3", score: 61 },
  { label: "W-2", score: 64 },
  { label: "W-1", score: 69 },
  { label: "Now", score: 74 },
];

export function MarketPulseChart() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-[220px] rounded-2xl border border-white/8 bg-white/4" />;
  }

  return (
    <div className="h-[220px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="pulse" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#66e0d5" stopOpacity={0.55} />
              <stop offset="100%" stopColor="#66e0d5" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
          <XAxis axisLine={false} dataKey="label" tick={{ fill: "#7b8697", fontSize: 12 }} tickLine={false} />
          <YAxis axisLine={false} tick={{ fill: "#7b8697", fontSize: 12 }} tickLine={false} width={28} />
          <Tooltip
            contentStyle={{
              background: "rgba(9, 16, 26, 0.94)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 14,
            }}
          />
          <Area dataKey="score" fill="url(#pulse)" stroke="#66e0d5" strokeWidth={2.5} type="monotone" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
