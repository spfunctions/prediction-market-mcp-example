# prediction-market-mcp-example

A minimal MCP server (~50 lines) that gives any LLM access to prediction market data.

## Tools

| Tool | Description |
|------|-------------|
| `search_markets` | Search Kalshi & Polymarket by keyword |
| `get_market_context` | Structured context about a topic |
| `get_price_changes` | Recent significant price movements |

## Setup

```bash
npm install
```

## Run with Claude Desktop

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "prediction-markets": {
      "command": "npx",
      "args": ["tsx", "index.ts"],
      "cwd": "/path/to/this/repo"
    }
  }
}
```

## Run with Claude Code

```bash
claude mcp add prediction-markets "npx tsx index.ts"
```

Or use the hosted SimpleFunctions MCP server directly:

```bash
claude mcp add simplefunctions --url https://simplefunctions.dev/api/mcp/mcp
```

## How it works

The server uses the [SimpleFunctions](https://simplefunctions.dev) public API to query prediction market data and exposes it as MCP tools. Any MCP-compatible client (Claude, Cursor, etc.) can call these tools.

## License

MIT
