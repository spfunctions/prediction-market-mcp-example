#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'

const BASE = 'https://simplefunctions.dev'

async function sf(path: string, params?: Record<string, string>): Promise<any> {
  const url = new URL(path, BASE)
  if (params) for (const [k,v] of Object.entries(params)) url.searchParams.set(k, v)
  const res = await fetch(url.toString())
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  const ct = res.headers.get('content-type') || ''
  return ct.includes('json') ? res.json() : res.text()
}

const server = new McpServer({ name: 'prediction-markets', version: '2.0.0' })

server.tool('get_world_state',
  'Get real-time prediction market world state from 30,000+ markets. Returns uncertainty index, regime summary, actionable edges, movers, and divergences.',
  { format: z.enum(['json', 'markdown']).optional().describe('Output format') },
  async ({ format }) => {
    const data = await sf('/api/agent/world', { format: format || 'markdown' })
    return { content: [{ type: 'text' as const, text: typeof data === 'string' ? data : JSON.stringify(data, null, 2) }] }
  }
)

server.tool('get_uncertainty_index',
  'Get the prediction market uncertainty index: uncertainty (0-100), geopolitical risk (0-100), momentum (-1 to +1), activity (0-100).',
  {},
  async () => {
    const data = await sf('/api/public/index')
    return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] }
  }
)

server.tool('get_market_detail',
  'Get detailed data for a specific prediction market by ticker. Works with Kalshi tickers and Polymarket IDs.',
  { ticker: z.string().describe('Market ticker or ID'), depth: z.boolean().optional().describe('Include orderbook') },
  async ({ ticker, depth }) => {
    const data = await sf(`/api/public/market/${encodeURIComponent(ticker)}`, depth ? { depth: 'true' } : {})
    return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] }
  }
)

server.tool('get_market_edges',
  'Get actionable edges — markets where thesis-implied price diverges from market price.',
  {},
  async () => {
    const data = await sf('/api/edges')
    return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] }
  }
)

async function main() {
  const transport = new StdioServerTransport()
  await server.connect(transport)
}
main().catch(console.error)
