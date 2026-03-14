"use client";

import { useEffect, useMemo, useState } from "react";
import { Activity, CandlestickChart, RadioTower, Target } from "lucide-react";

import { PriceHistoryChart } from "@/components/charts/price-history-chart";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartPanel } from "@/components/ui/chart-panel";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { MetricCard } from "@/components/ui/metric-card";
import { PanelList } from "@/components/ui/panel-list";
import { SectionHeading } from "@/components/ui/section-heading";
import { SegmentedFilter } from "@/components/ui/segmented-filter";
import { formatNumber } from "@/lib/utils";
import type {
  LiveMarketCandle,
  LiveMarketRsi,
  MarketFeedCategory,
  MarketFeedInstrument,
  MarketFeedSnapshot,
} from "@/types";

const categoryLabels: Record<MarketFeedCategory, string> = {
  benchmarks: "Benchmarks",
  holdings: "Holdings",
  watchlist: "Watchlist",
  universe: "Universe",
};

function quoteVariant(changePercent: number) {
  return changePercent >= 0 ? "success" : "danger";
}

function sourceVariant(source: "live" | "mock" | "mixed") {
  return source === "live" ? "success" : source === "mixed" ? "warning" : "neutral";
}

export function MarketFeedView({ snapshot }: { snapshot: MarketFeedSnapshot }) {
  const [activeCategory, setActiveCategory] = useState<MarketFeedCategory>(snapshot.defaultCategory);
  const [sections, setSections] = useState(snapshot.sections);
  const [selectedSymbol, setSelectedSymbol] = useState(snapshot.selectedSymbol);
  const [quoteSource, setQuoteSource] = useState<Record<MarketFeedCategory, "live" | "mock" | "mixed">>({
    benchmarks: "mock",
    holdings: "mock",
    watchlist: "mock",
    universe: "mock",
  });
  const [candles, setCandles] = useState<LiveMarketCandle[]>([]);
  const [rsi, setRsi] = useState<LiveMarketRsi | null>(null);

  const activeItems = sections[activeCategory];
  const selectedInstrument = useMemo(
    () =>
      Object.values(sections)
        .flat()
        .find((item) => item.symbol === selectedSymbol) ?? activeItems[0],
    [activeItems, sections, selectedSymbol],
  );

  useEffect(() => {
    if (activeItems[0]?.symbol) {
      setSelectedSymbol(activeItems[0].symbol);
    }
  }, [activeCategory]);

  useEffect(() => {
    if (!activeItems.length) return;

    const symbols = activeItems.map((item) => item.symbol).join(",");
    let ignore = false;

    async function loadQuotes() {
      try {
        const response = await fetch(
          `/api/market/watchlist?category=${activeCategory}&symbols=${symbols}&limit=${activeItems.length}`,
          { cache: "no-store" },
        );
        if (!response.ok) return;

        const payload = (await response.json()) as {
          items: MarketFeedInstrument[];
          source: "live" | "mock" | "mixed";
        };

        if (ignore) return;
        setSections((current) => ({
          ...current,
          [activeCategory]: payload.items,
        }));
        setQuoteSource((current) => ({
          ...current,
          [activeCategory]: payload.source,
        }));
      } catch {
        // Keep the seeded section when network calls fail.
      }
    }

    void loadQuotes();

    return () => {
      ignore = true;
    };
  }, [activeCategory, activeItems]);

  useEffect(() => {
    if (!selectedInstrument?.symbol) return;
    let ignore = false;

    async function loadDetail() {
      try {
        const [candlesResponse, rsiResponse] = await Promise.all([
          fetch(`/api/market/candles?symbol=${selectedInstrument.symbol}`, { cache: "no-store" }),
          fetch(`/api/market/rsi?symbol=${selectedInstrument.symbol}&interval=daily&timePeriod=14`, {
            cache: "no-store",
          }),
        ]);

        if (!candlesResponse.ok || !rsiResponse.ok) return;

        const candlePayload = (await candlesResponse.json()) as {
          candles: LiveMarketCandle[];
        };
        const rsiPayload = (await rsiResponse.json()) as LiveMarketRsi;

        if (ignore) return;
        setCandles(candlePayload.candles.slice(0, 30));
        setRsi(rsiPayload);
      } catch {
        // Keep the last successful detail payload if live requests fail.
      }
    }

    void loadDetail();

    return () => {
      ignore = true;
    };
  }, [selectedInstrument?.symbol]);

  const columns: DataTableColumn<MarketFeedInstrument>[] = [
    {
      key: "symbol",
      header: "Symbol",
      render: (item) => (
        <button className="text-left" onClick={() => setSelectedSymbol(item.symbol)} type="button">
          <p className="font-medium text-foreground">{item.symbol}</p>
          <p className="text-xs text-muted-foreground">{item.name}</p>
        </button>
      ),
    },
    {
      key: "context",
      header: "Context",
      render: (item) => (
        <div className="flex flex-wrap gap-2">
          <Badge variant="neutral">{categoryLabels[item.context]}</Badge>
          {item.priority ? <Badge variant="info">{item.priority}</Badge> : null}
          {item.allocationBucket ? <Badge variant="neutral">{item.allocationBucket}</Badge> : null}
        </div>
      ),
    },
    {
      key: "price",
      header: "Price",
      render: (item) => `$${item.quote.price.toFixed(2)}`,
    },
    {
      key: "change",
      header: "Change",
      render: (item) => (
        <span className={item.quote.changePercent >= 0 ? "text-emerald-300" : "text-rose-300"}>
          {item.quote.changePercent >= 0 ? "+" : ""}
          {item.quote.changePercent.toFixed(2)}%
        </span>
      ),
    },
    {
      key: "meta",
      header: "Meta",
      render: (item) => (
        <div className="space-y-1 text-xs text-muted-foreground">
          <p>{item.sector ?? item.assetClass ?? "Tracked"}</p>
          <p>{item.targetEntry ?? item.region ?? item.quote.latestTradingDay}</p>
        </div>
      ),
    },
    {
      key: "source",
      header: "Source",
      render: (item) => <Badge variant={sourceVariant(item.quote.source)}>{item.quote.source}</Badge>,
    },
  ];

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Live Market Feed"
        title="Tracked assets, live quote tape, and active symbol drilldown"
        description="Monitor the currently tracked benchmarks, holdings, watchlist, and universe with live route-backed quotes plus per-symbol momentum detail."
        action={<Badge variant={sourceVariant(quoteSource[activeCategory])}>{quoteSource[activeCategory]}</Badge>}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          hint="Cross-asset tape"
          icon={<RadioTower className="h-4 w-4 text-primary" />}
          label="Benchmarks tracked"
          value={sections.benchmarks.length}
        />
        <MetricCard
          hint="Live book monitoring"
          icon={<Activity className="h-4 w-4 text-cyan-300" />}
          label="Holdings tracked"
          value={sections.holdings.length}
        />
        <MetricCard
          hint="Priority watch items"
          icon={<Target className="h-4 w-4 text-amber-300" />}
          label="Watchlist names"
          value={sections.watchlist.length}
        />
        <MetricCard
          hint="All seeded instruments"
          icon={<CandlestickChart className="h-4 w-4 text-rose-300" />}
          label="Universe tracked"
          value={sections.universe.length}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Tracked feed board</CardTitle>
              <CardDescription>Switch between the sections currently under active monitoring.</CardDescription>
            </div>
            <SegmentedFilter
              onChange={setActiveCategory}
              options={[
                { label: "Benchmarks", value: "benchmarks" },
                { label: "Holdings", value: "holdings" },
                { label: "Watchlist", value: "watchlist" },
                { label: "Universe", value: "universe" },
              ]}
              value={activeCategory}
            />
          </CardHeader>
          <CardContent className="overflow-hidden">
            <DataTable columns={columns} getRowKey={(item) => item.id} rows={activeItems} />
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>{selectedInstrument?.symbol ?? "No symbol selected"}</CardTitle>
                <CardDescription>{selectedInstrument?.name ?? "Select a tracked symbol to inspect the live feed."}</CardDescription>
              </div>
              {selectedInstrument ? (
                <Badge variant={sourceVariant(selectedInstrument.quote.source)}>{selectedInstrument.quote.source}</Badge>
              ) : null}
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[22px] border border-white/10 bg-white/4 p-4">
                <p className="text-sm text-muted-foreground">Last price</p>
                <p className="mt-2 text-2xl font-semibold">
                  ${selectedInstrument?.quote.price.toFixed(2) ?? "--"}
                </p>
              </div>
              <div className="rounded-[22px] border border-white/10 bg-white/4 p-4">
                <p className="text-sm text-muted-foreground">Daily change</p>
                <p className={`mt-2 text-2xl font-semibold ${selectedInstrument && selectedInstrument.quote.changePercent >= 0 ? "text-emerald-300" : "text-rose-300"}`}>
                  {selectedInstrument && selectedInstrument.quote.changePercent >= 0 ? "+" : ""}
                  {selectedInstrument?.quote.changePercent.toFixed(2) ?? "--"}%
                </p>
              </div>
              <div className="rounded-[22px] border border-white/10 bg-white/4 p-4">
                <p className="text-sm text-muted-foreground">RSI (14)</p>
                <p className="mt-2 text-2xl font-semibold">{rsi ? formatNumber(rsi.current, 1) : "--"}</p>
              </div>
              <div className="rounded-[22px] border border-white/10 bg-white/4 p-4">
                <p className="text-sm text-muted-foreground">Latest trading day</p>
                <p className="mt-2 text-2xl font-semibold">
                  {selectedInstrument?.quote.latestTradingDay ?? "--"}
                </p>
              </div>
            </CardContent>
          </Card>

          <ChartPanel
            description="Recent daily close trend from the internal candles route."
            title="Price history"
          >
            <PriceHistoryChart data={candles} />
          </ChartPanel>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>Active context</CardTitle>
                <CardDescription>What CycleOS is monitoring around the selected symbol right now.</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <PanelList
                items={[
                  selectedInstrument?.thesis ? `Thesis: ${selectedInstrument.thesis}` : null,
                  selectedInstrument?.targetEntry ? `Trigger: ${selectedInstrument.targetEntry}` : null,
                  selectedInstrument?.sector ? `Sector: ${selectedInstrument.sector}` : null,
                  selectedInstrument?.region ? `Region: ${selectedInstrument.region}` : null,
                  selectedInstrument?.themes.length ? `Themes: ${selectedInstrument.themes.join(", ")}` : null,
                ].filter(Boolean)}
                renderItem={(item, index) => (
                  <div key={`${selectedInstrument?.symbol}-${index}`} className="rounded-[22px] border border-white/10 bg-white/4 p-4 text-sm text-muted-foreground">
                    {item}
                  </div>
                )}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
