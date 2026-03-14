import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function PanelList<TItem>({
  items,
  emptyState = "No items available.",
  className,
  renderItem,
}: {
  items: TItem[];
  emptyState?: ReactNode;
  className?: string;
  renderItem: (item: TItem, index: number) => ReactNode;
}) {
  if (!items.length) {
    return <div className={cn("rounded-[22px] border border-white/10 bg-white/4 p-4 text-sm text-muted-foreground", className)}>{emptyState}</div>;
  }

  return <div className={cn("space-y-3", className)}>{items.map(renderItem)}</div>;
}
