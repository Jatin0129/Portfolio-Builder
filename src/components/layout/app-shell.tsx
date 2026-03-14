"use client";

import type { ReactNode } from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, BookOpenText, BriefcaseBusiness, LayoutGrid, Radar } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const navigation = [
  { href: "/", label: "Dashboard", icon: LayoutGrid },
  { href: "/intelligence", label: "Intelligence", icon: Radar },
  { href: "/portfolio-risk", label: "Portfolio & Risk", icon: BriefcaseBusiness },
  { href: "/journal-review", label: "Journal & Review", icon: BookOpenText },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto grid min-h-screen max-w-[1600px] grid-cols-1 gap-6 px-4 py-4 lg:grid-cols-[260px_minmax(0,1fr)] lg:px-6">
        <aside className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(12,20,31,0.98),rgba(9,15,24,0.94))] p-5 shadow-glow">
          <div className="flex items-center gap-3 border-b border-white/8 pb-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/15 text-primary">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold tracking-tight">CycleOS</p>
              <p className="text-xs text-muted-foreground">Investment intelligence cockpit</p>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-primary/15 bg-primary/8 p-4">
            <p className="text-xs uppercase tracking-[0.22em] text-primary">Profile</p>
            <div className="mt-3 flex items-center justify-between">
              <div>
                <p className="font-medium">Dubai swing investor</p>
                <p className="text-xs text-muted-foreground">Global assets, AED reporting</p>
              </div>
              <Badge variant="info">Wio-ready</Badge>
            </div>
          </div>

          <nav className="mt-6 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition-colors",
                    active
                      ? "bg-white/10 text-foreground"
                      : "text-muted-foreground hover:bg-white/6 hover:text-foreground",
                  )}
                  href={item.href}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-6 rounded-2xl border border-white/8 bg-white/4 p-4">
            <p className="text-sm font-medium">Discipline reminder</p>
            <p className="mt-2 text-sm text-muted-foreground">
              No idea is actionable until macro regime, factor quality, technical confirmation, and risk approval all agree.
            </p>
          </div>
        </aside>

        <main className="rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(18,89,102,0.16),transparent_26%),linear-gradient(180deg,rgba(11,17,26,0.96),rgba(7,11,18,0.98))] p-4 shadow-glow md:p-6">
          <div className="mb-6 flex flex-col gap-4 rounded-[24px] border border-white/8 bg-white/[0.03] px-5 py-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">Cycle-based operating system</p>
              <h2 className="mt-2 text-xl font-semibold tracking-tight">Institutional workflow, retail-friendly controls</h2>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="success">Explainable ideas only</Badge>
              <Badge variant="neutral">Mock data architecture</Badge>
              <Badge variant="warning">Risk capped</Badge>
            </div>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
