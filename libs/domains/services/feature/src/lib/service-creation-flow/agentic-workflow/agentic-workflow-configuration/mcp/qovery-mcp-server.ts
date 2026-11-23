import { type McpServerResponse } from 'qovery-typescript-axios'
import { QOVERY_MCP_SERVER_URL } from '@qovery/shared/util-js'

const QOVERY_MCP_SERVER_ORIGIN = new URL(QOVERY_MCP_SERVER_URL).origin

export function isQoveryMcpServer({ url }: { url?: McpServerResponse['url'] | null }) {
  if (!url) return false

  const normalizedUrl = url.replace(/\/+$/, '')
  return normalizedUrl === QOVERY_MCP_SERVER_URL || normalizedUrl === QOVERY_MCP_SERVER_ORIGIN
}

export function getMcpServerDisplayName(mcpServer: Pick<McpServerResponse, 'name' | 'url'>) {
  return isQoveryMcpServer(mcpServer) ? 'MCP Qovery' : mcpServer.name
}
