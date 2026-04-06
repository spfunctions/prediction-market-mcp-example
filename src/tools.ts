import { z } from "zod";
import { ENDPOINTS } from "./types.js";

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

/**
 * Fetch helper with error handling.
 * Returns the response body as text or a structured error message.
 */
async function sfFetch(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: { "User-Agent": "prediction-market-mcp/1.0" },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      `SF API error ${res.status}: ${res.statusText}${body ? ` — ${body}` : ""}`
    );
  }

  return res.text();
}

/**
 * Register all prediction market tools on the given MCP server.
 */
export function registerTools(server: McpServer): void {
  // ── get_world_state ────────────────────────────────────────────────
  server.tool(
    "get_world_state",
    "Get the current prediction market world state — a structured snapshot of what markets are pricing across geopolitics, economics, tech, and more. Returns markdown by default, or JSON.",
    {
      format: z
        .enum(["markdown", "json"])
        .default("markdown")
        .describe("Response format: 'markdown' for human-readable, 'json' for structured data"),
    },
    async ({ format }) => {
      try {
        const url =
          format === "json" ? ENDPOINTS.worldJson : ENDPOINTS.worldMarkdown;
        const body = await sfFetch(url);

        return {
          content: [{ type: "text" as const, text: body }],
        };
      } catch (err) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Error fetching world state: ${err instanceof Error ? err.message : String(err)}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  // ── get_uncertainty_index ──────────────────────────────────────────
  server.tool(
    "get_uncertainty_index",
    "Get the 4-signal uncertainty index — a composite measure of global uncertainty derived from prediction market data. Signals: market entropy, price velocity, volume dispersion, and cross-market correlation.",
    {},
    async () => {
      try {
        const body = await sfFetch(ENDPOINTS.index);

        return {
          content: [{ type: "text" as const, text: body }],
        };
      } catch (err) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Error fetching uncertainty index: ${err instanceof Error ? err.message : String(err)}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  // ── get_market_detail ──────────────────────────────────────────────
  server.tool(
    "get_market_detail",
    "Get detailed information about a specific prediction market by ticker, including price, volume, order book depth, and metadata.",
    {
      ticker: z
        .string()
        .describe(
          "Market ticker, e.g. 'KXBTC-25APR11-B85500' (Kalshi) or 'will-trump-win-2028' (Polymarket)"
        ),
    },
    async ({ ticker }) => {
      try {
        const body = await sfFetch(ENDPOINTS.market(ticker));

        return {
          content: [{ type: "text" as const, text: body }],
        };
      } catch (err) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Error fetching market detail for "${ticker}": ${err instanceof Error ? err.message : String(err)}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  // ── get_market_edges ───────────────────────────────────────────────
  server.tool(
    "get_market_edges",
    "Get actionable edges where the SimpleFunctions thesis price diverges from the current market price. Each edge includes the ticker, direction (BUY_YES / BUY_NO), magnitude, and reasoning.",
    {},
    async () => {
      try {
        const body = await sfFetch(ENDPOINTS.edges);

        return {
          content: [{ type: "text" as const, text: body }],
        };
      } catch (err) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Error fetching market edges: ${err instanceof Error ? err.message : String(err)}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}
