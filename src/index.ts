#!/usr/bin/env node

/**
 * prediction-market-mcp
 *
 * Minimal MCP server exposing the SimpleFunctions public prediction-market
 * API to any MCP client (Claude Desktop, Cursor, Windsurf, VS Code Copilot,
 * mcp-cli, etc.). Six tools, no auth, no rate limit.
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'

const BASE = 'https://simplefunctions.dev'

async function sf(path: string, params?: Record<string, string>): Promise<unknown> {
  const url = new URL(path, BASE)
  if (params) for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)
  const res = await fetch(url.toString())
  if (!res.ok) throw new Error(`SimpleFunctions API error ${res.status} for ${path}`)
  const ct = res.headers.get('content-type') || ''
  return ct.includes('json') ? res.json() : res.text()
}

const stringify = (data: unknown): string => (typeof data === 'string' ? data : JSON.stringify(data, null, 2))

export const server = new McpServer({ name: 'prediction-markets', version: '2.1.0' })

// ── get_context (entry point) ─────────────────────────────

server.tool(
  'get_context',
  "START HERE — single entry point that returns a global prediction-market snapshot bundle: top mispriced edges, 24h price movers, highlights, and traditional-market context. Read-only, no auth. Use this first when the user asks 'what's happening in markets right now'. Use the more specific tools only if the user wants one slice in isolation.",
  {},
  async () => {
    const data = await sf('/api/public/context')
    return { content: [{ type: 'text' as const, text: stringify(data) }] }
  },
)

// ── get_world_state ───────────────────────────────────────

server.tool(
  'get_world_state',
  "Get the calibrated world model: ~9,700 prediction markets distilled into ~800 tokens of real-money probabilities across geopolitics, economics, tech, and policy. Read-only, no auth. Use when you need a compact 'what the market believes right now'. Use get_world_changes for cheap polling, or get_context for the broader bundle.",
  {
    format: z
      .enum(['markdown', 'json'])
      .optional()
      .describe("Output format. Default: 'markdown'. Use 'json' for programmatic parsing."),
  },
  async ({ format }) => {
    const data = await sf('/api/agent/world', { format: format || 'markdown' })
    return { content: [{ type: 'text' as const, text: stringify(data) }] }
  },
)

// ── get_world_changes ─────────────────────────────────────

server.tool(
  'get_world_changes',
  'Get the incremental world-model delta since a given time — only the markets whose probability moved. ~30-50 tokens vs ~800 for the full state. Read-only, no auth. Use for cheap polling loops; use get_world_state for an absolute snapshot.',
  {
    since: z
      .string()
      .optional()
      .describe("Lookback window. Either a relative duration ('30m', '1h', '6h', '24h') or an ISO-8601 timestamp."),
  },
  async ({ since }) => {
    const data = await sf('/api/agent/world/delta', { format: 'markdown', ...(since ? { since } : {}) })
    return { content: [{ type: 'text' as const, text: stringify(data) }] }
  },
)

// ── get_market_edges ──────────────────────────────────────

server.tool(
  'get_market_edges',
  "Get currently actionable mispricings — markets where SimpleFunctions' causal model disagrees with the market price. Returns ticker, venue, prices, executableEdge in cents, confidence, liquidity, reasoning, age, and absorption. Read-only, no auth. Use after get_context if the user wants the raw edge list.",
  {},
  async () => {
    const data = await sf('/api/edges')
    return { content: [{ type: 'text' as const, text: stringify(data) }] }
  },
)

// ── get_uncertainty_index ─────────────────────────────────

server.tool(
  'get_uncertainty_index',
  'Get the four-signal prediction-market uncertainty index: uncertainty (0-100), geopolitical risk (0-100), momentum (-1 to +1), activity (0-100). Derived from real-money orderbook spreads across 30,000+ markets. Read-only, no auth.',
  {},
  async () => {
    const data = await sf('/api/public/index')
    return { content: [{ type: 'text' as const, text: stringify(data) }] }
  },
)

// ── get_market_detail (fixed: routes through verified plural endpoint) ─

server.tool(
  'get_market_detail',
  "Get detailed data for a specific prediction market by ticker. Routes through /api/public/markets?tickers= and returns the first match. Works with Kalshi tickers (e.g. 'KXFEDDECISION-25DEC') and Polymarket numeric / condition IDs. Read-only, no auth.",
  {
    ticker: z.string().min(1).describe('Market ticker (Kalshi) or market ID (Polymarket).'),
    depth: z.boolean().optional().describe('Include orderbook depth. Default false.'),
  },
  async ({ ticker, depth }) => {
    const params: Record<string, string> = { tickers: ticker }
    if (depth) params.depth = 'true'
    const data = (await sf('/api/public/markets', params)) as { markets?: unknown[] }
    const market = Array.isArray(data?.markets) ? data.markets[0] : null
    if (!market) {
      return {
        content: [{ type: 'text' as const, text: `Market not found: ${ticker}` }],
        isError: true,
      }
    }
    return { content: [{ type: 'text' as const, text: stringify(market) }] }
  },
)

// ── get_ideas ─────────────────────────────────────────────

server.tool(
  'get_ideas',
  'Get LLM-generated, ready-to-act trade ideas derived from current edges, market changes, and source highlights. Each idea includes headline, pitch, conviction (high/medium/low), direction (buy_yes/buy_no), target market(s) with current price, catalyst, time horizon, and risk. Read-only, no auth. Cached server-side (~12h).',
  {},
  async () => {
    const data = await sf('/api/public/ideas')
    return { content: [{ type: 'text' as const, text: stringify(data) }] }
  },
)

// ── Boot ───────────────────────────────────────────────────

// Wrapped in an async function so this file is importable from tests
// without auto-starting the server (and so the build target tolerates CJS,
// which doesn't support top-level await).
async function main(): Promise<void> {
  const transport = new StdioServerTransport()
  await server.connect(transport)
}

const isMain =
  typeof process !== 'undefined' &&
  Array.isArray(process.argv) &&
  /index\.(c?js|mjs)$/.test(process.argv[1] ?? '')

if (isMain) {
  main().catch((err) => {
    console.error(err)
    process.exit(1)
  })
}
