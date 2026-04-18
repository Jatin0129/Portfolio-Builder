"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  BookOpenText,
  BriefcaseBusiness,
  LayoutGrid,
  LineChart,
  Radar,
  Settings2,
} from "lucide-react";

import { cn } from "@/lib/utils";

const navigation = [
  { href: "/", label: "Overview", icon: LayoutGrid, code: "OVRVW" },
  { href: "/portfolio-risk", label: "Investments", icon: BriefcaseBusiness, code: "INVST" },
  { href: "/journal-review", label: "Journal", icon: BookOpenText, code: "JRNL" },
  { href: "/market-feed", label: "Live Market", icon: LineChart, code: "MKT" },
  { href: "/intelligence", label: "Research", icon: Radar, code: "RSCH" },
  { href: "/settings", label: "Settings", icon: Settings2, code: "STG" },
];

export function IconRail() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-[60px] flex-col items-center gap-1 panel-border bg-card py-2">
      <div className="flex h-9 w-9 items-center justify-center border border-accent/30 bg-accent/10 text-accent">
        <Activity className="h-4 w-4" />
      </div>
      <div className="my-1 h-px w-7 bg-border" />
      <nav className="flex flex-col items-center gap-0.5">
        {navigation.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              aria-label={item.label}
              className={cn(
                "group relative flex h-9 w-9 items-center justify-center border transition-colors",
                active
                  ? "border-accent/40 bg-accent/10 text-accent"
                  : "border-transparent text-muted-foreground hover:border-border hover:bg-muted hover:text-foreground",
              )}
              href={item.href}
              key={item.href}
              title={item.label}
            >
              <Icon className="h-4 w-4" />
              <span className="pointer-events-none absolute left-[52px] z-50 whitespace-nowrap border border-border bg-card px-2 py-1 font-mono-tight text-[10px] uppercase tracking-[0.14em] text-foreground opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                {item.code}
              </span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
