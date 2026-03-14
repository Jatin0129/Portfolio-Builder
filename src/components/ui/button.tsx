import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

const variants = {
  primary: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_12px_30px_rgba(72,196,217,0.18)]",
  secondary: "border border-white/10 bg-white/8 text-foreground hover:bg-white/12",
  ghost: "bg-transparent text-muted-foreground hover:bg-white/6 hover:text-foreground",
};

export function Button({
  className,
  variant = "primary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: keyof typeof variants }) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-2xl px-4 py-2.5 text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
