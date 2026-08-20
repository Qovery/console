import { type McpServerResponse } from 'qovery-typescript-axios'
import { renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import * as useCreateMcpServerHook from '../hooks/use-create-mcp-server/use-create-mcp-server'
import * as useEditMcpServerHook from '../hooks/use-edit-mcp-server/use-edit-mcp-server'
import { McpServerCreateEditModal, type McpServerCreateEditModalProps } from './mcp-server-create-edit-modal'

const useCreateMcpServerMock = jest.spyOn(useCreateMcpServerHook, 'useCreateMcpServer') as jest.Mock
const useEditMcpServerMock = jest.spyOn(useEditMcpServerHook, 'useEditMcpServer') as jest.Mock

const props: McpServerCreateEditModalProps = {
  onClose: jest.fn(),
}

jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useParams: () => ({ organizationId: 'org-1' }),
}))

describe('McpServerCreateEditModal', () => {
  const createMcpServer = jest.fn()
  const editMcpServer = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    createMcpServer.mockResolvedValue({ id: 'mcp-1' })
    editMcpServer.mockResolvedValue({ id: 'mcp-1' })
    useCreateMcpServerMock.mockReturnValue({ mutateAsync: createMcpServer, isLoading: false })
    useEditMcpServerMock.mockReturnValue({ mutateAsync: editMcpServer, isLoading: false })
  })

  it('should create an MCP with headers', async () => {
    const { userEvent } = renderWithProviders(<McpServerCreateEditModal {...props} />)

    await userEvent.type(screen.getByLabelText('Name'), 'GitHub')
    await userEvent.type(screen.getByLabelText('Server URL'), 'https://example.com/mcp')
    await userEvent.type(screen.getByLabelText('Description (optional)'), 'GitHub tools')
    await userEvent.click(screen.getByRole('button', { name: 'Add header' }))
    await userEvent.type(screen.getByLabelText('Header 1 name'), 'Authorization')
    await userEvent.type(screen.getByLabelText('Header 1 value'), 'Bearer secret')
    await userEvent.click(screen.getByRole('button', { name: 'Add MCP' }))

    await waitFor(() =>
      expect(createMcpServer).toHaveBeenCalledWith({
        organizationId: 'org-1',
        mcpServerRequest: {
          name: 'GitHub',
          description: 'GitHub tools',
          url: 'https://example.com/mcp',
          headers: { Authorization: 'Bearer secret' },
        },
      })
    )
  })

  it('should reject non-HTTPS URLs', async () => {
    const { userEvent } = renderWithProviders(<McpServerCreateEditModal {...props} />)

    await userEvent.type(screen.getByLabelText('Name'), 'GitHub')
    await userEvent.type(screen.getByLabelText('Server URL'), 'http://example.com/mcp')
    await userEvent.tab()

    expect(await screen.findByText('Please enter a valid HTTPS URL.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add MCP' })).toBeDisabled()
  })

  it('should reject duplicate header names', async () => {
    const { userEvent } = renderWithProviders(<McpServerCreateEditModal {...props} />)

    await userEvent.click(screen.getByRole('button', { name: 'Add header' }))
    await userEvent.click(screen.getByRole('button', { name: 'Add header' }))
    await userEvent.type(screen.getByLabelText('Header 1 name'), 'Authorization')
    await userEvent.type(screen.getByLabelText('Header 2 name'), 'authorization')

    expect(await screen.findAllByText('Header names must be unique.')).toHaveLength(2)

    await userEvent.clear(screen.getByLabelText('Header 1 name'))
    await userEvent.type(screen.getByLabelText('Header 1 name'), 'X-API-Key')

    await waitFor(() => expect(screen.queryByText('Header names must be unique.')).not.toBeInTheDocument())
  })

  it('should require existing header values again when editing', async () => {
    const mcpServer: McpServerResponse = {
      id: 'mcp-1',
      name: 'GitHub',
      description: 'GitHub tools',
      url: 'https://example.com/mcp',
      header_names: new Set(['Authorization']),
      created_at: '2026-08-01T10:00:00Z',
      updated_at: '2026-08-01T10:00:00Z',
    }
    const { userEvent } = renderWithProviders(<McpServerCreateEditModal {...props} mcpServer={mcpServer} />)

    expect(screen.getByText('Re-enter every header value')).toBeInTheDocument()
    expect(screen.getByLabelText('Header 1 value')).toHaveAttribute('type', 'password')
    expect(screen.getByRole('button', { name: 'Save MCP' })).toBeDisabled()

    await userEvent.type(screen.getByLabelText('Header 1 value'), 'Bearer new-secret')
    await userEvent.click(screen.getByRole('button', { name: 'Save MCP' }))

    await waitFor(() =>
      expect(editMcpServer).toHaveBeenCalledWith({
        organizationId: 'org-1',
        mcpServerId: 'mcp-1',
        mcpServerRequest: {
          name: 'GitHub',
          description: 'GitHub tools',
          url: 'https://example.com/mcp',
          headers: { Authorization: 'Bearer new-secret' },
        },
      })
    )
  })
})
