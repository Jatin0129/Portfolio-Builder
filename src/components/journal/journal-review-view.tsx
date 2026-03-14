import { DisciplineChart } from "@/components/charts/discipline-chart";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionHeading } from "@/components/ui/section-heading";
import type { ReviewSnapshot } from "@/types";

export function JournalReviewView({ snapshot }: { snapshot: ReviewSnapshot }) {
  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Journal & Review"
        title="Execution quality and discipline review"
        description="Trade logs, setup analytics, mistakes tracking, and behavior feedback share the same review loop."
        action={<Badge variant="info">{snapshot.analytics.winRate}% win rate</Badge>}
      />

      <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Setup analytics</CardTitle>
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
              <CardTitle>Trade journal</CardTitle>
              <CardDescription>Closed and open trades with behavior notes.</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {snapshot.entries.map((entry) => (
              <div key={entry.id} className="rounded-2xl border border-white/8 bg-white/4 p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <p className="font-medium">{entry.ticker}</p>
                      <Badge variant={entry.status === "OPEN" ? "warning" : "success"}>{entry.status}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{entry.setupName}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{entry.outcomeR ? `${entry.outcomeR}R` : "Open"}</p>
                    <p className="text-sm text-muted-foreground">Discipline {entry.disciplineScore}/10</p>
                  </div>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{entry.thesis}</p>
                <p className="mt-2 text-sm text-foreground">{entry.reviewNotes}</p>
                {entry.mistakeTag ? (
                  <div className="mt-3">
                    <Badge variant="warning">{entry.mistakeTag}</Badge>
                  </div>
                ) : null}
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
