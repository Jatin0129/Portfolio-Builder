import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";

import { ChartPanel } from "@/components/ui/chart-panel";
import { DataTable } from "@/components/ui/data-table";
import { Field, FieldGroup } from "@/components/ui/field";
import { SegmentedFilter } from "@/components/ui/segmented-filter";

test("segmented filter renders active and inactive options", () => {
  const markup = renderToStaticMarkup(
    <SegmentedFilter
      onChange={() => {}}
      options={[
        { label: "All", value: "ALL" },
        { label: "Open", value: "OPEN" },
      ]}
      value="OPEN"
    />,
  );

  assert.match(markup, /All/);
  assert.match(markup, /Open/);
  assert.match(markup, /border-primary\/40 bg-primary\/10 text-foreground/);
});

test("data table renders headers and cells", () => {
  const markup = renderToStaticMarkup(
    <DataTable
      columns={[
        { key: "ticker", header: "Ticker", render: (row: { ticker: string }) => row.ticker },
        { key: "setup", header: "Setup", render: (row: { setup: string }) => row.setup },
      ]}
      getRowKey={(row) => row.ticker}
      rows={[{ ticker: "NVDA", setup: "Breakout" }]}
    />,
  );

  assert.match(markup, /Ticker/);
  assert.match(markup, /Setup/);
  assert.match(markup, /NVDA/);
  assert.match(markup, /Breakout/);
});

test("field group and chart panel render their labels", () => {
  const markup = renderToStaticMarkup(
    <div>
      <FieldGroup>
        <Field label="Ticker">
          <input value="MSFT" readOnly />
        </Field>
      </FieldGroup>
      <ChartPanel description="Discipline curve" title="Journal curve">
        <div>Chart body</div>
      </ChartPanel>
    </div>,
  );

  assert.match(markup, /Ticker/);
  assert.match(markup, /Journal curve/);
  assert.match(markup, /Discipline curve/);
  assert.match(markup, /Chart body/);
});
