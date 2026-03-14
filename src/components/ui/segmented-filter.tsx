"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export interface SegmentedFilterOption<TValue extends string> {
  label: string;
  value: TValue;
  icon?: ReactNode;
}

export function SegmentedFilter<TValue extends string>({
  value,
  options,
  onChange,
  className,
}: {
  value: TValue;
  options: readonly SegmentedFilterOption<TValue>[];
  onChange: (value: TValue) => void;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {options.map((option) => (
        <button
          key={option.value}
          className={cn(
            "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] transition",
            value === option.value
              ? "border-primary/40 bg-primary/10 text-foreground"
              : "border-white/10 bg-white/5 text-muted-foreground",
          )}
          onClick={() => onChange(option.value)}
          type="button"
        >
          {option.icon}
          {option.label}
        </button>
      ))}
    </div>
  );
}
