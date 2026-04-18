"""Portfolio connector for the OpenJarvis morning digest.

Pulls the live portfolio snapshot from the Next.js app and renders a compact
text section that the digest agent can consume alongside calendar/world feeds.
"""

from __future__ import annotations

import os
from typing import Any, Dict

import httpx


def _app_url() -> str:
    return os.environ.get("NEXT_APP_URL", "http://localhost:3000").rstrip("/")


def _auth_headers() -> Dict[str, str]:
    secret = os.environ.get("JARVIS_SHARED_SECRET", "")
    if not secret:
        return {}
    return {"Authorization": f"Bearer {secret}", "x-jarvis-secret": secret}


def collect_portfolio_section() -> Dict[str, Any]:
    """Return a digest section with portfolio snapshot, risk flags, and recent activity.

    Shape consumed by the digest pipeline:
        {
            "title": str,
            "lines": [str, ...],
            "data": {...},   # raw snapshot for downstream prompts
        }
    """
    with httpx.Client(timeout=20.0, headers=_auth_headers()) as client:
        snapshot = client.get(f"{_app_url()}/api/portfolio/snapshot").json()
        risk = client.post(f"{_app_url()}/api/jarvis/actions/risk-check", json={}).json()

    currency = snapshot.get("settings", {}).get("reportingCurrency", "AED")
    book = snapshot.get("currentValueAed", 0)
    invested = snapshot.get("totalInvestedAed", 0)
    unrealized = snapshot.get("unrealizedPnlAed", 0)
    realized = snapshot.get("realizedPnlAed", 0)

    movers = sorted(snapshot.get("activeItems", []), key=lambda i: i.get("pnlAed", 0), reverse=True)
    top = movers[0] if movers else None
    worst = movers[-1] if movers and len(movers) > 1 else None

    lines = [
        f"Book value: {currency} {book:,.0f} (invested {currency} {invested:,.0f}).",
        f"Unrealized P&L: {currency} {unrealized:,.0f}. Realized to date: {currency} {realized:,.0f}.",
    ]
    if top:
        lines.append(f"Best mover: {top.get('name')} at {currency} {top.get('pnlAed', 0):,.0f}.")
    if worst and worst is not top:
        lines.append(f"Worst mover: {worst.get('name')} at {currency} {worst.get('pnlAed', 0):,.0f}.")

    flag_count = risk.get("flagCount", 0)
    if flag_count:
        flag_summary = "; ".join(f.get("detail", "") for f in risk.get("flags", []))
        lines.append(f"Risk flags ({flag_count}): {flag_summary}")
    else:
        lines.append("No risk-limit breaches.")

    return {
        "title": "Portfolio",
        "lines": lines,
        "data": {"snapshot": snapshot, "risk": risk},
    }


if __name__ == "__main__":
    section = collect_portfolio_section()
    print(section["title"])
    for line in section["lines"]:
        print(f"  - {line}")
