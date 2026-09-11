import { type McpServerResponse, McpServerScope } from 'qovery-typescript-axios'
import { type ReactElement } from 'react'
import * as sharedUi from '@qovery/shared/ui'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import * as useDeleteMcpServerHook from '../hooks/use-delete-mcp-server/use-delete-mcp-server'
import * as useMcpServersHook from '../hooks/use-mcp-servers/use-mcp-servers'
import { type McpServerCreateEditModalProps } from '../mcp-server-create-edit-modal/mcp-server-create-edit-modal'
import { SettingsAgentPersonalization } from './settings-agent-personalization'

const useMcpServersMock = jest.spyOn(useMcpServersHook, 'useMcpServers') as jest.Mock
const useDeleteMcpServerMock = jest.spyOn(useDeleteMcpServerHook, 'useDeleteMcpServer') as jest.Mock
const useModalMock = jest.spyOn(sharedUi, 'useModal') as jest.Mock
const useModalConfirmationMock = jest.spyOn(sharedUi, 'useModalConfirmation') as jest.Mock
const openModal = jest.fn()
const closeModal = jest.fn()
const openModalConfirmation = jest.fn()
const deleteMcpServer = jest.fn()

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

describe('SettingsAgentPersonalization', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    jest.clearAllMocks()
    useModalMock.mockReturnValue({ openModal, closeModal })
    useModalConfirmationMock.mockReturnValue({ openModalConfirmation })
    useDeleteMcpServerMock.mockReturnValue({ mutateAsync: deleteMcpServer })
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('should render the empty state and organization scope', () => {
    useMcpServersMock.mockReturnValue({ data: [] })

    renderWithProviders(<SettingsAgentPersonalization />)

    expect(screen.getByRole('heading', { name: 'Agent personalization' })).toBeInTheDocument()
    expect(screen.getByText('Your personal settings for Qovery Agent')).toBeInTheDocument()
    expect(
      screen.getByText('Personal MCPs belong to one member. Organization MCPs are shared with the organization.')
    ).toBeInTheDocument()
    expect(screen.getByText('No MCPs')).toBeInTheDocument()
  })

  it('should render MCPs alphabetically with their URL, details tooltip, and actions', async () => {
    useMcpServersMock.mockReturnValue({ data: mcpServers })

    const { userEvent } = renderWithProviders(<SettingsAgentPersonalization />)

    const rows = screen.getAllByTestId(/^mcp-server-/)
    expect(rows[0]).toHaveAttribute('data-testid', 'mcp-server-mcp-alpha')
    expect(rows[1]).toHaveAttribute('data-testid', 'mcp-server-mcp-bravo')
    expect(rows[2]).toHaveAttribute('data-testid', 'mcp-server-mcp-zulu')
    expect(screen.getByText('Personal MCPs')).toBeInTheDocument()
    expect(screen.getByText('Organization MCPs')).toBeInTheDocument()
    expect(screen.queryByText('Owner: Rémi Bonnet')).not.toBeInTheDocument()
    expect(screen.getByText('https://zulu.example.com/mcp')).toBeInTheDocument()
    expect(screen.queryByText('Authorization')).not.toBeInTheDocument()
    expect(screen.queryByText('Second connector')).not.toBeInTheDocument()
    expect(screen.getByLabelText('About Zulu')).toBeInTheDocument()
    await userEvent.hover(screen.getByLabelText('About Alpha'))
    expect((await screen.findAllByText('Owner: Rémi Bonnet')).length).toBeGreaterThan(0)
    expect(screen.getByRole('button', { name: 'Edit Zulu' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Edit Bravo' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Delete Bravo' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Delete Zulu' })).toBeInTheDocument()
  })

  it('should open the create and edit modals', async () => {
    useMcpServersMock.mockReturnValue({ data: mcpServers })
    const { userEvent } = renderWithProviders(<SettingsAgentPersonalization />)

    await userEvent.click(screen.getByRole('button', { name: 'Add MCP' }))
    await userEvent.click(screen.getByRole('button', { name: 'Edit Zulu' }))

    const createModal = openModal.mock.calls[0][0].content as ReactElement<McpServerCreateEditModalProps>
    expect(openModal).toHaveBeenCalledTimes(2)
    expect(createModal.props.scope).toBe(McpServerScope.USER)
    expect(openModal).toHaveBeenNthCalledWith(1, expect.objectContaining({ options: { fakeModal: true, width: 680 } }))
    expect(openModal).toHaveBeenNthCalledWith(2, expect.objectContaining({ options: { fakeModal: true, width: 680 } }))
  })

  it('should confirm deletion with the connector name and organization scope', async () => {
    useMcpServersMock.mockReturnValue({ data: mcpServers })
    const { userEvent } = renderWithProviders(<SettingsAgentPersonalization />)

    await userEvent.click(screen.getByRole('button', { name: 'Delete Zulu' }))
    const confirmation = openModalConfirmation.mock.calls[0][0]
    await confirmation.action()

    expect(confirmation).toEqual(expect.objectContaining({ title: 'Delete MCP', name: 'Zulu' }))
    expect(deleteMcpServer).toHaveBeenCalledWith({ organizationId: 'org-1', mcpServerId: 'mcp-zulu' })
  })
})
