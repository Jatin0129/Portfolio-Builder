# CycleOS

CycleOS is a premium institutional-style investment dashboard for a single-user swing-investing workflow. It combines macro regime context, geopolitical overlays, factor scoring, portfolio risk, journal review, and structured AI workflow placeholders into one dark, decision-oriented operating surface.

## Project purpose

CycleOS is designed to answer one question repeatedly and clearly:

Which ideas deserve capital right now, at what size, under what macro regime, and with what behavioral discipline?

The app is mock-data first, but the architecture is built so live market, news, macro, portfolio, and AI integrations can replace the mock providers later without rewriting page components.

## Architecture overview

```text
src/
  app/                 Next.js App Router pages and API routes
  components/          Shared UI primitives, charts, layout, and page views
  engines/             Pure scoring and decision logic
  lib/                 Framework and route utilities
  mock-data/           Deterministic demo datasets and seed-friendly records
  providers/           Typed provider interfaces plus mock/persistence implementations
  schemas/             Zod request/response validation for APIs and workflows
  services/            App orchestration, settings, journal, and snapshot builders
  test/                Shared test fixtures
  types/               Shared domain models and view-model contracts
prisma/
  schema.prisma        Database schema
  seed.ts              Prisma seed entrypoint
```

### Layer responsibilities

- `components` render the UI only.
- `services` assemble page-ready snapshots and workflow actions.
- `engines` handle rule-based logic such as regime, scoring, and risk.
- `providers` abstract data access so mock and future live integrations are swappable.
- `mock-data` owns the deterministic scenario data that powers the demo and seeds.

## Page overview

- `/`
  - Command-center dashboard with regime context, alerts, top ideas, and portfolio overview.
- `/market-feed`
  - Live market feed for tracked benchmarks, holdings, watchlist names, and the wider universe with symbol drilldown.
- `/intelligence`
  - Macro calendar, geopolitical board, catalyst tracker, and ranked scanner.
- `/portfolio-risk`
  - Holdings, exposures, allocation posture, concentration warnings, and watchlist.
- `/journal-review`
  - Trade log, analytics, behavioral review, and entry/exit logging workflows.
- `/settings`
  - Capital, risk, alert thresholds, asset-universe preferences, and operating profile.

## Engine overview

- `market-data`
  - Enriches the asset universe with macro and geopolitical fit.
- `macro`
  - Builds macro summaries, calendar view models, catalyst views, and macro fit scoring.
- `geopolitics`
  - Builds the geopolitical board and geopolitical fit scoring.
- `regime`
  - Converts cross-asset state into a regime snapshot and regime fit.
- `factor-scoring`
  - Computes weighted factor breakdowns and opportunity scores.
- `portfolio`
  - Normalizes holdings, exposures, allocation targets, and concentration maps.
- `risk`
  - Applies risk controls and trade approval logic from the active settings profile.
- `trade-ideas`
  - Combines enriched assets, regime, settings, and holdings into ranked trade ideas.
- `ai-agents`
  - Provides structured JSON placeholders for News, Macro/Geopolitics, Opportunity, and Risk Officer agents.

## Mock data and providers

CycleOS uses deterministic mock providers by default.

- Mock providers live under `src/providers/mock`.
- Persistence-backed settings and journal providers live under `src/providers/persistence`.
- `src/providers/index.ts` exposes the provider bundle used by app services.
- Engines no longer import `mock-data` directly; providers are the boundary.

### What the mock scenario includes

- 25 sample assets across US stocks, ETFs, gold, energy, bond, and crypto proxy sleeves
- macro event calendar and catalyst map
- geopolitical event board
- portfolio holdings and watchlist
- journal history with open and closed trades
- trade ideas generated from the same scenario data

## Settings and database notes

Prisma currently stores:

- `UserSettings`
- `JournalEntry`
- seeded market-facing tables such as assets, holdings, watchlist items, macro events, and geopolitical events

Settings are treated as a single-user record in this version. When the database is unavailable, the app falls back to the mock settings provider so the demo still renders.

## Environment variables

Use placeholders only; do not hardcode secrets.

```env
DATABASE_URL="postgresql://user:password@localhost:5432/cycleos"
ALPHA_VANTAGE_API_KEY=""
```

Future live integrations will likely add placeholders such as:

```env
OPENAI_API_KEY=""
MARKET_DATA_API_KEY=""
NEWS_API_KEY=""
MACRO_DATA_API_KEY=""
BROKER_API_KEY=""
```

## Setup instructions

1. Install dependencies

```bash
npm install
```

2. Create local environment variables

```bash
cp .env.example .env.local
```

3. Add your Alpha Vantage key to `.env.local`

```env
ALPHA_VANTAGE_API_KEY="your_alpha_vantage_key"
```

4. Generate Prisma client

```bash
npm run db:generate
```

5. Push the schema to your database

```bash
npm run db:push
```

6. Seed the database

```bash
npm run db:seed
```

## Development run steps

Run the app:

```bash
npm run dev
```

Run tests:

```bash
npm test
```

Run a production build:

```bash
npm run build
```

## How mock data works

- Mock datasets live under `src/mock-data`.
- Mock providers expose those datasets through typed interfaces.
- App services consume provider outputs and feed engines.
- UI pages consume snapshot services rather than importing static files.
- This keeps the demo consistent while preserving a clean path to live providers later.
- The Alpha Vantage integration is server-side only and flows through internal `/api/market/*` routes.
- If Alpha Vantage is missing, fails, or rate-limits the request, the market routes return deterministic mock fallback data so the dashboard still works.

## Live market data

- Server-only Alpha Vantage access lives in `src/lib/providers/alphaVantage.ts`.
- The dashboard hydrates live watchlist quotes from `/api/market/watchlist`; the frontend never calls Alpha Vantage directly.
- Available internal routes:
  - `GET /api/market/quote?symbol=MSFT`
  - `GET /api/market/candles?symbol=MSFT`
  - `GET /api/market/rsi?symbol=MSFT&interval=daily&timePeriod=14`
  - `GET /api/market/watchlist?limit=5`
  - `GET /api/market/watchlist?category=holdings&symbols=MSFT,NVDA&limit=2`
- `.env.local`, `.next`, and `node_modules` should remain uncommitted. They are already ignored by Git in this project.

## Future live-integration roadmap

1. Replace mock market and macro providers with live vendor adapters.
2. Connect portfolio provider to a brokerage or custody feed.
3. Persist journal actions fully in the database-backed workflow with auth.
4. Add real AI summarization and recommendation calls behind the existing structured agent interfaces.
5. Add monitoring and freshness metadata to provider responses so users can see data staleness directly in the UI.
