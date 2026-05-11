import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { SettingsMcpServer } from './settings-mcp-server'

jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useParams: () => ({ organizationId: 'org-1' }),
}))

describe('SettingsMcpServer', () => {
  it('should render heading and default Claude Code tab content', () => {
    renderWithProviders(<SettingsMcpServer />)

    expect(screen.getByRole('heading', { name: 'MCP server' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Configure via OAuth (recommended)' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Configure via API token' })).toBeInTheDocument()
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

  it('should render API token setup steps', () => {
    renderWithProviders(<SettingsMcpServer />)

    expect(screen.getByText('1. Generate token and copy it')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Generate API token' })).toBeInTheDocument()
    expect(screen.getByText('2. Authenticate through your API token')).toBeInTheDocument()
    expect(screen.getByText(/Authorization: Token your_qovery_token/)).toBeInTheDocument()
  })
})
