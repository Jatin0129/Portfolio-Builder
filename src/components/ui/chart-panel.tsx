import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function ChartPanel({
  title,
  description,
  legend,
  children,
  className,
}: {
  title: string;
  description?: string;
  legend?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-[24px] border border-white/10 bg-white/4 p-4", className)}>
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-foreground">{title}</p>
          {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
        </div>
        {legend}
      </div>
      {children}
    </div>
  );
}
