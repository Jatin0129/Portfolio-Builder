"use client";

import { useState, type ReactNode } from "react";
import { Terminal } from "lucide-react";

import { CommandPalette } from "@/components/command/command-palette";
import { JarvisDock } from "@/components/jarvis/jarvis-dock";
import { IconRail } from "@/components/layout/icon-rail";
import { TopBar } from "@/components/layout/top-bar";
import { cn } from "@/lib/utils";

export function AppShell({ children }: { children: ReactNode }) {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [dockOpen, setDockOpen] = useState(true);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen flex-col gap-1 p-1">
        <TopBar onOpenPalette={() => setPaletteOpen(true)} />
        <div
          className={cn(
            "grid flex-1 gap-1",
            dockOpen
              ? "lg:grid-cols-[60px_minmax(0,1fr)_360px]"
              : "lg:grid-cols-[60px_minmax(0,1fr)]",
          )}
        >
          <IconRail />
          <main className="min-h-[calc(100vh-100px)] panel-border bg-background overflow-x-hidden p-2">
            {children}
          </main>
          {dockOpen && (
            <div className="hidden lg:block">
              <JarvisDock onCollapse={() => setDockOpen(false)} />
            </div>
          )}
        </div>
      </div>

      {!dockOpen && (
        <button
          aria-label="Open Jarvis"
          className="fixed right-2 top-1/2 z-40 hidden h-10 w-10 -translate-y-1/2 items-center justify-center border border-accent/40 bg-card text-accent transition-colors hover:bg-accent/10 lg:flex"
          onClick={() => setDockOpen(true)}
          type="button"
        >
          <Terminal className="h-4 w-4" />
        </button>
      )}

      <CommandPalette onOpenChange={setPaletteOpen} open={paletteOpen} />
    </div>
  );
}
