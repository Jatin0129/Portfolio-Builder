import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

const variants = {
  primary: "border border-accent/60 bg-accent/15 text-accent hover:bg-accent/25",
  secondary: "border border-border bg-muted text-foreground hover:border-accent/40 hover:text-accent",
  ghost: "border border-transparent bg-transparent text-muted-foreground hover:text-accent",
  danger: "border border-danger/50 bg-danger/10 text-danger hover:bg-danger/20",
};

export function Button({
  className,
  variant = "primary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: keyof typeof variants }) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-sm px-2.5 py-1 font-mono-tight text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors disabled:pointer-events-none disabled:opacity-40",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
