"use client";

import { useEffect, useState } from "react";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const colors = ["#66e0d5", "#f7c873", "#64748b"];

export function AllocationChart({
  data,
}: {
  data: { name: string; value: number }[];
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-[240px] rounded-2xl border border-white/8 bg-white/4" />;
  }

  return (
    <div className="h-[240px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" innerRadius={56} outerRadius={86} paddingAngle={4}>
            {data.map((entry, index) => (
              <Cell key={entry.name} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => `${value ?? 0}%`}
            contentStyle={{
              background: "rgba(9, 16, 26, 0.94)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 14,
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
