import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

export const fieldControlClassName =
  "w-full rounded-sm border border-border bg-muted/40 px-2 py-1 font-mono-tight text-[12px] text-foreground outline-none transition focus:border-accent/60 focus:bg-card";

export function Field({
  label,
  description,
  className,
  children,
}: HTMLAttributes<HTMLLabelElement> & {
  label: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <label className={cn("space-y-1", className)}>
      <span className="font-mono-tight text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{label}</span>
      {children}
      {description ? <span className="block font-mono-tight text-[10px] text-muted-foreground">{description}</span> : null}
    </label>
  );
}

export function FieldGroup({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("grid gap-2 md:grid-cols-2", className)} {...props} />;
}
