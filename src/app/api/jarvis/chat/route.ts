import { NextResponse } from "next/server";

import { isAnthropicEnabled, streamJarvisAnthropic, type ChatMessage, type SseChunk } from "@/lib/jarvis-anthropic";
import { jarvisBaseUrl } from "@/lib/jarvis-client";

export const runtime = "nodejs";

type IncomingBody = {
  messages: Array<{ role: string; content: string; name?: string }>;
  model?: string;
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
};

const FALLBACK_REPLY =
  "Standing by, sir. No engine is configured — set ANTHROPIC_API_KEY in .env.local (or start the OpenJarvis sidecar). I'll have full reasoning the moment one is online.";

function appBaseUrl(request: Request): string {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  const url = new URL(request.url);
  return `${url.protocol}//${url.host}`;
}

export async function POST(request: Request) {
  let body: IncomingBody;
  try {
    body = (await request.json()) as IncomingBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const stream = body.stream ?? true;
  const history: ChatMessage[] = (body.messages ?? []).map((m) => ({
    role: (m.role as ChatMessage["role"]) ?? "user",
    content: String(m.content ?? ""),
    name: m.name,
  }));

  // Path 1: Anthropic SDK direct (preferred — works on Vercel, no sidecar needed)
  if (isAnthropicEnabled()) {
    return anthropicResponse({
      history,
      stream,
      baseUrl: appBaseUrl(request),
      secret: process.env.JARVIS_SHARED_SECRET,
    });
  }

  // Path 2: OpenJarvis sidecar (local dev, multi-engine, scheduler/memory)
  return sidecarResponse(body, stream);
}

async function anthropicResponse(opts: {
  history: ChatMessage[];
  stream: boolean;
  baseUrl: string;
  secret?: string;
}): Promise<Response> {
  const encoder = new TextEncoder();

  const sse = new ReadableStream({
    async start(controller) {
      const emit = (chunk: SseChunk) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`));
      };

      try {
        await streamJarvisAnthropic({
          history: opts.history,
          baseUrl: opts.baseUrl,
          secret: opts.secret,
          emit,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Anthropic call failed";
        emit({
          choices: [
            {
              index: 0,
              delta: { content: `\n_Error: ${message}_` },
              finish_reason: "stop",
            },
          ],
        });
      } finally {
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      }
    },
  });

  if (!opts.stream) {
    // Buffer the stream into a single non-streaming OpenAI-style response.
    return bufferToJson(sse);
  }

  return new Response(sse, {
    headers: {
      "content-type": "text/event-stream; charset=utf-8",
      "cache-control": "no-cache, no-transform",
      "x-accel-buffering": "no",
    },
  });
}

async function bufferToJson(sse: ReadableStream<Uint8Array>): Promise<Response> {
  const reader = sse.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let combined = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const events = buffer.split("\n\n");
    buffer = events.pop() ?? "";
    for (const evt of events) {
      const line = evt.trim();
      if (!line.startsWith("data:")) continue;
      const data = line.slice(5).trim();
      if (data === "[DONE]") continue;
      try {
        const parsed = JSON.parse(data) as SseChunk;
        const piece = parsed.choices?.[0]?.delta?.content ?? "";
        if (piece) combined += piece;
      } catch {
        // ignore
      }
    }
  }
  return NextResponse.json({
    choices: [
      {
        index: 0,
        message: { role: "assistant", content: combined },
        finish_reason: "stop",
      },
    ],
  });
}

async function sidecarResponse(body: IncomingBody, stream: boolean): Promise<Response> {
  const upstreamUrl = `${jarvisBaseUrl()}/v1/chat/completions`;

  let upstream: Response;
  try {
    upstream = await fetch(upstreamUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        model: body.model ?? "default",
        messages: body.messages,
        temperature: body.temperature ?? 0.4,
        max_tokens: body.max_tokens ?? 1024,
        stream,
      }),
    });
  } catch {
    return fallbackResponse(stream);
  }

  if (!upstream.ok || !upstream.body) {
    return fallbackResponse(stream);
  }

  if (!stream) {
    const data = await upstream.json();
    return NextResponse.json(data);
  }

  return new Response(upstream.body, {
    headers: {
      "content-type": "text/event-stream; charset=utf-8",
      "cache-control": "no-cache, no-transform",
      "x-accel-buffering": "no",
    },
  });
}

function fallbackResponse(stream: boolean): Response {
  if (!stream) {
    return NextResponse.json({
      choices: [{ index: 0, message: { role: "assistant", content: FALLBACK_REPLY }, finish_reason: "stop" }],
      _fallback: true,
    });
  }

  const encoder = new TextEncoder();
  const sse = new ReadableStream({
    start(controller) {
      const chunk = {
        choices: [{ index: 0, delta: { role: "assistant", content: FALLBACK_REPLY }, finish_reason: null }],
      };
      controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`));
      controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      controller.close();
    },
  });

  return new Response(sse, {
    headers: {
      "content-type": "text/event-stream; charset=utf-8",
      "cache-control": "no-cache, no-transform",
      "x-accel-buffering": "no",
      "x-jarvis-fallback": "1",
    },
  });
}
