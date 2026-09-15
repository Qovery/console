import { type McpServerResponse } from 'qovery-typescript-axios'

export const QOVERY_MCP_SERVER_URL = 'https://mcp.qovery.com/mcp'
const QOVERY_MCP_SERVER_ORIGIN = 'https://mcp.qovery.com'

export function isQoveryMcpServer({ url }: Pick<McpServerResponse, 'url'>) {
  const normalizedUrl = url.replace(/\/+$/, '')
  return normalizedUrl === QOVERY_MCP_SERVER_URL || normalizedUrl === QOVERY_MCP_SERVER_ORIGIN
}

export function getMcpServerDisplayName(mcpServer: Pick<McpServerResponse, 'name' | 'url'>) {
  return isQoveryMcpServer(mcpServer) ? 'MCP Qovery' : mcpServer.name
}
