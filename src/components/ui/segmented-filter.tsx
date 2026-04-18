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
    <div className={cn("flex flex-wrap panel-border", className)}>
      {options.map((option, idx) => (
        <button
          key={option.value}
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1 font-mono-tight text-[10px] font-semibold uppercase tracking-[0.14em] transition-colors",
            idx > 0 ? "border-l border-border" : "",
            value === option.value
              ? "bg-accent/15 text-accent"
              : "bg-card text-muted-foreground hover:bg-muted hover:text-foreground",
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
