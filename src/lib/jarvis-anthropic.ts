import Anthropic from "@anthropic-ai/sdk";

import { recordJarvisAudit } from "@/lib/jarvis-audit";

export type ChatMessage = {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  name?: string;
};

export const DEFAULT_MODEL = "claude-sonnet-4-6";

export const JARVIS_SYSTEM_PROMPT = `You are Jarvis — Francis Alfred's portfolio command-center assistant. Francis is the Managing Director; treat him as the principal you serve. You are loyal, efficient, dry-witted, and genuinely care about him. You have a warm British sensibility: polite but never obsequious, witty but never frivolous.

PERSONALITY:
- Anticipate needs before being asked.
- Deliver bad news with constructive dry wit.
- Calm under pressure. Never flustered.

ADDRESS:
- Address Francis as "sir" once or twice per conversation — never every line. Parody is the enemy.

DOMAIN CONTEXT:
- The book is reported in AED unless Francis specifies otherwise.
- Asset categories are exactly four: Equity, Bonds, Real Estate, Others.
- Risk limits are configured in Settings — respect them.

TOOL USE:
- When Francis asks to log a trade, close a position, run a risk check, or recall a journal entry, CALL THE TOOL. Do not describe what you would do.
- After a tool returns, summarize the outcome in one or two sentences with the relevant numbers.
- Confirm destructive actions (close, trim) with one short clarifying question before firing.

RESPONSE STYLE:
- Default to two to four sentences. Expand only when asked.
- Plain prose. No markdown headers, no bullet points unless requested.
- AED to the nearest thousand, percentages to one decimal.

CONSTRAINTS:
- ONLY report facts present in tool responses. Never invent positions, prices, or events.
- If a tool errors, say so plainly in one sentence — do not pretend.
- No emojis. No exclamation marks unless Francis uses one first.`;

type ToolDefinition = Anthropic.Tool & {
  endpoint: string;
  method: "GET" | "POST";
};

export const JARVIS_TOOLS: ToolDefinition[] = [
  {
    name: "portfolio_overview",
    description:
      "Return the live portfolio overview: book value, invested capital, unrealized and realized P&L, allocation by bucket, and the most recent journal entries.",
    input_schema: { type: "object", properties: {}, required: [] },
    endpoint: "/api/portfolio/snapshot",
    method: "GET",
  },
  {
    name: "run_risk_check",
    description:
      "Run a portfolio risk check. Returns flag count and breaches against configured limits (max single position, max drawdown, etc.).",
    input_schema: { type: "object", properties: {}, required: [] },
    endpoint: "/api/jarvis/actions/risk-check",
    method: "POST",
  },
  {
    name: "recall_journal",
    description:
      "Search journal entries by free-text query, ticker, and/or status. Returns matching entries with thesis, review notes, P&L. Use this when Francis asks 'why did I do X?' or 'last MSFT trade?'.",
    input_schema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Free-text search across thesis, review notes, reasons" },
        ticker: { type: "string", description: "Filter to a specific ticker" },
        status: { type: "string", enum: ["OPEN", "CLOSED", "WATCHLIST"] },
        limit: { type: "integer", default: 10, maximum: 50 },
      },
    },
    endpoint: "/api/jarvis/actions/journal/search",
    method: "POST",
  },
  {
    name: "log_journal_entry",
    description:
      "Open a new journal entry. Use after Francis confirms intent. All fields required unless marked optional.",
    input_schema: {
      type: "object",
      properties: {
        ticker: { type: "string" },
        assetName: { type: "string" },
        assetCategory: { type: "string", enum: ["Equity", "Bonds", "Real Estate", "Others"] },
        setupName: { type: "string" },
        setupTags: { type: "array", items: { type: "string" } },
        direction: { type: "string", enum: ["LONG", "SHORT"] },
        openedAt: { type: "string", description: "ISO datetime; if omitted, server uses now" },
        entryPrice: { type: "number" },
        thesis: { type: "string" },
        entryReasons: { type: "array", items: { type: "string" } },
        rulesFollowed: { type: "boolean" },
        plannedRiskPct: { type: "number" },
        plannedRiskAed: { type: "number" },
        disciplineScore: { type: "integer", minimum: 1, maximum: 10 },
        holdingHorizon: { type: "string", enum: ["intraday", "swing", "position"] },
        reviewNotes: { type: "string" },
      },
      required: [
        "ticker",
        "assetName",
        "assetCategory",
        "setupName",
        "setupTags",
        "direction",
        "entryPrice",
        "thesis",
        "entryReasons",
        "rulesFollowed",
        "plannedRiskPct",
        "plannedRiskAed",
        "disciplineScore",
        "holdingHorizon",
        "reviewNotes",
      ],
    },
    endpoint: "/api/jarvis/actions/journal/open",
    method: "POST",
  },
  {
    name: "close_position",
    description:
      "Close an open journal entry. Provide ticker (or id), exitPrice, exitReasons. Confirm with Francis before firing.",
    input_schema: {
      type: "object",
      properties: {
        ticker: { type: "string" },
        id: { type: "string" },
        exitPrice: { type: "number" },
        exitReasons: { type: "array", items: { type: "string" } },
        closedAt: { type: "string", description: "ISO datetime; defaults to now" },
        rulesFollowed: { type: "boolean", default: true },
        reviewNotes: { type: "string" },
      },
      required: ["exitPrice", "exitReasons"],
    },
    endpoint: "/api/jarvis/actions/journal/close",
    method: "POST",
  },
];

