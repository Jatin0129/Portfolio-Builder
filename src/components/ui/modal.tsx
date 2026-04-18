"use client";

import type { ReactNode } from "react";

import { X } from "lucide-react";

import { cn } from "@/lib/utils";

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm">
      <button aria-label="Close modal" className="absolute inset-0" onClick={onClose} type="button" />
      <div
        className={cn(
          "relative z-10 w-full max-w-3xl panel-border bg-card",
          className,
        )}
      >
        <div className="flex items-start justify-between gap-3 border-b border-border bg-muted/40 px-3 py-2">
          <div>
            <p className="font-mono-tight text-[10px] font-semibold uppercase tracking-[0.18em] text-accent">DIALOG</p>
            <h2 className="mt-0.5 font-mono-tight text-sm font-semibold tracking-tight text-foreground">{title}</h2>
            {description ? <p className="mt-1 font-mono-tight text-[11px] text-muted-foreground">{description}</p> : null}
          </div>
          <button
            aria-label="Close"
            className="border border-border bg-muted p-1 text-muted-foreground transition hover:border-accent/40 hover:text-accent"
            onClick={onClose}
            type="button"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
        <div className="p-3">{children}</div>
      </div>
    </div>
  );
}
