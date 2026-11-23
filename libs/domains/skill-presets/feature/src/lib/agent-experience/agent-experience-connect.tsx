/** The commands of the Connect an agent popup: the Qovery skills, the CLI and the MCP server per coding agent. */

export const SKILLS_INSTALL_COMMAND = 'curl -fsSL https://skill.qovery.com/install.sh | bash'
export const CLI_INSTALL_COMMAND = 'curl -fsSL https://get.qovery.com | bash'
export const MCP_URL = 'https://mcp.qovery.com/mcp'
export const MCP_ADD_COMMAND = `claude mcp add --transport http qovery ${MCP_URL} --callback-port 4242`

/**
 * How each coding agent adds the Qovery MCP server. Claude Code and Codex sign in with OAuth, as on
 * the MCP server settings page. The others pass a token in the Authorization header: a policy token
 * keeps the agent to what it needs.
 */
export const MCP_SETUPS: {
  id: string
  name: string
  steps: { title: string; command: string; prompt?: boolean }[]
}[] = [
  { id: 'claude-code', name: 'Claude Code', steps: [{ title: 'Run this command', command: MCP_ADD_COMMAND }] },
  {
    id: 'codex',
    name: 'Codex',
    steps: [
      {
        title: 'Add this line at the top of ~/.codex/config.toml, above any [section]',
        command: 'mcp_oauth_callback_port = 4242',
        prompt: false,
      },
      { title: 'Run this command', command: `codex mcp add qovery --url '${MCP_URL}'` },
    ],
  },
  {
    id: 'cursor',
    name: 'Cursor',
    steps: [
      {
        title: 'Add this server to ~/.cursor/mcp.json',
        prompt: false,
        command: `{
  "mcpServers": {
    "qovery": {
      "url": "${MCP_URL}",
      "headers": { "Authorization": "Token <your token>" }
    }
  }
}`,
      },
    ],
  },
  {
    id: 'gemini-cli',
    name: 'Gemini CLI',
    steps: [
      {
        title: 'Run this command',
        command: `gemini mcp add --transport http --header "Authorization: Token <your token>" qovery ${MCP_URL}`,
      },
    ],
  },
  {
    id: 'vs-code',
    name: 'VS Code',
    steps: [
      {
        title: 'Run this command',
        command: `code --add-mcp '{"name":"qovery","type":"http","url":"${MCP_URL}","headers":{"Authorization":"Token <your token>"}}'`,
      },
    ],
  },
]
