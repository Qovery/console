import { type McpServerResponse } from 'qovery-typescript-axios'

export const QOVERY_MCP_SERVER_URL = 'https://mcp.qovery.com/mcp'

export function isQoveryMcpServer({ url }: Pick<McpServerResponse, 'url'>) {
  return url.replace(/\/+$/, '') === QOVERY_MCP_SERVER_URL
}
