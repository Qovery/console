import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { SettingsMcpServer } from './settings-mcp-server'

describe('SettingsMcpServer', () => {
  it('should render heading and default Claude Code tab content', () => {
    renderWithProviders(<SettingsMcpServer />)

    expect(screen.getByRole('heading', { name: 'MCP server' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Configure MCP server' })).toBeInTheDocument()
    expect(screen.getByText('Claude Code')).toBeInTheDocument()
    expect(screen.getByText('Codex')).toBeInTheDocument()
    expect(
      screen.getByText('claude mcp add --transport http qovery https://mcp.qovery.com/mcp --callback-port 4242')
    ).toBeInTheDocument()
  })

  it('should switch to Codex instructions when clicking Codex tab', async () => {
    const { userEvent } = renderWithProviders(<SettingsMcpServer />)

    await userEvent.click(screen.getByText('Codex'))

    expect(screen.getByText('1. Update your config.toml')).toBeInTheDocument()
    expect(screen.getByText('mcp_oauth_callback_port = 4242')).toBeInTheDocument()
    expect(screen.getByText("codex mcp add qovery --url 'https://mcp.qovery.com/mcp'")).toBeInTheDocument()
  })

  it('should display access mode badges for MCP tools', () => {
    renderWithProviders(<SettingsMcpServer />)

    expect(screen.getByText('devops_copilot')).toBeInTheDocument()
    expect(screen.getByText('read-write')).toBeInTheDocument()
    expect(screen.getAllByText('read-only')).toHaveLength(4)
  })

  it('should render docs link for API token setup', () => {
    renderWithProviders(<SettingsMcpServer />)

    const docsLink = screen.getByRole('link', { name: 'See how' })
    expect(docsLink).toHaveAttribute('href', 'https://www.qovery.com/docs/copilot/mcp-server#2-api-token')
  })
})
