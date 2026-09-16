import {
  type LlmProviderResponse,
  LlmProviderScope,
  LlmProviderType,
  type McpServerResponse,
  McpServerScope,
} from 'qovery-typescript-axios'
import { type ReactElement, type ReactNode } from 'react'
import * as sharedUi from '@qovery/shared/ui'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import * as useDeleteLlmProviderHook from '../hooks/use-delete-llm-provider/use-delete-llm-provider'
import * as useDeleteMcpServerHook from '../hooks/use-delete-mcp-server/use-delete-mcp-server'
import * as useLlmProvidersHook from '../hooks/use-llm-providers/use-llm-providers'
import * as useMcpServersHook from '../hooks/use-mcp-servers/use-mcp-servers'
import { type McpServerCreateEditModalProps } from '../mcp-server-create-edit-modal/mcp-server-create-edit-modal'
import { SettingsAgentMcps, SettingsAgentTokens } from './settings-agent-personalization'

const useMcpServersMock = jest.spyOn(useMcpServersHook, 'useMcpServers') as jest.Mock
const useDeleteMcpServerMock = jest.spyOn(useDeleteMcpServerHook, 'useDeleteMcpServer') as jest.Mock
const useLlmProvidersMock = jest.spyOn(useLlmProvidersHook, 'useLlmProviders') as jest.Mock
const useDeleteLlmProviderMock = jest.spyOn(useDeleteLlmProviderHook, 'useDeleteLlmProvider') as jest.Mock
const useModalMock = jest.spyOn(sharedUi, 'useModal') as jest.Mock
const useModalConfirmationMock = jest.spyOn(sharedUi, 'useModalConfirmation') as jest.Mock
const openModal = jest.fn()
const closeModal = jest.fn()
const openModalConfirmation = jest.fn()
const deleteMcpServer = jest.fn()
const deleteLlmProvider = jest.fn()

jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useParams: () => ({ organizationId: 'org-1' }),
}))

