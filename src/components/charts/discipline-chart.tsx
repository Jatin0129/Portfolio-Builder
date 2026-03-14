"use client";

import { useEffect, useState } from "react";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function DisciplineChart({
  data,
}: {
  data: { month: string; score: number }[];
}) {
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
        <LineChart data={data}>
          <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
          <XAxis axisLine={false} dataKey="month" tick={{ fill: "#7b8697", fontSize: 12 }} tickLine={false} />
          <YAxis axisLine={false} tick={{ fill: "#7b8697", fontSize: 12 }} tickLine={false} width={28} />
          <Tooltip
            contentStyle={{
              background: "rgba(9, 16, 26, 0.94)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 14,
            }}
          />
          <Line dataKey="score" dot={{ fill: "#66e0d5", strokeWidth: 0 }} stroke="#66e0d5" strokeWidth={2.5} type="monotone" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
