import { type McpServerResponse } from 'qovery-typescript-axios'

const QOVERY_MCP_SERVER_ORIGIN = 'https://mcp.qovery.com'

export function isQoveryMcpServer({ url }: { url?: McpServerResponse['url'] | null }) {
  if (!url) return false

  const normalizedUrl = url.replace(/\/+$/, '')
  return normalizedUrl === `${QOVERY_MCP_SERVER_ORIGIN}/mcp` || normalizedUrl === QOVERY_MCP_SERVER_ORIGIN
}

export function getMcpServerDisplayName(mcpServer: Pick<McpServerResponse, 'name' | 'url'>) {
  return isQoveryMcpServer(mcpServer) ? 'MCP Qovery' : mcpServer.name
}
