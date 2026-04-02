import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const SF_API = "https://simplefunctions.dev/api/public";

const server = new McpServer({
  name: "prediction-markets",
  version: "1.0.0",
});

server.tool(
  "search_markets",
  "Search prediction markets on Kalshi and Polymarket by keyword",
  { query: z.string().describe("Search term, e.g. 'recession', 'bitcoin', 'election'") },
  async ({ query }) => {
    const res = await fetch(`${SF_API}/markets?q=${encodeURIComponent(query)}&limit=10`);
    const data = await res.json();
    return {
      content: [{
        type: "text",
        text: JSON.stringify(data.markets ?? data, null, 2),
      }],
    };
  }
);

server.tool(
  "get_market_context",
  "Get structured context about a prediction market topic for analysis",
  { topic: z.string().describe("Topic to get prediction market context for") },
  async ({ topic }) => {
    const res = await fetch(`${SF_API}/context?topic=${encodeURIComponent(topic)}`);
    const data = await res.json();
    return {
      content: [{
        type: "text",
        text: JSON.stringify(data, null, 2),
      }],
    };
  }
);

server.tool(
  "get_price_changes",
  "Get recent significant price movements across prediction markets",
  { hours: z.number().default(24).describe("Lookback window in hours") },
  async ({ hours }) => {
    const res = await fetch(`${SF_API}/changes?hours=${hours}`);
    const data = await res.json();
    return {
      content: [{
        type: "text",
        text: JSON.stringify(data, null, 2),
      }],
    };
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
