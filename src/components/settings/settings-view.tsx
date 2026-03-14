"use client";

import { useState, useTransition } from "react";
import { BellRing, BriefcaseBusiness, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionHeading } from "@/components/ui/section-heading";
import type { AssetUniversePreference, SettingsSnapshot, UserSettings } from "@/types";

const profilePresets = {
  conservative: {
    maxRiskPerTradePct: 0.7,
    maxPortfolioOpenRiskPct: 4,
    maxDrawdownThresholdPct: 7,
    maxSinglePositionPct: 12,
    maxSectorExposurePct: 22,
    maxCorrelationClusterPct: 28,
  },
  balanced: {
    maxRiskPerTradePct: 1,
    maxPortfolioOpenRiskPct: 5.5,
    maxDrawdownThresholdPct: 10,
    maxSinglePositionPct: 16,
    maxSectorExposurePct: 28,
    maxCorrelationClusterPct: 34,
  },
  aggressive: {
    maxRiskPerTradePct: 1.4,
    maxPortfolioOpenRiskPct: 7,
    maxDrawdownThresholdPct: 13,
    maxSinglePositionPct: 20,
    maxSectorExposurePct: 34,
    maxCorrelationClusterPct: 42,
  },
} satisfies Record<
  UserSettings["profile"],
  Pick<
    UserSettings,
    | "maxRiskPerTradePct"
    | "maxPortfolioOpenRiskPct"
    | "maxDrawdownThresholdPct"
    | "maxSinglePositionPct"
    | "maxSectorExposurePct"
    | "maxCorrelationClusterPct"
  >
>;

const assetUniverseOptions: AssetUniversePreference[] = [
  "US stocks",
  "ETFs",
  "gold proxy",
  "energy proxy",
  "bond proxy",
  "crypto proxy",
];

