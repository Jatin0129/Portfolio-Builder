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
    <div className={cn("flex flex-col gap-4 md:flex-row md:items-end md:justify-between", className)}>
      <div className="space-y-3">
        {eyebrow ? <p className="text-[11px] uppercase tracking-[0.32em] text-primary">{eyebrow}</p> : null}
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-[2rem]">{title}</h1>
          {description ? <p className="max-w-3xl text-sm leading-6 text-muted-foreground">{description}</p> : null}
        </div>
      </div>
      {action}
    </div>
  );
}
