"""Build and store the morning digest.

Designed to run on a 07:00 GST cron (configured in OpenJarvis or the OS scheduler):

    cd jarvis-sidecar/openjarvis
    NEXT_APP_URL=http://localhost:3000 \
    JARVIS_BASE_URL=http://localhost:8000 \
    JARVIS_SHARED_SECRET=... \
    uv run python ../scripts/morning_digest.py

The script:
    1. Pulls the portfolio + risk snapshot via the connector
    2. Asks Jarvis to render it as a spoken-style briefing in the MD persona
    3. POSTs the script back to /api/jarvis/actions/digest/store so the dock
       "Briefing" tab can render it
"""

from __future__ import annotations

import json
import os
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict

import httpx

# Allow `from connectors.portfolio import collect_portfolio_section` when run from anywhere.
ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from connectors.portfolio import collect_portfolio_section  # noqa: E402


def _next_app_url() -> str:
    return os.environ.get("NEXT_APP_URL", "http://localhost:3000").rstrip("/")


def _jarvis_url() -> str:
    return os.environ.get("JARVIS_BASE_URL", "http://localhost:8000").rstrip("/")


def _auth_headers() -> Dict[str, str]:
    secret = os.environ.get("JARVIS_SHARED_SECRET", "")
    if not secret:
        return {}
    return {"Authorization": f"Bearer {secret}", "x-jarvis-secret": secret}


def render_briefing(section: Dict[str, Any]) -> str:
    """Ask the Jarvis sidecar to turn the raw section into a spoken briefing."""
    prompt = (
        "You are Jarvis. Deliver a short morning briefing to the MD in spoken style — "
        "two short paragraphs, no markdown, no bullet points, no headers. "
        "Use the data below verbatim; do not invent positions or numbers. "
        "Address the user as 'sir' once near the start.\n\n"
        f"Date: {datetime.now(timezone.utc).strftime('%A %d %B %Y')}\n"
        f"Portfolio facts:\n- " + "\n- ".join(section["lines"])
    )

    payload = {
        "model": "default",
        "messages": [
            {"role": "system", "content": "You are Jarvis. Concise, dry-witted, never invents."},
            {"role": "user", "content": prompt},
        ],
        "stream": False,
        "temperature": 0.5,
        "max_tokens": 400,
    }

    with httpx.Client(timeout=60.0) as client:
        response = client.post(f"{_jarvis_url()}/v1/chat/completions", json=payload)
        response.raise_for_status()
        data = response.json()

    return (
        data.get("choices", [{}])[0].get("message", {}).get("content")
        or "Briefing unavailable — Jarvis returned no content."
    )


def store_digest(script_text: str, sections: Dict[str, Any]) -> None:
    body = {
        "scriptText": script_text,
        "timezone": os.environ.get("DIGEST_TIMEZONE", "Asia/Dubai"),
        "sections": sections,
    }
    with httpx.Client(timeout=20.0, headers=_auth_headers()) as client:
        response = client.post(f"{_next_app_url()}/api/jarvis/actions/digest/store", json=body)
        response.raise_for_status()


def main() -> int:
    section = collect_portfolio_section()
    script_text = render_briefing(section)
    print(script_text)
    print("\n— storing digest in app …")
    store_digest(script_text, {"portfolio": section})
    print("Done.")
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except httpx.HTTPError as err:
        print(f"Digest failed: {err}", file=sys.stderr)
        sys.exit(1)
