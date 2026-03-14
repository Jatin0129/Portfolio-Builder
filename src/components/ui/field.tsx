import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

export const fieldControlClassName =
  "w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary/35";

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
    <label className={cn("space-y-2", className)}>
      <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</span>
      {children}
      {description ? <span className="block text-xs text-muted-foreground">{description}</span> : null}
    </label>
  );
}

export function FieldGroup({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("grid gap-4 md:grid-cols-2", className)} {...props} />;
}
