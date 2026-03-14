"use client";

import { useEffect, useState } from "react";

import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";

import type { FactorScore } from "@/types";

export function FactorRadarChart({ factors }: { factors: FactorScore[] }) {
  const [mounted, setMounted] = useState(false);
  const data = factors.map((factor) => ({
    subject: factor.label,
    score: factor.score,
  }));

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-[280px] rounded-2xl border border-white/8 bg-white/4" />;
  }

  return (
    <div className="h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" data={data} outerRadius="74%">
          <PolarGrid stroke="rgba(255,255,255,0.1)" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: "#94a3b8", fontSize: 11 }} />
          <Radar dataKey="score" fill="#66e0d5" fillOpacity={0.22} stroke="#66e0d5" strokeWidth={2} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
