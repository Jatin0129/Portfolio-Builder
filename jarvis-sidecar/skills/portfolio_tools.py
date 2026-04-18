"""Custom OpenJarvis tools for the MD Command Center.

Each tool calls into the Next.js app over HTTP rather than touching the database
directly, so the same code path that the UI uses is the one Jarvis uses.

To register: drop this file into the OpenJarvis `tools/` discovery path, or import
from a custom skills directory configured in `~/.openjarvis/config.toml` under
`[tools] enabled`.

Environment:
    NEXT_APP_URL          base URL of the Next.js app (default http://localhost:3000)
    JARVIS_SHARED_SECRET  required for any /api/jarvis/actions/* call
"""

from __future__ import annotations

import os
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

import httpx

try:
    from openjarvis.tools._stubs import BaseTool, ToolSpec  # type: ignore
    from openjarvis.core.registry import ToolRegistry  # type: ignore
except Exception:  # pragma: no cover - allows static import without OpenJarvis present
    BaseTool = object  # type: ignore[misc,assignment]
    ToolSpec = dict    # type: ignore[misc,assignment]

    class _NoopRegistry:
        @staticmethod
        def register(_name):
            def deco(cls):
                return cls
            return deco

    ToolRegistry = _NoopRegistry  # type: ignore[assignment]


def _app_url() -> str:
    return os.environ.get("NEXT_APP_URL", "http://localhost:3000").rstrip("/")


def _auth_headers() -> Dict[str, str]:
    secret = os.environ.get("JARVIS_SHARED_SECRET", "")
    if not secret:
        return {}
    return {"Authorization": f"Bearer {secret}", "x-jarvis-secret": secret}


def _http_get(path: str, params: Optional[Dict[str, Any]] = None) -> Any:
    with httpx.Client(timeout=20.0) as client:
        response = client.get(f"{_app_url()}{path}", params=params, headers=_auth_headers())
        response.raise_for_status()
        return response.json()


def _http_post(path: str, payload: Dict[str, Any]) -> Any:
    with httpx.Client(timeout=20.0) as client:
        response = client.post(f"{_app_url()}{path}", json=payload, headers=_auth_headers())
        response.raise_for_status()
        return response.json()


@ToolRegistry.register("portfolio_overview")
class PortfolioOverviewTool(BaseTool):
    """Fetch the live portfolio snapshot — value, P&L, allocation, recent activity."""

    name = "portfolio_overview"
    description = "Return the current portfolio overview: book value, invested capital, unrealized and realized P&L, allocation by bucket, and the most recent journal entries."

    @property
    def spec(self) -> Any:
        return {
            "name": self.name,
            "description": self.description,
            "parameters": {"type": "object", "properties": {}, "required": []},
        }

    def execute(self, **_: Any) -> Dict[str, Any]:
        return _http_get("/api/portfolio/snapshot")


@ToolRegistry.register("market_pulse")
class MarketPulseTool(BaseTool):
    name = "market_pulse"
    description = "Get a quick price quote for one or more tickers (comma-separated)."

    @property
    def spec(self) -> Any:
        return {
            "name": self.name,
            "description": self.description,
            "parameters": {
                "type": "object",
                "properties": {"symbols": {"type": "string", "description": "Comma-separated ticker symbols, e.g. 'NVDA,TSLA,SPY'"}},
                "required": ["symbols"],
            },
        }

    def execute(self, symbols: str, **_: Any) -> Any:
        symbol = symbols.split(",")[0].strip().upper()
        return _http_get("/api/market/quote", params={"symbol": symbol})


