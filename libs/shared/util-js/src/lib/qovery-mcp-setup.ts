export const QOVERY_MCP_SERVER_URL = 'https://mcp.qovery.com/mcp'

const QOVERY_MCP_OAUTH_CALLBACK_PORT = 4242
export const QOVERY_MCP_CLAUDE_COMMAND = `claude mcp add --transport http qovery ${QOVERY_MCP_SERVER_URL} --callback-port ${QOVERY_MCP_OAUTH_CALLBACK_PORT}`
export const QOVERY_MCP_CODEX_CONFIG = `mcp_oauth_callback_port = ${QOVERY_MCP_OAUTH_CALLBACK_PORT}`
export const QOVERY_MCP_CODEX_COMMAND = `codex mcp add qovery --url '${QOVERY_MCP_SERVER_URL}'`