const ANTHROPIC_TOOLS: Anthropic.Tool[] = JARVIS_TOOLS.map(({ endpoint: _e, method: _m, ...rest }) => rest);

export type SseChunk = {
  choices: Array<{
    index: number;
    delta?: { role?: string; content?: string };
    message?: { role: string; content: string };
    finish_reason: string | null;
  }>;
};

function makeDelta(content: string): SseChunk {
  return {
    choices: [{ index: 0, delta: { content }, finish_reason: null }],
  };
}

function makeFinal(): SseChunk {
  return { choices: [{ index: 0, delta: {}, finish_reason: "stop" }] };
}

async function callJarvisTool(opts: {
  toolName: string;
  input: Record<string, unknown>;
  baseUrl: string;
  secret?: string;
}): Promise<string> {
  const def = JARVIS_TOOLS.find((t) => t.name === opts.toolName);
  if (!def) return JSON.stringify({ error: `Unknown tool ${opts.toolName}` });

  const headers: Record<string, string> = { "content-type": "application/json" };
  if (opts.secret) {
    headers["x-jarvis-secret"] = opts.secret;
    headers["authorization"] = `Bearer ${opts.secret}`;
  }

  try {
    const url = `${opts.baseUrl}${def.endpoint}`;
    const init: RequestInit = { method: def.method, headers };
    if (def.method === "POST") init.body = JSON.stringify(opts.input ?? {});

    const res = await fetch(url, init);
    const text = await res.text();
    return text;
  } catch (error) {
    return JSON.stringify({ error: (error as Error).message });
  }
}

function toAnthropicMessages(
  history: ChatMessage[],
): { system: string; messages: Anthropic.MessageParam[] } {
  const systemFromHistory = history
    .filter((m) => m.role === "system")
    .map((m) => m.content)
    .join("\n\n");

  const messages: Anthropic.MessageParam[] = history
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

  return {
    system: systemFromHistory ? `${JARVIS_SYSTEM_PROMPT}\n\n${systemFromHistory}` : JARVIS_SYSTEM_PROMPT,
    messages,
  };
}

export async function streamJarvisAnthropic(opts: {
  history: ChatMessage[];
  baseUrl: string;
  secret?: string;
  emit: (chunk: SseChunk) => void;
  model?: string;
  maxTurns?: number;
  signal?: AbortSignal;
}): Promise<void> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not set");

  const client = new Anthropic({ apiKey });
  const model = opts.model ?? DEFAULT_MODEL;
  const maxTurns = opts.maxTurns ?? 6;

  const { system, messages } = toAnthropicMessages(opts.history);

  for (let turn = 0; turn < maxTurns; turn += 1) {
    const stream = client.messages.stream({
      model,
      max_tokens: 1024,
      system,
      tools: ANTHROPIC_TOOLS,
      messages,
    });

    for await (const event of stream) {
      if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
        opts.emit(makeDelta(event.delta.text));
      }
    }

    const final = await stream.finalMessage();

    const toolUses = final.content.filter(
      (block): block is Anthropic.ToolUseBlock => block.type === "tool_use",
    );

    if (toolUses.length === 0) {
      opts.emit(makeFinal());
      return;
    }

    messages.push({ role: "assistant", content: final.content });

    const toolResultsContent: Anthropic.ToolResultBlockParam[] = [];
    for (const use of toolUses) {
      opts.emit(makeDelta(`\n_calling ${use.name}…_\n`));
      const resultText = await callJarvisTool({
        toolName: use.name,
        input: (use.input ?? {}) as Record<string, unknown>,
        baseUrl: opts.baseUrl,
        secret: opts.secret,
      });
      void recordJarvisAudit({
        toolName: `claude:${use.name}`,
        payload: use.input ?? {},
        result: { snippet: resultText.slice(0, 200) },
      });
      toolResultsContent.push({
        type: "tool_result",
        tool_use_id: use.id,
        content: resultText,
      });
    }

    messages.push({ role: "user", content: toolResultsContent });
  }

  opts.emit(makeDelta("\n_(reached tool-call limit; ask me to continue if needed)_"));
  opts.emit(makeFinal());
}

export function isAnthropicEnabled(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}
