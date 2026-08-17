import { type McpServerResponse } from 'qovery-typescript-axios'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import * as useMcpServersHook from '../hooks/use-mcp-servers/use-mcp-servers'
import { SettingsAgentPersonalization } from './settings-agent-personalization'

const useMcpServersMock = jest.spyOn(useMcpServersHook, 'useMcpServers') as jest.Mock

jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useParams: () => ({ organizationId: 'org-1' }),
}))

const mcpServers: McpServerResponse[] = [
  {
    id: 'mcp-zulu',
    name: 'Zulu',
    description: 'Second connector',
    url: 'https://zulu.example.com/mcp',
    header_names: new Set(['Authorization']),
    created_at: '2026-08-01T10:00:00Z',
    updated_at: '2026-08-02T10:00:00Z',
  },
  {
    id: 'mcp-alpha',
    name: 'Alpha',
    description: 'First connector',
    url: 'https://alpha.example.com/mcp',
    header_names: new Set(),
    created_at: '2026-08-01T10:00:00Z',
    updated_at: '2026-08-02T10:00:00Z',
  },
]

describe('SettingsAgentPersonalization', () => {
  it('should render the empty state and organization scope', () => {
    useMcpServersMock.mockReturnValue({ data: [] })

    renderWithProviders(<SettingsAgentPersonalization />)

    expect(screen.getByRole('heading', { name: 'Agent personalization' })).toBeInTheDocument()
    expect(screen.getByText('Your personal settings for Qovery Agent')).toBeInTheDocument()
    expect(
      screen.getByText('MCP connectors are shared with every Qovery Agent in this organization.')
    ).toBeInTheDocument()
    expect(screen.getByText('No MCP connectors')).toBeInTheDocument()
  })

  it('should render MCP connectors alphabetically with their metadata and actions', () => {
    useMcpServersMock.mockReturnValue({ data: mcpServers })

    renderWithProviders(<SettingsAgentPersonalization />)

    const rows = screen.getAllByTestId(/^mcp-server-/)
    expect(rows[0]).toHaveAttribute('data-testid', 'mcp-server-mcp-alpha')
    expect(rows[1]).toHaveAttribute('data-testid', 'mcp-server-mcp-zulu')
    expect(screen.getByText('https://zulu.example.com/mcp')).toBeInTheDocument()
    expect(screen.getByText('Authorization')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Edit Zulu' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Delete Zulu' })).toBeInTheDocument()
  })
})
