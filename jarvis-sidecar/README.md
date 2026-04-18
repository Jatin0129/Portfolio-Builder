# Jarvis sidecar

OpenJarvis local AI assistant for the MD Command Center. Runs as a separate Python process; the Next.js app talks to it over HTTP at `localhost:8000`.

## One-time setup

1. Install prerequisites:

   - **Python 3.10+** — https://www.python.org/downloads/
   - **uv** — `curl -LsSf https://astral.sh/uv/install.sh | sh` (or `brew install uv`)
   - **Rust** — https://rustup.rs (required for the OpenJarvis Rust extension)

2. Clone OpenJarvis into this folder:

   ```bash
   cd jarvis-sidecar
   git clone https://github.com/open-jarvis/OpenJarvis.git openjarvis
   cd openjarvis
   uv sync --extra server
   uv run maturin develop -m rust/crates/openjarvis-python/Cargo.toml
   ```

3. Pick an inference engine (one of):

   - **Ollama (recommended for local)**: install from https://ollama.com, then `ollama serve &` and `ollama pull qwen3:8b`
   - **Cloud (Anthropic/OpenAI)**: edit `config.toml` to set `[engine] default = "cloud"` and export the corresponding API key

4. Copy this repo's config and persona into the OpenJarvis user dir:

   ```bash
   mkdir -p ~/.openjarvis
   cp ../config.toml ~/.openjarvis/config.toml
   mkdir -p ~/.openjarvis/prompts/personas
   cp ../personas/mdb.md ~/.openjarvis/prompts/personas/mdb.md
   ```

5. Set the shared secret so the sidecar's tools can call back into the Next.js app:

   ```bash
   export JARVIS_SHARED_SECRET="$(node -e 'console.log(require(\"crypto\").randomBytes(24).toString(\"hex\"))')"
   export NEXT_APP_URL="http://localhost:3000"
   ```

   And put the **same** secret into the Next.js `.env.local`:

   ```env
   JARVIS_SHARED_SECRET="<the-secret-you-just-generated>"
   ```

## Run

From the repo root:

```bash
npm run jarvis:serve
```

Or directly:

```bash
cd jarvis-sidecar/openjarvis && uv run jarvis serve --port 8000
```

Verify:

```bash
curl http://localhost:8000/health
curl http://localhost:8000/v1/models
```

## What lives here

| File | What it does |
|------|--------------|
| `config.toml` | OpenJarvis config — engine, agent, persona, scheduler. Copy to `~/.openjarvis/config.toml`. |
| `personas/mdb.md` | The Jarvis voice tuned for the MD context (AED reporting, portfolio focus, risk discipline). |
| `skills/portfolio_tools.py` | Six custom tools (portfolio_overview, log_journal_entry, close_position, market_pulse, run_risk_check, recall_journal) that call back into the Next.js app. Drop into the OpenJarvis `tools` discovery path or import from a custom skills dir. |
| `connectors/portfolio.py` | Morning-digest connector that pulls the portfolio snapshot + recent journal activity. |
| `scripts/index_journal.py` | One-shot script that pulls all journal entries from `/api/journal/export` and ingests them into OpenJarvis Memory (SQLite/FTS5). |
| `scripts/morning_digest.py` | Builds and POSTs the daily digest to the Next.js app so the dock "Briefing" tab can render it. Intended to run via OpenJarvis scheduler at 07:00 GST. |

## Operating model

```
Next.js (port 3000)  ⇄  /api/jarvis/chat        ⇄  OpenJarvis (port 8000)
                     ⇄  /api/jarvis/actions/*   ⇄  OpenJarvis tools
```

The Next.js app is the source of truth for portfolio state. Jarvis tools never touch the database directly — they call HTTP endpoints in the Next.js app, which go through the same Zod schemas, services, and Prisma providers as the UI does. This keeps one code path for every state mutation.
