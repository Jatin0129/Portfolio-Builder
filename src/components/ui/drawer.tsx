"use client";

import type { ReactNode } from "react";

import { X } from "lucide-react";

import { cn } from "@/lib/utils";

export function Drawer({
  open,
  onClose,
  title,
  description,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/80 backdrop-blur-md">
      <button
        aria-label="Close drawer"
        className="flex-1 cursor-default"
        onClick={onClose}
        type="button"
      />
      <div
        className={cn(
          "h-full w-full max-w-[760px] overflow-y-auto border-l border-white/10 bg-[linear-gradient(180deg,rgba(12,18,28,0.98),rgba(8,12,20,0.98))] p-7 shadow-[0_20px_120px_rgba(0,0,0,0.48)]",
        )}
      >
        <div className="mb-6 flex items-start justify-between gap-4 border-b border-white/8 pb-5">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-primary">Drilldown</p>
            <h2 className="mt-2 text-2xl font-semibold text-foreground">{title}</h2>
            {description ? <p className="mt-2 text-sm text-muted-foreground">{description}</p> : null}
          </div>
          <button
            aria-label="Close"
            className="rounded-full border border-white/10 bg-white/5 p-2 text-muted-foreground transition hover:border-white/20 hover:text-foreground"
            onClick={onClose}
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
