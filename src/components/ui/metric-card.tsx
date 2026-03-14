import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function MetricCard({
  label,
  value,
  hint,
  icon,
  className,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-[26px] border border-white/10 bg-[linear-gradient(180deg,rgba(16,24,36,0.96),rgba(10,16,26,0.98))] p-5 shadow-[0_16px_46px_rgba(0,0,0,0.24)]",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">{label}</p>
        {icon}
      </div>
      <p className="mt-4 text-3xl font-semibold tracking-tight text-foreground">{value}</p>
      {hint ? <p className="mt-2 text-sm text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
