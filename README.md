# prediction-market-mcp

A minimal MCP server that gives any AI assistant access to prediction market data.

Works with **Claude Desktop**, **Cursor**, **VS Code Copilot**, **Claude Code**, and any other [MCP](https://modelcontextprotocol.io)-compatible client.

## Quick start

```bash
npx prediction-market-mcp
```

That's it. The server starts on stdio and is ready to be used by any MCP client.

## Setup

### Claude Desktop

Add to your `claude_desktop_config.json` (Settings > Developer > Edit Config):

```json
{
  "mcpServers": {
    "prediction-markets": {
      "command": "npx",
      "args": ["prediction-market-mcp"]
    }
  }
}
```

### Cursor

Add to `.cursor/mcp.json` in your project root (or global settings):

```json
{
  "mcpServers": {
    "prediction-markets": {
      "command": "npx",
      "args": ["prediction-market-mcp"]
    }
  }
}
```

### VS Code / Copilot

Add to `.vscode/mcp.json`:

```json
{
  "servers": {
    "prediction-markets": {
      "command": "npx",
      "args": ["prediction-market-mcp"]
    }
  }
}
```

### Claude Code

```bash
claude mcp add prediction-markets -- npx prediction-market-mcp
```

Or use the hosted SimpleFunctions MCP server directly:

```bash
claude mcp add simplefunctions --url https://simplefunctions.dev/api/mcp/mcp
```

## Tools

### `get_world_state`

Returns a structured snapshot of what prediction markets are pricing across geopolitics, economics, tech, and more.

**Parameters:**
- `format` (optional): `"markdown"` (default) or `"json"`

**Example output (markdown):**
```
# World State — 2026-04-06

## Geopolitics
- US recession in 2026: 32% (+3pp)
- China Taiwan action by 2027: 8%

## Markets
- BTC above $100k by Dec: 62%
- Fed rate cut in June: 45% (-5pp)
...
```

### `get_uncertainty_index`

Returns the 4-signal uncertainty index — a composite measure of global uncertainty derived from prediction market movements.

**Signals:**
1. Market entropy — how spread out prices are across markets
2. Price velocity — rate of price changes over the last 24h
3. Volume dispersion — how unevenly volume is distributed
4. Cross-market correlation — whether unrelated markets are moving together

**Example output:**
```json
{
  "composite": 62,
  "signals": {
    "market_entropy": 58,
    "price_velocity": 71,
    "volume_dispersion": 55,
    "cross_market_correlation": 64
  },
  "interpretation": "Elevated uncertainty. Markets are repricing multiple macro scenarios simultaneously."
}
```

### `get_market_detail`

Returns detail for a specific market by ticker, including price, volume, and order book depth.

**Parameters:**
- `ticker` (required): Market ticker, e.g. `"KXBTC-25APR11-B85500"` or `"will-trump-win-2028"`

**Example output:**
```json
{
  "ticker": "KXBTC-25APR11-B85500",
  "title": "Bitcoin above $85,500 on April 11?",
  "platform": "kalshi",
  "yes_price": 62,
  "volume_24h": 148200,
  "order_book": {
    "bids": [{ "price": 61, "quantity": 5000 }],
    "asks": [{ "price": 63, "quantity": 3200 }]
  }
}
```

### `get_market_edges`

Returns actionable edges where the SimpleFunctions thesis diverges from the current market price.

**Example output:**
```json
{
  "edges": [
    {
      "ticker": "KXRECESSION-26",
      "title": "US recession in 2026",
      "market_price": 32,
      "thesis_price": 24,
      "edge": 8,
      "direction": "BUY_NO",
      "reasoning": "Labor market remains resilient; leading indicators do not support 32% implied probability."
    }
  ]
}
```

## API

This server fetches data from the [SimpleFunctions API](https://simplefunctions.dev/docs):

| Tool | Endpoint |
|------|----------|
| `get_world_state` | `GET /api/agent/world?format=markdown\|json` |
| `get_uncertainty_index` | `GET /api/public/index` |
| `get_market_detail` | `GET /api/public/market/{ticker}?depth=true` |
| `get_market_edges` | `GET /api/edges` |

No API key required for these endpoints.

## Development

```bash
git clone https://github.com/spfunctions/prediction-market-mcp-example
cd prediction-market-mcp-example
npm install
npm run build
node dist/server.js
```

## License

MIT

---

**Part of [SimpleFunctions](https://simplefunctions.dev)** -- context flow for prediction markets.

- [Awesome Prediction Markets](https://github.com/spfunctions/awesome-prediction-markets) -- curated list for developers
- [CLI](https://github.com/spfunctions/simplefunctions-cli) -- 42 commands for prediction market intelligence
- [MCP Server (hosted)](https://simplefunctions.dev/api/mcp/mcp) -- connect any LLM to prediction markets
- [REST API](https://simplefunctions.dev/docs) -- structured market data for your app
