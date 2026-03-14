import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

const variants = {
  neutral: "border-white/10 bg-white/[0.05] text-foreground",
  success: "border-emerald-500/25 bg-emerald-500/12 text-emerald-300",
  warning: "border-amber-500/25 bg-amber-500/12 text-amber-300",
  danger: "border-rose-500/25 bg-rose-500/12 text-rose-300",
  info: "border-cyan-500/25 bg-cyan-500/12 text-cyan-300",
};

export function Badge({
  className,
  variant = "neutral",
  ...props
}: HTMLAttributes<HTMLDivElement> & { variant?: keyof typeof variants }) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
