/**
 * Type definitions for the prediction market MCP server.
 */

/** Base URL for the SimpleFunctions API. */
export const SF_API_BASE = "https://simplefunctions.dev/api";

/** Endpoints used by the MCP tools. */
export const ENDPOINTS = {
  worldMarkdown: `${SF_API_BASE}/agent/world?format=markdown`,
  worldJson: `${SF_API_BASE}/agent/world?format=json`,
  index: `${SF_API_BASE}/public/index`,
  market: (ticker: string) => `${SF_API_BASE}/public/market/${encodeURIComponent(ticker)}?depth=true`,
  edges: `${SF_API_BASE}/edges`,
} as const;
