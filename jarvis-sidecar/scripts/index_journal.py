"""Index the MD's journal entries into OpenJarvis Memory (SQLite/FTS5).

Run after any meaningful batch of journal updates so Jarvis can recall
"why did I exit MSFT in March?" with citations.

Usage:
    cd jarvis-sidecar/openjarvis
    NEXT_APP_URL=http://localhost:3000 \
    JARVIS_SHARED_SECRET=... \
    uv run python ../scripts/index_journal.py
"""

from __future__ import annotations

import os
import sys
from typing import Any, Dict, Iterable

import httpx


def _app_url() -> str:
    return os.environ.get("NEXT_APP_URL", "http://localhost:3000").rstrip("/")


def _auth_headers() -> Dict[str, str]:
    secret = os.environ.get("JARVIS_SHARED_SECRET", "")
    if not secret:
        return {}
    return {"Authorization": f"Bearer {secret}", "x-jarvis-secret": secret}


def fetch_entries() -> Iterable[Dict[str, Any]]:
    with httpx.Client(timeout=30.0, headers=_auth_headers()) as client:
        response = client.get(f"{_app_url()}/api/journal/export")
        response.raise_for_status()
        return response.json().get("entries", [])


def entry_to_document(entry: Dict[str, Any]) -> Dict[str, Any]:
    parts = [
        f"# {entry.get('ticker')} — {entry.get('assetName') or entry.get('ticker')}",
        f"Status: {entry.get('status')} · Direction: {entry.get('direction')} · Setup: {entry.get('setupName')}",
        f"Opened: {entry.get('openedAt')}",
    ]
    if entry.get("closedAt"):
        parts.append(f"Closed: {entry.get('closedAt')}")
    if entry.get("realizedPnlAed") is not None:
        parts.append(
            f"Realized P&L: AED {entry.get('realizedPnlAed'):,.0f} ({entry.get('realizedPnlPct')}%, R={entry.get('outcomeR')})"
        )
    parts.append("\nThesis:\n" + (entry.get("thesis") or ""))
    if entry.get("entryReasons"):
        parts.append("Entry reasons: " + ", ".join(entry.get("entryReasons", [])))
    if entry.get("exitReasons"):
        parts.append("Exit reasons: " + ", ".join(entry.get("exitReasons", [])))
    if entry.get("mistakeTag"):
        parts.append(f"Mistake tag: {entry.get('mistakeTag')}")
    if entry.get("reviewNotes"):
        parts.append("Review:\n" + entry.get("reviewNotes"))

    return {
        "id": f"journal:{entry['id']}",
        "title": f"{entry.get('ticker')} ({entry.get('status')})",
        "text": "\n".join(parts),
        "metadata": {
            "source": "journal",
            "ticker": entry.get("ticker"),
            "status": entry.get("status"),
            "openedAt": entry.get("openedAt"),
            "closedAt": entry.get("closedAt"),
        },
    }


def index(documents: list[Dict[str, Any]]) -> int:
    """Push documents into OpenJarvis Memory.

    Falls back to writing each document under ~/.openjarvis/memory/journal/ as
    a markdown file when the Python SDK isn't importable, so the next
    `jarvis memory index` run picks them up.
    """
    try:
        from openjarvis.memory.ingest import ingest_documents  # type: ignore

        ingest_documents(documents, namespace="journal")
        return len(documents)
    except Exception:
        from pathlib import Path

        out_dir = Path.home() / ".openjarvis" / "memory" / "journal"
        out_dir.mkdir(parents=True, exist_ok=True)
        for doc in documents:
            (out_dir / f"{doc['id'].replace(':', '_')}.md").write_text(doc["text"], encoding="utf-8")
        print(
            f"  ! OpenJarvis SDK not available — wrote {len(documents)} markdown files to {out_dir}.",
            f"\n  Run `jarvis memory index {out_dir}` to ingest them.",
        )
        return len(documents)


def main() -> int:
    entries = list(fetch_entries())
    if not entries:
        print("No journal entries found. Nothing to index.")
        return 0

    documents = [entry_to_document(entry) for entry in entries]
    indexed = index(documents)
    print(f"Indexed {indexed} journal entries into OpenJarvis Memory.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