@ToolRegistry.register("log_journal_entry")
class LogJournalEntryTool(BaseTool):
    name = "log_journal_entry"
    description = (
        "Open a new journal entry. Required: ticker, assetName, assetCategory "
        "(Equity|Bonds|Real Estate|Others), setupName, setupTags (array), direction (LONG|SHORT), "
        "openedAt (ISO datetime), entryPrice, thesis, entryReasons (array), rulesFollowed (bool), "
        "plannedRiskPct, plannedRiskAed, disciplineScore (1-10), holdingHorizon "
        "(intraday|swing|position), reviewNotes."
    )

    @property
    def spec(self) -> Any:
        return {
            "name": self.name,
            "description": self.description,
            "parameters": {
                "type": "object",
                "properties": {
                    "ticker": {"type": "string"},
                    "assetName": {"type": "string"},
                    "assetCategory": {"type": "string", "enum": ["Equity", "Bonds", "Real Estate", "Others"]},
                    "setupName": {"type": "string"},
                    "setupTags": {"type": "array", "items": {"type": "string"}},
                    "direction": {"type": "string", "enum": ["LONG", "SHORT"]},
                    "openedAt": {"type": "string", "format": "date-time"},
                    "entryPrice": {"type": "number"},
                    "investedAmountAed": {"type": "number"},
                    "quantity": {"type": "number"},
                    "thesis": {"type": "string"},
                    "entryReasons": {"type": "array", "items": {"type": "string"}},
                    "rulesFollowed": {"type": "boolean"},
                    "plannedRiskPct": {"type": "number"},
                    "plannedRiskAed": {"type": "number"},
                    "disciplineScore": {"type": "integer", "minimum": 1, "maximum": 10},
                    "holdingHorizon": {"type": "string", "enum": ["intraday", "swing", "position"]},
                    "reviewNotes": {"type": "string"},
                },
                "required": [
                    "ticker", "assetName", "assetCategory", "setupName", "setupTags",
                    "direction", "openedAt", "entryPrice", "thesis", "entryReasons",
                    "rulesFollowed", "plannedRiskPct", "plannedRiskAed",
                    "disciplineScore", "holdingHorizon", "reviewNotes",
                ],
            },
        }

    def execute(self, **payload: Any) -> Any:
        if "openedAt" not in payload or not payload["openedAt"]:
            payload["openedAt"] = datetime.now(timezone.utc).isoformat()
        return _http_post("/api/jarvis/actions/journal/open", payload)


@ToolRegistry.register("close_position")
class ClosePositionTool(BaseTool):
    name = "close_position"
    description = "Close an open journal entry. Provide ticker (or id), exitPrice, and exitReasons. closedAt defaults to now."

    @property
    def spec(self) -> Any:
        return {
            "name": self.name,
            "description": self.description,
            "parameters": {
                "type": "object",
                "properties": {
                    "ticker": {"type": "string"},
                    "id": {"type": "string"},
                    "exitPrice": {"type": "number"},
                    "exitReasons": {"type": "array", "items": {"type": "string"}},
                    "closedAt": {"type": "string", "format": "date-time"},
                    "rulesFollowed": {"type": "boolean", "default": True},
                    "reviewNotes": {"type": "string"},
                },
                "required": ["exitPrice", "exitReasons"],
            },
        }

    def execute(self, **payload: Any) -> Any:
        return _http_post("/api/jarvis/actions/journal/close", payload)


@ToolRegistry.register("run_risk_check")
class RunRiskCheckTool(BaseTool):
    name = "run_risk_check"
    description = "Run a portfolio risk check. Returns flag count and a list of breaches against the configured limits."

    @property
    def spec(self) -> Any:
        return {
            "name": self.name,
            "description": self.description,
            "parameters": {"type": "object", "properties": {}, "required": []},
        }

    def execute(self, **_: Any) -> Any:
        return _http_post("/api/jarvis/actions/risk-check", {})


@ToolRegistry.register("recall_journal")
class RecallJournalTool(BaseTool):
    name = "recall_journal"
    description = "Search journal entries by free-text query, ticker, and/or status. Returns matching entries with thesis and review notes."

    @property
    def spec(self) -> Any:
        return {
            "name": self.name,
            "description": self.description,
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {"type": "string"},
                    "ticker": {"type": "string"},
                    "status": {"type": "string", "enum": ["OPEN", "CLOSED", "WATCHLIST"]},
                    "limit": {"type": "integer", "default": 10, "maximum": 100},
                },
            },
        }

    def execute(self, **payload: Any) -> Any:
        return _http_post("/api/jarvis/actions/journal/search", payload)


__all__: List[str] = [
    "PortfolioOverviewTool",
    "MarketPulseTool",
    "LogJournalEntryTool",
    "ClosePositionTool",
    "RunRiskCheckTool",
    "RecallJournalTool",
]
