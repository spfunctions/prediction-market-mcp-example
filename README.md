# prediction-market-mcp

[![npm](https://img.shields.io/npm/v/prediction-market-mcp)](https://www.npmjs.com/package/prediction-market-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

Minimal **MCP server** that exposes the SimpleFunctions public prediction-market
API to any MCP client — Claude Desktop, Cursor, Windsurf, VS Code Copilot,
mcp-cli. Seven tools, no auth, no rate limit, no API key.

```bash
npx prediction-market-mcp
```

---

## Tools

All seven tools hit the public SimpleFunctions API. **No API key, no rate limit,
no auth.** Every endpoint below is verified live.

| Tool | Endpoint | When to use |
|------|----------|-------------|
| `get_context` | `/api/public/context` | **Start here.** Single bundle: edges, movers, highlights, traditional-market context. |
| `get_world_state` | `/api/agent/world` | ~800-token compressed snapshot of all markets, ideal for system-prompt injection. |
| `get_world_changes` | `/api/agent/world/delta` | ~30-50 token incremental delta — cheap polling. |
| `get_market_edges` | `/api/edges` | Raw mispricings (thesis price vs market price) with reasoning. |
| `get_uncertainty_index` | `/api/public/index` | Single numeric pulse: uncertainty, geopolitical risk, momentum, activity. |
| `get_market_detail` | `/api/public/markets?tickers=` | Full detail for one market (price, bid/ask, volume, optional orderbook depth). |
| `get_ideas` | `/api/public/ideas` | LLM-generated trade ideas with conviction, catalyst, time horizon. |

## Install — Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or
`%APPDATA%/Claude/claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "prediction-markets": {
      "command": "npx",
      "args": ["-y", "prediction-market-mcp"]
    }
  }
}
```

Restart Claude Desktop. The 7 tools should appear in the slash-tool menu.

## Install — Cursor

Add to `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "prediction-markets": {
      "command": "npx",
      "args": ["-y", "prediction-market-mcp"]
    }
  }
}
```

## Install — Windsurf / VS Code Copilot

Both honor the same `mcpServers` shape. Drop the snippet above into your
client's MCP config file.

## Install — mcp-cli (manual testing)

```bash
npx @modelcontextprotocol/inspector npx prediction-market-mcp
```

Opens an interactive inspector at `http://localhost:5173` where you can list
tools and try calls.

## Try it

In Claude Desktop, ask:

> What does the market think the highest geopolitical risk is right now?
> Use get_context first, then drill into the top edge.

Claude will pick `get_context`, summarize the highlights, then call
`get_market_edges` and `get_market_detail` for the top edge.

## Bugfix vs older releases

Versions before `2.1.0` shipped `get_market_detail` calling
`/api/public/market/{ticker}` (singular), which **does not exist** on the live
API and returned a 404 HTML page on every call. The current version routes
through `/api/public/markets?tickers=` (plural) and returns the first match —
verified live.

## Development

```bash
git clone https://github.com/spfunctions/prediction-market-mcp-example
cd prediction-market-mcp-example
npm install
npm run build
node dist/index.js  # speak MCP over stdio
```

The server is a single file (`src/index.ts`, ~150 lines) — easy to read, easy
to adapt as a starting point for your own MCP server.

## Sister packages

| Stack | Package |
|-------|---------|
| Vercel AI SDK | [`vercel-ai-prediction-markets`](https://github.com/spfunctions/vercel-ai-prediction-markets) |
| LangChain / LangGraph | [`langchain-prediction-markets`](https://github.com/spfunctions/langchain-prediction-markets) |
| OpenAI Agents SDK | [`openai-agents-prediction-markets`](https://github.com/spfunctions/openai-agents-prediction-markets) |
| CrewAI (Python) | [`crewai-prediction-markets`](https://github.com/spfunctions/crewai-prediction-markets) |
| Full CLI (more tools, theses, signals) | [`simplefunctions-cli`](https://github.com/spfunctions/simplefunctions-cli) |
| Bare Python SDK | [`simplefunctions-python`](https://github.com/spfunctions/simplefunctions-python) |

## License

MIT — built by [SimpleFunctions](https://simplefunctions.dev).
