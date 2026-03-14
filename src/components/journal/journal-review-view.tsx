import { AlertTriangle, ClipboardList, Sparkles, Target } from "lucide-react";

import { DisciplineChart } from "@/components/charts/discipline-chart";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/ui/metric-card";
import { SectionHeading } from "@/components/ui/section-heading";
import type { ReviewSnapshot } from "@/types";

export function JournalReviewView({ snapshot }: { snapshot: ReviewSnapshot }) {
  const openEntries = snapshot.entries.filter((entry) => entry.status === "OPEN");
  const closedEntries = snapshot.entries.filter((entry) => entry.status === "CLOSED");
  const setupTags = Array.from(new Set(snapshot.entries.map((entry) => entry.setupName)));
  const mistakes = snapshot.entries.filter((entry) => entry.mistakeTag);

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Journal & Review"
        title="Execution quality and discipline review"
        description="Trade logs, setup analytics, mistakes tracking, and behavior feedback share the same review loop."
        action={<Badge variant="info">{snapshot.analytics.winRate}% win rate</Badge>}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={<Target className="h-4 w-4 text-primary" />}
          label="Win rate"
          value={`${snapshot.analytics.winRate}%`}
          hint="Closed trade quality"
        />
        <MetricCard
          icon={<Sparkles className="h-4 w-4 text-cyan-300" />}
          label="Average R"
          value={snapshot.analytics.averageR}
          hint="Risk-adjusted outcome"
        />
        <MetricCard
          icon={<ClipboardList className="h-4 w-4 text-amber-300" />}
          label="Open trades"
          value={openEntries.length}
          hint="Needs active discipline"
        />
        <MetricCard
          icon={<AlertTriangle className="h-4 w-4 text-rose-300" />}
          label="Logged mistakes"
          value={mistakes.length}
          hint="Review and eliminate repeats"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Performance cards</CardTitle>
              <CardDescription>What the journal says about process quality.</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                <p className="text-sm text-muted-foreground">Average R</p>
                <p className="mt-2 text-2xl font-semibold">{snapshot.analytics.averageR}</p>
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                <p className="text-sm text-muted-foreground">Discipline average</p>
                <p className="mt-2 text-2xl font-semibold">{snapshot.analytics.disciplineAverage}/10</p>
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                <p className="text-sm text-muted-foreground">Best setup</p>
                <p className="mt-2 text-lg font-semibold">{snapshot.analytics.bestSetup}</p>
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                <p className="text-sm text-muted-foreground">Common mistake</p>
                <p className="mt-2 text-lg font-semibold">{snapshot.analytics.commonMistake}</p>
              </div>
            </div>
            <DisciplineChart data={snapshot.analytics.curve} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Setup tags and discipline review</CardTitle>
              <CardDescription>Recurring setups, behavior patterns, and process reminders.</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
              <p className="text-sm font-medium">Setup tags</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {setupTags.map((tag) => (
                  <Badge key={tag} variant="neutral">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-primary/15 bg-primary/8 p-4">
              <p className="font-medium">Discipline review</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Best-performing setups came when entries waited for confirmation. The main process leak is still early entry before the trigger is active.
              </p>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
              <p className="font-medium">Mistake logging section</p>
              <div className="mt-3 space-y-3">
                {mistakes.length ? (
                  mistakes.map((entry) => (
                    <div key={entry.id} className="rounded-2xl border border-white/8 bg-[#08111c] p-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-medium">{entry.ticker}</p>
                        <Badge variant="warning">{entry.mistakeTag}</Badge>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">{entry.reviewNotes}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No mistakes logged in the current dataset.</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Open trades</CardTitle>
              <CardDescription>Live positions and watch items that require discipline.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {openEntries.map((entry) => (
              <div key={entry.id} className="rounded-2xl border border-white/8 bg-white/4 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">{entry.ticker}</p>
                    <p className="text-sm text-muted-foreground">{entry.setupName}</p>
                  </div>
                  <Badge variant="warning">OPEN</Badge>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{entry.thesis}</p>
                <p className="mt-2 text-sm text-foreground">{entry.reviewNotes}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Closed trades</CardTitle>
              <CardDescription>Completed trades with review notes and outcomes.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {closedEntries.map((entry) => (
              <div key={entry.id} className="rounded-2xl border border-white/8 bg-white/4 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">{entry.ticker}</p>
                    <p className="text-sm text-muted-foreground">{entry.setupName}</p>
                  </div>
                  <Badge variant="success">{entry.outcomeR}R</Badge>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{entry.thesis}</p>
                <p className="mt-2 text-sm text-foreground">{entry.reviewNotes}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Open trade review</CardTitle>
            <CardDescription>Live ideas worth monitoring against discipline rules.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          {snapshot.openTrades.map((trade) => (
            <div key={trade.ticker} className="rounded-2xl border border-white/8 bg-white/4 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium">{trade.ticker}</p>
                <Badge variant={trade.riskVerdict.decision === "APPROVE" ? "success" : "warning"}>
                  {trade.riskVerdict.decision}
                </Badge>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{trade.executionPlan.entryZone}</p>
              <div className="mt-4 grid gap-2 text-sm">
                <p className="text-muted-foreground">Catalyst: {trade.catalyst}</p>
                <p className="text-muted-foreground">Invalidation: {trade.technicalSetup.invalidation}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
