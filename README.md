# MDB Journal

MDB Journal is a Next.js App Router portfolio journal and investment tracker for a single-user workflow. It is designed to run well on Vercel, install like a PWA, and persist journal and settings data in Postgres through Prisma so the product can grow into richer analytics over time.

## Project purpose

MDB Journal is built around a simple core workflow:

- record investments and journal activity
- review holdings across Equity, Bonds, Real Estate, and Others
- keep portfolio history in a durable database
- unlock more advanced analytics as the dataset grows

The app still includes live market and research modules, but the primary product is now the portfolio journal.

## Architecture overview

```text
src/
  app/                 Next.js App Router pages, metadata files, and API routes
  components/          Shared UI primitives, PWA registration, charts, layout, and page views
  engines/             Pure scoring and decision logic used by secondary research modules
  lib/                 Framework, Prisma, provider, and utility helpers
  mock-data/           Deterministic demo datasets and seed-friendly records
  providers/           Typed provider interfaces plus mock and persistence implementations
  schemas/             Zod request validation
  services/            Snapshot builders, journal logic, settings logic, and MDB portfolio services
  types/               Shared domain models and view-model contracts
prisma/
  schema.prisma        Postgres schema
  seed.ts              Seed entrypoint
public/
  sw.js                Service worker
  offline.html         Offline fallback
  icons/               PWA manifest icons
```

## Page overview

- `/`
  - Portfolio overview with category allocation, active investments, and recent journal activity.
- `/portfolio-risk`
  - Investment table grouped into Equity, Bonds, Real Estate, and Others.
- `/journal-review`
  - Journal log with add-entry and close-entry workflows, analytics, and behavior review.
- `/settings`
  - Capital, risk, alert thresholds, asset-universe preferences, and operating profile.
- `/market-feed`
  - Live market feed for tracked symbols using internal server-side market routes.
- `/intelligence`
  - Secondary research page for macro, geopolitical, and catalyst context.

## PWA support

The app now includes the core PWA pieces required for installability:

- `src/app/manifest.ts`
  - Web app manifest generated through the App Router metadata file convention
- `src/app/icon.tsx` and `src/app/apple-icon.tsx`
  - Generated app icons
- `src/components/pwa/pwa-register.tsx`
  - Client-side service worker registration
- `public/sw.js`
  - Service worker with cached app-shell routes and offline fallback behavior
- `public/offline.html`
  - Offline screen when the network is unavailable

For installation in production, the app must be served over HTTPS. Vercel provides HTTPS automatically for deployed environments.

## Database and analytics notes

Prisma currently stores:

- `UserSettings`
- `JournalEntry`
- seeded market-facing tables such as assets, holdings, watchlist items, macro events, and geopolitical events

Persistence-backed providers currently exist for:

- settings
- journal entries
- portfolio holdings and watchlist reads

Journal and portfolio tables now include indexing that helps future analytics queries scale more cleanly.

When the database is unavailable, the app falls back safely to mock providers so the demo still renders.

## Environment variables

Use server-side environment variables only. Do not hardcode secrets.

```env
DATABASE_URL="postgresql://user:password@localhost:5432/mdb_journal"
ALPHA_VANTAGE_API_KEY=""
```

Future live integrations will likely add placeholders such as:

```env
OPENAI_API_KEY=""
NEWS_API_KEY=""
MACRO_DATA_API_KEY=""
BROKER_API_KEY=""
```

## Local setup

1. Install dependencies

```bash
npm install
```

2. Create local environment variables

```bash
cp .env.example .env.local
```

3. Add your database and Alpha Vantage key to `.env.local`

```env
DATABASE_URL="postgresql://user:password@localhost:5432/mdb_journal"
ALPHA_VANTAGE_API_KEY="your_alpha_vantage_key"
```

4. Generate Prisma Client

```bash
npm run db:generate
```

5. Push the schema

```bash
npm run db:push
```

6. Seed the database

```bash
npm run db:seed
```

7. Run the app

```bash
npm run dev
```

## Vercel deployment

Recommended production path:

1. Push the repo to GitHub.
2. Import the repo into Vercel.
3. In Vercel, open the `Storage` tab and connect a Postgres database.
4. Ensure `DATABASE_URL` is available in the Vercel project environment.
5. Add `ALPHA_VANTAGE_API_KEY` in the Vercel environment variables.
6. Apply the schema before or during rollout:

```bash
npx prisma db push
```

7. Deploy the app.

For local development against the same Vercel-linked database:

```bash
vercel env pull .env.local
```

The project already includes `postinstall: prisma generate`, which is important so Prisma Client is generated during Vercel builds.

## Jarvis (AI assistant)

Jarvis runs in **two modes**, picked automatically at request time:

1. **Anthropic-direct (recommended, deployed-PWA-friendly)** — set `ANTHROPIC_API_KEY` in `.env.local` and Jarvis calls Claude Sonnet 4.6 directly from the Next.js server with native tool-calling. No sidecar required. Works on Vercel.
2. **OpenJarvis sidecar (local-dev power user)** — optional Python sidecar at `localhost:8000` that adds multi-engine support, scheduler, and memory recall. Used as fallback when `ANTHROPIC_API_KEY` is empty. See [jarvis-sidecar/README.md](jarvis-sidecar/README.md).

### Quick start (Anthropic-direct)

1. Get an API key at https://console.anthropic.com/
2. Add to `.env.local`:
   ```env
   ANTHROPIC_API_KEY="sk-ant-..."
   JARVIS_SHARED_SECRET="any-random-string"
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   ```
3. `npm run dev` — open the app, type into the Jarvis dock.

Jarvis ships with 5 tools that Claude calls automatically when needed:

| Tool | Triggers on |
|---|---|
| `portfolio_overview` | "What's the book?", "How am I doing?" |
| `recall_journal` | "Why did I exit MSFT?", "Last NVDA trade" |
| `run_risk_check` | "Run a risk check", "Any breaches?" |
| `log_journal_entry` | "Log a buy of TSLA at 245…" |
| `close_position` | "Close my TSLA position at 268" |

Every tool call is recorded in the `JarvisAuditLog` table and shown in the dock's **Activity** tab.

### Optional: OpenJarvis sidecar

Only needed if you want local Ollama, the cron-based morning digest, or OpenJarvis's research features. See [jarvis-sidecar/README.md](jarvis-sidecar/README.md). Quick scripts from the repo root:

```bash
npm run jarvis:serve          # starts OpenJarvis on :8000
npm run jarvis:index-journal  # one-shot: index journal entries into Memory
npm run jarvis:digest         # build today's morning briefing
```

The dock degrades to a stub message when neither path is available, so the UI keeps working.

## Development commands

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
- Mock providers live under `src/providers/mock`.
- Persistence-backed providers live under `src/providers/persistence`.
- App services consume provider outputs and feed engines.
- UI pages consume snapshot services rather than importing static files directly.
- The Alpha Vantage integration is server-side only and flows through internal `/api/market/*` routes.
- If Alpha Vantage is missing, fails, or rate-limits the request, the market routes return deterministic mock fallback data so the app keeps working.

## Future analytics roadmap

1. Move holdings and transactions from seeded demo records to full user-managed CRUD workflows.
2. Add time-based portfolio snapshots so performance can be measured across weeks, months, and regimes.
3. Add database-backed analytics materialization for faster dashboard summaries at scale.
4. Connect portfolio providers to brokerage, custody, or property data sources.
5. Add real AI summarization and recommendation calls behind the existing structured agent interfaces.