export function SettingsView({ snapshot }: { snapshot: SettingsSnapshot }) {
  const [formState, setFormState] = useState<UserSettings>(snapshot.settings);
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");
  const [isPending, startTransition] = useTransition();

  function updateField<TKey extends keyof UserSettings>(key: TKey, value: UserSettings[TKey]) {
    setFormState((current) => ({ ...current, [key]: value }));
  }

  function toggleUniverse(option: AssetUniversePreference) {
    setFormState((current) => {
      const enabled = current.preferredAssetUniverse.includes(option);
      return {
        ...current,
        preferredAssetUniverse: enabled
          ? current.preferredAssetUniverse.filter((item) => item !== option)
          : [...current.preferredAssetUniverse, option],
      };
    });
  }

  function applyProfile(profile: UserSettings["profile"]) {
    setFormState((current) => ({
      ...current,
      profile,
      ...profilePresets[profile],
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    startTransition(async () => {
      try {
        const response = await fetch("/api/settings", {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify(formState),
        });

        if (!response.ok) {
          throw new Error("Unable to save settings");
        }

        const saved = (await response.json()) as UserSettings;
        setFormState(saved);
        setStatus("saved");
      } catch {
        setStatus("error");
      }
    });
  }

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Settings"
        title="CycleOS operating profile"
        description="Define capital, risk tolerance, reporting defaults, alert bands, and the asset universe that drives the dashboard and risk engines."
        action={<Badge variant="info">{formState.profile}</Badge>}
      />

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Capital and risk controls</CardTitle>
                <CardDescription>These values feed position sizing, concentration checks, and drawdown discipline.</CardDescription>
              </div>
              <ShieldCheck className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Total capital</span>
                <input
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm"
                  onChange={(event) => updateField("totalCapital", Number(event.target.value))}
                  type="number"
                  value={formState.totalCapital}
                />
              </label>
              <label className="space-y-2">
                <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Cash reserve</span>
                <input
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm"
                  onChange={(event) => updateField("cashAed", Number(event.target.value))}
                  type="number"
                  value={formState.cashAed}
                />
              </label>
              <label className="space-y-2">
                <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Reporting currency</span>
                <input
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm"
                  onChange={(event) => updateField("reportingCurrency", event.target.value)}
                  value={formState.reportingCurrency}
                />
              </label>
              <label className="space-y-2">
                <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Holding horizon</span>
                <select
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm"
                  onChange={(event) =>
                    updateField("preferredHoldingHorizon", event.target.value as UserSettings["preferredHoldingHorizon"])
                  }
                  value={formState.preferredHoldingHorizon}
                >
                  <option value="intraday">Intraday</option>
                  <option value="swing">Swing</option>
                  <option value="position">Position</option>
                </select>
              </label>
              <label className="space-y-2">
                <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Max risk per trade %</span>
                <input
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm"
                  onChange={(event) => updateField("maxRiskPerTradePct", Number(event.target.value))}
                  step="0.1"
                  type="number"
                  value={formState.maxRiskPerTradePct}
                />
              </label>
              <label className="space-y-2">
                <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Max open risk %</span>
                <input
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm"
                  onChange={(event) => updateField("maxPortfolioOpenRiskPct", Number(event.target.value))}
                  step="0.1"
                  type="number"
                  value={formState.maxPortfolioOpenRiskPct}
                />
              </label>
              <label className="space-y-2">
                <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Max drawdown %</span>
                <input
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm"
                  onChange={(event) => updateField("maxDrawdownThresholdPct", Number(event.target.value))}
                  step="0.1"
                  type="number"
                  value={formState.maxDrawdownThresholdPct}
                />
              </label>
              <label className="space-y-2">
                <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Max single position %</span>
                <input
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm"
                  onChange={(event) => updateField("maxSinglePositionPct", Number(event.target.value))}
                  step="0.1"
                  type="number"
                  value={formState.maxSinglePositionPct}
                />
              </label>
              <label className="space-y-2">
                <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Max sector exposure %</span>
                <input
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm"
                  onChange={(event) => updateField("maxSectorExposurePct", Number(event.target.value))}
                  step="0.1"
                  type="number"
                  value={formState.maxSectorExposurePct}
                />
              </label>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Profile posture</CardTitle>
                  <CardDescription>Profiles reset the operating envelope for how aggressively CycleOS should think about deployment.</CardDescription>
                </div>
                <BriefcaseBusiness className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid gap-2">
                  {snapshot.profileGuidance.map((profile) => (
                    <button
                      key={profile.profile}
                      className={`rounded-2xl border px-4 py-4 text-left transition ${
                        formState.profile === profile.profile
                          ? "border-primary/40 bg-primary/10"
                          : "border-white/10 bg-white/5 hover:border-white/20"
                      }`}
                        onClick={() => applyProfile(profile.profile)}
                        type="button"
                      >
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-medium capitalize">{profile.profile}</p>
                        <Badge variant={formState.profile === profile.profile ? "success" : "neutral"}>
                          {profile.focus}
                        </Badge>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">{profile.summary}</p>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Alert thresholds</CardTitle>
                  <CardDescription>Alert bands control when the app should push a higher-scrutiny posture.</CardDescription>
                </div>
                <BellRing className="h-4 w-4 text-warning" />
              </CardHeader>
              <CardContent className="grid gap-4">
                <label className="space-y-2">
                  <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Open risk alert %</span>
                  <input
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm"
                    onChange={(event) =>
                      updateField("alertThresholds", {
                        ...formState.alertThresholds,
                        openRiskPct: Number(event.target.value),
                      })
                    }
                    step="0.1"
                    type="number"
                    value={formState.alertThresholds.openRiskPct}
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Single-position alert %</span>
                  <input
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm"
                    onChange={(event) =>
                      updateField("alertThresholds", {
                        ...formState.alertThresholds,
                        singlePositionPct: Number(event.target.value),
                      })
                    }
                    step="0.1"
                    type="number"
                    value={formState.alertThresholds.singlePositionPct}
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Volatility alert level</span>
                  <input
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm"
                    onChange={(event) =>
                      updateField("alertThresholds", {
                        ...formState.alertThresholds,
                        volatilityAlertLevel: Number(event.target.value),
                      })
                    }
                    type="number"
                    value={formState.alertThresholds.volatilityAlertLevel}
                  />
                </label>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Preferred asset universe</CardTitle>
              <CardDescription>Select the categories CycleOS should prioritize across scanners, watchlists, and risk reviews.</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {assetUniverseOptions.map((option) => {
                const selected = formState.preferredAssetUniverse.includes(option);
                return (
                  <button
                    key={option}
                    className={`rounded-full border px-4 py-2 text-sm transition ${
                      selected ? "border-primary/40 bg-primary/10 text-foreground" : "border-white/10 bg-white/5 text-muted-foreground"
                    }`}
                    onClick={() => toggleUniverse(option)}
                    type="button"
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between gap-4 rounded-3xl border border-white/10 bg-white/[0.03] px-5 py-4">
          <div>
            <p className="text-sm font-medium">Settings persistence</p>
            <p className="text-sm text-muted-foreground">
              Settings are stored through the Prisma-backed settings provider when the database is available and fall back safely otherwise.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {status === "saved" ? <Badge variant="success">Saved</Badge> : null}
            {status === "error" ? <Badge variant="danger">Save failed</Badge> : null}
            <Button disabled={isPending} type="submit">
              {isPending ? "Saving..." : "Save settings"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
