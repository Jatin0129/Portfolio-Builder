"use client";

import type { ReactNode } from "react";
import { useState, useTransition } from "react";
import { BellRing, BriefcaseBusiness, ShieldCheck } from "lucide-react";

import { assetUniverseOptions, settingsProfilePresets } from "@/config/settings";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup, fieldControlClassName } from "@/components/ui/field";
import { SectionHeading } from "@/components/ui/section-heading";
import { cn } from "@/lib/utils";
import type { AssetUniversePreference, SettingsSnapshot, UserSettings } from "@/types";

function SettingsCard({
  title,
  description,
  icon,
  children,
}: {
  title: string;
  description: string;
  icon?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        {icon}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function AssetUniversePicker({
  selected,
  onToggle,
}: {
  selected: AssetUniversePreference[];
  onToggle: (option: AssetUniversePreference) => void;
}) {
  return (
    <div className="flex flex-wrap gap-3">
      {assetUniverseOptions.map((option) => {
        const isSelected = selected.includes(option);
        return (
          <button
            key={option}
            className={cn(
              "rounded-full border px-4 py-2 text-sm transition",
              isSelected
                ? "border-primary/40 bg-primary/10 text-foreground"
                : "border-white/10 bg-white/5 text-muted-foreground",
            )}
            onClick={() => onToggle(option)}
            type="button"
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}

function ProfilePostureCard({
  settings,
  guidance,
  onApply,
}: {
  settings: UserSettings;
  guidance: SettingsSnapshot["profileGuidance"];
  onApply: (profile: UserSettings["profile"]) => void;
}) {
  return (
    <SettingsCard
      description="Profiles reset the operating envelope for how aggressively CycleOS should think about deployment."
      icon={<BriefcaseBusiness className="h-4 w-4 text-primary" />}
      title="Profile posture"
    >
      <div className="grid gap-2">
        {guidance.map((profile) => (
          <button
            key={profile.profile}
            className={cn(
              "rounded-2xl border px-4 py-4 text-left transition",
              settings.profile === profile.profile
                ? "border-primary/40 bg-primary/10"
                : "border-white/10 bg-white/5 hover:border-white/20",
            )}
            onClick={() => onApply(profile.profile)}
            type="button"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="font-medium capitalize">{profile.profile}</p>
              <Badge variant={settings.profile === profile.profile ? "success" : "neutral"}>
                {profile.focus}
              </Badge>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{profile.summary}</p>
          </button>
        ))}
      </div>
    </SettingsCard>
  );
}

function AlertThresholdCard({
  settings,
  updateField,
}: {
  settings: UserSettings;
  updateField: <TKey extends keyof UserSettings>(key: TKey, value: UserSettings[TKey]) => void;
}) {
  return (
    <SettingsCard
      description="Alert bands control when the app should push a higher-scrutiny posture."
      icon={<BellRing className="h-4 w-4 text-warning" />}
      title="Alert thresholds"
    >
      <div className="grid gap-4">
        <Field label="Open risk alert %">
          <input
            className={fieldControlClassName}
            onChange={(event) =>
              updateField("alertThresholds", {
                ...settings.alertThresholds,
                openRiskPct: Number(event.target.value),
              })
            }
            step="0.1"
            type="number"
            value={settings.alertThresholds.openRiskPct}
          />
        </Field>
        <Field label="Single-position alert %">
          <input
            className={fieldControlClassName}
            onChange={(event) =>
              updateField("alertThresholds", {
                ...settings.alertThresholds,
                singlePositionPct: Number(event.target.value),
              })
            }
            step="0.1"
            type="number"
            value={settings.alertThresholds.singlePositionPct}
          />
        </Field>
        <Field label="Volatility alert level">
          <input
            className={fieldControlClassName}
            onChange={(event) =>
              updateField("alertThresholds", {
                ...settings.alertThresholds,
                volatilityAlertLevel: Number(event.target.value),
              })
            }
            type="number"
            value={settings.alertThresholds.volatilityAlertLevel}
          />
        </Field>
      </div>
    </SettingsCard>
  );
}

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
      ...settingsProfilePresets[profile],
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
          <SettingsCard
            description="These values feed position sizing, concentration checks, and drawdown discipline."
            icon={<ShieldCheck className="h-4 w-4 text-primary" />}
            title="Capital and risk controls"
          >
            <FieldGroup>
              <Field label="Total capital">
                <input
                  className={fieldControlClassName}
                  onChange={(event) => updateField("totalCapital", Number(event.target.value))}
                  type="number"
                  value={formState.totalCapital}
                />
              </Field>
              <Field label="Cash reserve">
                <input
                  className={fieldControlClassName}
                  onChange={(event) => updateField("cashAed", Number(event.target.value))}
                  type="number"
                  value={formState.cashAed}
                />
              </Field>
              <Field label="Reporting currency">
                <input
                  className={fieldControlClassName}
                  onChange={(event) => updateField("reportingCurrency", event.target.value)}
                  value={formState.reportingCurrency}
                />
              </Field>
              <Field label="Holding horizon">
                <select
                  className={fieldControlClassName}
                  onChange={(event) =>
                    updateField(
                      "preferredHoldingHorizon",
                      event.target.value as UserSettings["preferredHoldingHorizon"],
                    )
                  }
                  value={formState.preferredHoldingHorizon}
                >
                  <option value="intraday">Intraday</option>
                  <option value="swing">Swing</option>
                  <option value="position">Position</option>
                </select>
              </Field>
              <Field label="Max risk per trade %">
                <input
                  className={fieldControlClassName}
                  onChange={(event) => updateField("maxRiskPerTradePct", Number(event.target.value))}
                  step="0.1"
                  type="number"
                  value={formState.maxRiskPerTradePct}
                />
              </Field>
              <Field label="Max open risk %">
                <input
                  className={fieldControlClassName}
                  onChange={(event) => updateField("maxPortfolioOpenRiskPct", Number(event.target.value))}
                  step="0.1"
                  type="number"
                  value={formState.maxPortfolioOpenRiskPct}
                />
              </Field>
              <Field label="Max drawdown %">
                <input
                  className={fieldControlClassName}
                  onChange={(event) => updateField("maxDrawdownThresholdPct", Number(event.target.value))}
                  step="0.1"
                  type="number"
                  value={formState.maxDrawdownThresholdPct}
                />
              </Field>
              <Field label="Max single position %">
                <input
                  className={fieldControlClassName}
                  onChange={(event) => updateField("maxSinglePositionPct", Number(event.target.value))}
                  step="0.1"
                  type="number"
                  value={formState.maxSinglePositionPct}
                />
              </Field>
              <Field label="Max sector exposure %">
                <input
                  className={fieldControlClassName}
                  onChange={(event) => updateField("maxSectorExposurePct", Number(event.target.value))}
                  step="0.1"
                  type="number"
                  value={formState.maxSectorExposurePct}
                />
              </Field>
              <Field label="Max correlation cluster %">
                <input
                  className={fieldControlClassName}
                  onChange={(event) => updateField("maxCorrelationClusterPct", Number(event.target.value))}
                  step="0.1"
                  type="number"
                  value={formState.maxCorrelationClusterPct}
                />
              </Field>
            </FieldGroup>
          </SettingsCard>

          <div className="space-y-4">
            <ProfilePostureCard
              guidance={snapshot.profileGuidance}
              onApply={applyProfile}
              settings={formState}
            />
            <AlertThresholdCard settings={formState} updateField={updateField} />
          </div>
        </div>

        <SettingsCard
          description="Select the categories CycleOS should prioritize across scanners, watchlists, and risk reviews."
          title="Preferred asset universe"
        >
          <AssetUniversePicker onToggle={toggleUniverse} selected={formState.preferredAssetUniverse} />
        </SettingsCard>

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
