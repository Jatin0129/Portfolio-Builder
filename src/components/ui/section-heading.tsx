import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center justify-between gap-3 border-b border-border bg-card px-3 py-2", className)}>
      <div className="min-w-0">
        <div className="flex items-baseline gap-2">
          {eyebrow && (
            <p className="font-mono-tight text-[10px] font-semibold uppercase tracking-[0.18em] text-accent">
              {eyebrow}
            </p>
          )}
          <h1 className="font-mono-tight text-sm font-semibold tracking-tight text-foreground">
            {title}
          </h1>
        </div>
        {description && (
          <p className="mt-0.5 truncate font-mono-tight text-[10px] text-muted-foreground">{description}</p>
        )}
      </div>
      {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
    </div>
  );
}