jest.mock('@auth0/auth0-react', () => ({
  Auth0Provider: ({ children }: { children: ReactNode }) => children,
  useAuth0: () => ({ user: { sub: 'auth0|current-user' } }),
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
    scope: McpServerScope.ORGANIZATION,
    attachable: true,
  },
  {
    id: 'mcp-alpha',
    name: 'Alpha',
    description: 'First connector',
    url: 'https://alpha.example.com/mcp',
    header_names: new Set(),
    created_at: '2026-08-01T10:00:00Z',
    updated_at: '2026-08-02T10:00:00Z',
    scope: McpServerScope.USER,
    owner_name: 'Rémi Bonnet',
    attachable: true,
  },
  {
    id: 'mcp-bravo',
    name: 'Bravo',
    description: 'Another member connector',
    url: 'https://bravo.example.com/mcp',
    header_names: new Set(),
    created_at: '2026-08-01T10:00:00Z',
    updated_at: '2026-08-02T10:00:00Z',
    scope: McpServerScope.USER,
    owner_name: 'Romaric Philogène',
    attachable: false,
  },
]

const llmProviders: LlmProviderResponse[] = [
  {
    id: 'provider-claude',
    name: 'Claude production',
    description: 'Production credential',
    type: LlmProviderType.CLAUDE,
    has_credential: true,
    scope: LlmProviderScope.ORGANIZATION,
    created_at: '2026-09-15T10:00:00Z',
    updated_at: '2026-09-15T10:00:00Z',
  },
  {
    id: 'provider-personal',
    name: 'My Claude',
    description: '',
    type: LlmProviderType.CLAUDE,
    has_credential: false,
    scope: LlmProviderScope.USER,
    owner_name: 'Rémi Bonnet',
    owner_user_sub: 'auth0|current-user',
    created_at: '2026-09-15T10:00:00Z',
    updated_at: '2026-09-15T10:00:00Z',
  },
  {
    id: 'provider-other-user',
    name: 'Other Claude',
    description: '',
    type: LlmProviderType.CLAUDE,
    has_credential: true,
    scope: LlmProviderScope.USER,
    owner_name: 'Another member',
    owner_user_sub: 'auth0|other-user',
    created_at: '2026-09-15T10:00:00Z',
    updated_at: '2026-09-15T10:00:00Z',
  },
]

describe('Agent settings pages', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    jest.clearAllMocks()
    useModalMock.mockReturnValue({ openModal, closeModal })
    useModalConfirmationMock.mockReturnValue({ openModalConfirmation })
    useDeleteMcpServerMock.mockReturnValue({ mutateAsync: deleteMcpServer })
    useDeleteLlmProviderMock.mockReturnValue({ mutateAsync: deleteLlmProvider })
    useLlmProvidersMock.mockReturnValue({ data: [] })
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('should render the token empty state', () => {
    useMcpServersMock.mockReturnValue({ data: [] })

    renderWithProviders(<SettingsAgentTokens />)

    expect(screen.getByRole('heading', { name: 'Tokens' })).toBeInTheDocument()
    expect(screen.getByText('No tokens')).toBeInTheDocument()
    expect(screen.queryByText('No MCPs')).not.toBeInTheDocument()
  })

  it('should render MCPs alphabetically with their URL, details tooltip, and actions', async () => {
    useMcpServersMock.mockReturnValue({ data: mcpServers })

    const { userEvent } = renderWithProviders(<SettingsAgentMcps />)

    const rows = screen.getAllByTestId(/^mcp-server-/)
    expect(rows[0]).toHaveAttribute('data-testid', 'mcp-server-mcp-zulu')
    expect(rows[1]).toHaveAttribute('data-testid', 'mcp-server-mcp-alpha')
    expect(rows[2]).toHaveAttribute('data-testid', 'mcp-server-mcp-bravo')
    expect(screen.getByText('Personal MCPs')).toBeInTheDocument()
    expect(screen.getByText('Organization MCPs')).toBeInTheDocument()
    expect(screen.getByText('Owner: Rémi Bonnet')).toHaveClass('min-w-0', 'truncate')
    expect(screen.getByText('Owner: Rémi Bonnet').parentElement).toContainElement(screen.getByText('Alpha'))
    expect(screen.getByText('https://zulu.example.com/mcp')).toBeInTheDocument()
    expect(screen.queryByText('Authorization')).not.toBeInTheDocument()
    expect(screen.queryByText('Second connector')).not.toBeInTheDocument()
    expect(screen.getByLabelText('About Zulu')).toBeInTheDocument()
    await userEvent.hover(screen.getByLabelText('About Alpha'))
    expect((await screen.findAllByText('First connector')).length).toBeGreaterThan(0)
    expect(screen.getByRole('button', { name: 'Edit Zulu' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Edit Bravo' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Delete Bravo' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Delete Zulu' })).toBeInTheDocument()
  })

  it('should hide the personal MCP section when there are no personal MCPs', () => {
    useMcpServersMock.mockReturnValue({ data: [mcpServers[0]] })

    renderWithProviders(<SettingsAgentMcps />)

    expect(screen.queryByText('Personal MCPs')).not.toBeInTheDocument()
    expect(screen.getByText('Organization MCPs')).toBeInTheDocument()
    expect(screen.getByText('Zulu')).toBeInTheDocument()
  })

  it('should open the create and edit modals', async () => {
    useMcpServersMock.mockReturnValue({ data: mcpServers })
    const { userEvent } = renderWithProviders(<SettingsAgentMcps />)

    await userEvent.click(screen.getByRole('button', { name: 'Add MCP' }))
    await userEvent.click(screen.getByRole('button', { name: 'Edit Zulu' }))

    const createModal = openModal.mock.calls[0][0].content as ReactElement<McpServerCreateEditModalProps>
    expect(openModal).toHaveBeenCalledTimes(2)
    expect(createModal.props.scope).toBe(McpServerScope.USER)
    expect(openModal).toHaveBeenNthCalledWith(1, expect.objectContaining({ options: { fakeModal: true, width: 680 } }))
    expect(openModal).toHaveBeenNthCalledWith(2, expect.objectContaining({ options: { fakeModal: true, width: 680 } }))
  })

  it('should keep each page focused on its own action', () => {
    useMcpServersMock.mockReturnValue({ data: [] })

    const tokenPage = renderWithProviders(<SettingsAgentTokens />)
    expect(screen.getByRole('button', { name: 'Add token' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Add MCP' })).not.toBeInTheDocument()

    tokenPage.unmount()
    renderWithProviders(<SettingsAgentMcps />)
    expect(screen.getByRole('button', { name: 'Add MCP' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Add token' })).not.toBeInTheDocument()
  })

  it('should render and manage provider tokens', async () => {
    useMcpServersMock.mockReturnValue({ data: [] })
    useLlmProvidersMock.mockReturnValue({ data: llmProviders })
    const { userEvent } = renderWithProviders(<SettingsAgentTokens />)

    expect(screen.getByText('Organization tokens')).toBeInTheDocument()
    expect(screen.getByText('Personal token')).toBeInTheDocument()
    expect(screen.queryByText('Claude')).not.toBeInTheDocument()
    expect(screen.queryByText('Configured')).not.toBeInTheDocument()
    expect(screen.getByText('No token')).toBeInTheDocument()
    expect(screen.queryByText('Organization')).not.toBeInTheDocument()
    expect(screen.queryByText('Production credential')).not.toBeInTheDocument()
    expect(screen.getByLabelText('About Claude production')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Edit My Claude' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Delete My Claude' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Edit Other Claude' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Delete Other Claude' })).not.toBeInTheDocument()
    expect(screen.getByText('Owner: Another member')).toBeInTheDocument()
    expect(screen.getByText('Owner: Another member').previousElementSibling).toContainElement(
      screen.getByText('Other Claude')
    )
    expect(document.querySelectorAll('img[src="/assets/ai-tools/claude.svg"]')).toHaveLength(3)

    await userEvent.hover(screen.getByLabelText('About Claude production'))
    expect((await screen.findAllByText('Production credential')).length).toBeGreaterThan(0)

    await userEvent.click(screen.getByRole('button', { name: 'Add token' }))
    await userEvent.click(screen.getByRole('button', { name: 'Edit Claude production' }))
    expect(openModal).toHaveBeenCalledTimes(2)

    await userEvent.click(screen.getByRole('button', { name: 'Delete Claude production' }))
    const confirmation = openModalConfirmation.mock.calls[0][0]
    await confirmation.action()
    expect(confirmation).toEqual(expect.objectContaining({ title: 'Delete token', name: 'Claude production' }))
    expect(deleteLlmProvider).toHaveBeenCalledWith({
      organizationId: 'org-1',
      llmProviderId: 'provider-claude',
    })
  })

  it('should hide empty token scope sections', () => {
    useLlmProvidersMock.mockReturnValue({ data: [llmProviders[0]] })
    const organizationTokens = renderWithProviders(<SettingsAgentTokens />)

    expect(screen.getByText('Organization tokens')).toBeInTheDocument()
    expect(screen.queryByText('Personal token')).not.toBeInTheDocument()

    organizationTokens.unmount()
    useLlmProvidersMock.mockReturnValue({ data: [llmProviders[1]] })
    renderWithProviders(<SettingsAgentTokens />)

    expect(screen.queryByText('Organization tokens')).not.toBeInTheDocument()
    expect(screen.getByText('Personal token')).toBeInTheDocument()
  })

  it('should confirm deletion with the connector name and organization scope', async () => {
    useMcpServersMock.mockReturnValue({ data: mcpServers })
    const { userEvent } = renderWithProviders(<SettingsAgentMcps />)

    await userEvent.click(screen.getByRole('button', { name: 'Delete Zulu' }))
    const confirmation = openModalConfirmation.mock.calls[0][0]
    await confirmation.action()

    expect(confirmation).toEqual(expect.objectContaining({ title: 'Delete MCP', name: 'Zulu' }))
    expect(deleteMcpServer).toHaveBeenCalledWith({ organizationId: 'org-1', mcpServerId: 'mcp-zulu' })
  })
})
