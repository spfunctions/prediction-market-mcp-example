# prediction-market-mcp

MCP server for prediction market data. Gives Claude Desktop, Cursor, VS Code Copilot, and any MCP client access to real-time prediction market intelligence.

[![npm](https://img.shields.io/npm/v/prediction-market-mcp)](https://www.npmjs.com/package/prediction-market-mcp)

## Quick Start
```bash
npx prediction-market-mcp
```

## Claude Desktop
Add to `claude_desktop_config.json`:
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

## Cursor
Add to `.cursor/mcp.json`:
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

## Tools
| Tool | Description |
|------|-------------|
| `get_world_state` | Full world state (~800 tokens) |
| `get_uncertainty_index` | Four-signal uncertainty index |
| `get_market_detail` | Single market with orderbook |
| `get_market_edges` | Actionable mispricings |

## License
MIT — [SimpleFunctions](https://simplefunctions.dev)
