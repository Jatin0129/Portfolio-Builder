# CycleOS

CycleOS is a production-style investment intelligence app for a Dubai-based retail swing investor. It converts macro data, geopolitical context, factor signals, technical confirmation, portfolio fit, and risk controls into ranked and explainable trade ideas.

## Folder structure

```text
src/
  app/                Next.js App Router pages and route-level layout
  components/         Reusable UI, page views, charts, and layout building blocks
  engines/            Pure business logic grouped by domain
    ai-agents/
    factor-scoring/
    geopolitics/
    macro/
    market-data/
    portfolio/
    regime/
    risk/
  lib/                Shared framework utilities such as Prisma and generic helpers
  mock-data/          Sample domain datasets and seed-friendly mock inputs
    ai-agents/
    factor-scoring/
    geopolitics/
    journal/
    macro/
    market-data/
    portfolio/
    regime/
    risk/
  services/           Application orchestration layer that composes engines into page-ready snapshots
  types/              Shared TypeScript interfaces and domain models
prisma/               Database schema and seed script
```

## What each major folder does

- `src/app`: Defines the four core pages: Dashboard, Intelligence, Portfolio & Risk, and Journal & Review.
- `src/components`: Holds reusable presentation components, including charts, UI primitives, and page-level views.
- `src/engines`: Contains the rule-based and scoring logic. Each domain is isolated so live APIs can be plugged in later without tangling UI code.
- `src/mock-data`: Stores sample mock data files for every major domain so the app can run before real integrations exist.
- `src/services`: Builds dashboard snapshots, trade packets, portfolio summaries, and review data by composing engines and mock inputs.
- `src/types`: Central place for the shared interfaces used across UI, engines, services, and Prisma seed helpers.
- `src/lib`: Keeps small shared utilities and infrastructure helpers that are not domain-specific.
- `prisma`: Defines persistence models and the seed entrypoint for PostgreSQL.

## Domain coverage

- `market-data`: Market summary and asset universe inputs
- `macro`: Macro calendar, sector heatmap, and catalysts
- `geopolitics`: Geopolitical severity events and implications
- `regime`: Rule-based market regime classification
- `factor-scoring`: Weighted opportunity score and factor breakdown
- `portfolio`: Holdings, allocation, concentration, and correlation logic
- `risk`: Trade approval, risk caps, and portfolio risk snapshot logic
- `ai-agents`: Structured JSON agent outputs for news, macro/geopolitics, opportunity, and risk

## Types included

The shared models under `src/types` include interfaces for:

- assets
- portfolio holdings
- trade ideas
- macro events
- geopolitical events
- regime output
- factor breakdown
- risk verdict

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy environment variables:

```bash
cp .env.example .env
```

3. Generate the Prisma client:

```bash
npm run db:generate
```

4. Push the schema to PostgreSQL:

```bash
npm run db:push
```

5. Seed the database:

```bash
npm run db:seed
```

6. Start the app:

```bash
npm run dev
```

## Notes

- The app currently runs from mock data but is structured for future API integrations.
- Future live data hooks are marked inside the engine layer.
- Portfolio reporting uses AED on the portfolio and risk surfaces.
