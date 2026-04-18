import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function MetricCard({
  label,
  value,
  hint,
  icon,
  tone,
  className,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  icon?: ReactNode;
  tone?: "pos" | "neg" | "neutral";
  className?: string;
}) {
  const valueColor =
    tone === "pos" ? "text-success" : tone === "neg" ? "text-danger" : "text-foreground";
  return (
    <div
      className={cn(
        "panel-border bg-card px-3 py-2",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
        {icon}
      </div>
      <p className={cn("mt-1 font-mono-tight text-2xl font-semibold tabular-nums", valueColor)}>{value}</p>
      {hint ? <p className="mt-0.5 text-[11px] text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
