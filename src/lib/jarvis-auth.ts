const SECRET_HEADER = "x-jarvis-secret";

export function isAuthorizedJarvisRequest(request: Request): boolean {
  const expected = process.env.JARVIS_SHARED_SECRET;
  if (!expected) {
    // No secret configured — only allow when explicitly running locally without a secret.
    return process.env.NODE_ENV !== "production";
  }

  const headerValue = request.headers.get(SECRET_HEADER);
  if (headerValue && headerValue === expected) return true;

  const auth = request.headers.get("authorization");
  if (auth && auth === `Bearer ${expected}`) return true;

  return false;
}

export function unauthorizedJarvisResponse() {
  return new Response(JSON.stringify({ error: "Unauthorized Jarvis request" }), {
    status: 401,
    headers: { "content-type": "application/json" },
  });
}
