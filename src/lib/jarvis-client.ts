export type JarvisChatMessage = {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  name?: string;
};

export type JarvisChatRequest = {
  model?: string;
  messages: JarvisChatMessage[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
};

const DEFAULT_BASE_URL = "http://localhost:8000";

export function jarvisBaseUrl(): string {
  return process.env.JARVIS_BASE_URL?.trim() || DEFAULT_BASE_URL;
}

export async function jarvisHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${jarvisBaseUrl()}/health`, { cache: "no-store" });
    return res.ok;
  } catch {
    return false;
  }
}

export async function jarvisChat(payload: JarvisChatRequest, init?: RequestInit) {
  const body: JarvisChatRequest = {
    model: payload.model ?? "default",
    temperature: payload.temperature ?? 0.4,
    max_tokens: payload.max_tokens ?? 1024,
    stream: payload.stream ?? false,
    messages: payload.messages,
  };

  return fetch(`${jarvisBaseUrl()}/v1/chat/completions`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
    ...init,
  });
}

export async function jarvisChatJson(payload: JarvisChatRequest): Promise<string> {
  const res = await jarvisChat({ ...payload, stream: false });
  if (!res.ok) {
    throw new Error(`Jarvis HTTP ${res.status}`);
  }
  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  return data.choices?.[0]?.message?.content ?? "";
}
