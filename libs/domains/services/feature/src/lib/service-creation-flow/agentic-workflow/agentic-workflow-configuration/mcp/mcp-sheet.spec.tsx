import { type McpServerResponse, McpServerScope } from 'qovery-typescript-axios'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { McpSheet, hasOrganizationMcpCreationPermission } from './mcp-sheet'

jest.mock('@qovery/domains/organizations/feature', () => ({
  McpServerCreateEditModal: () => <div>Create MCP server</div>,
}))

const mcpServers = [
  {
    id: 'm1',
    name: 'Qovery Read-only',
    url: 'https://mcp.qovery.com/mcp',
    scope: McpServerScope.ORGANIZATION,
    attachable: true,
  },
  {
    id: 'm2',
    name: 'Romaric tools',
    url: 'https://example.com/mcp',
    scope: McpServerScope.USER,
    owner_name: 'Romaric Philogène',
    attachable: false,
  },
  {
    id: 'm3',
    name: 'Unknown owner tools',
    url: 'https://unknown.example.com/mcp',
    scope: McpServerScope.USER,
    owner_name: null,
    attachable: false,
  },
] as McpServerResponse[]

function setup(
  value: string[] = [],
  onChange = jest.fn(),
  onClose = jest.fn(),
  lockedMcpServerIds: string[] = [],
  lockedMcpServerReason?: string
) {
  return {
    onChange,
    onClose,
    ...renderWithProviders(
      <McpSheet
        createdMcpServers={[]}
        isLoading={false}
        lockedMcpServerIds={lockedMcpServerIds}
        lockedMcpServerReason={lockedMcpServerReason}
        mcpServers={mcpServers}
        value={value}
        onChange={onChange}
        onClose={onClose}
        onMcpServerCreated={jest.fn()}
      />
    ),
  }
}

describe('McpSheet', () => {
  it.each([
    { role: 'organization:org-1:admin', isQoveryAdminUser: false },
    { role: 'organization:org-1:owner', isQoveryAdminUser: false },
    { role: 'organization:org-1:viewer', isQoveryAdminUser: true },
  ])('allows organization MCP creation for $role', ({ role, isQoveryAdminUser }) => {
    expect(
      hasOrganizationMcpCreationPermission({
        isQoveryAdminUser,
        organizationId: 'org-1',
        roles: [role],
      })
    ).toBe(true)
  })

  it('does not allow organization MCP creation for a non-admin member', () => {
    expect(
      hasOrganizationMcpCreationPermission({
        isQoveryAdminUser: false,
        organizationId: 'org-1',
        roles: ['organization:org-1:viewer'],
      })
    ).toBe(false)
  })

  it('lists available MCP servers', () => {
    setup()

    expect(screen.getByRole('heading', { name: 'Manage MCP' })).toBeInTheDocument()
    expect(screen.getByText('MCP Qovery')).toBeInTheDocument()
  })

  it('finds the Qovery MCP by its display name', async () => {
    const { userEvent } = setup()

    await userEvent.type(screen.getByPlaceholderText('Search MCP'), 'MCP Qovery')

    expect(screen.getByText('MCP Qovery')).toBeInTheDocument()
  })

  it('links a server when clicked', async () => {
    const onChange = jest.fn()
    const { userEvent } = setup([], onChange)

    await userEvent.click(screen.getByRole('button', { name: 'Add MCP Qovery' }))

    expect(onChange).toHaveBeenCalledWith(['m1'])
  })

  it('hides MCPs that are not available to attach', () => {
    setup()

    expect(screen.queryByText('Romaric tools')).not.toBeInTheDocument()
    expect(screen.queryByText('Unknown owner tools')).not.toBeInTheDocument()
  })

  it('keeps an unavailable connected MCP visible so it can be removed', async () => {
    const onChange = jest.fn()
    const { userEvent } = setup(['m2'], onChange)

    expect(screen.getByText('Personal · Romaric Philogène')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Remove Romaric tools' }))

    expect(onChange).toHaveBeenCalledWith([])
  })

  it('prevents removing an MCP required by Qovery service context', async () => {
    const onChange = jest.fn()
    const { userEvent } = setup(['m1'], onChange, jest.fn(), ['m1'])
    const requiredMcp = screen.getByRole('button', {
      name: 'MCP Qovery: This MCP is required by the selected Qovery service context and cannot be removed.',
    })

    expect(requiredMcp).toBeDisabled()
    await userEvent.hover(screen.getByText('MCP Qovery'))

    expect(
      await screen.findAllByText('This MCP is required by the selected Qovery service context and cannot be removed.')
    ).not.toHaveLength(0)
    expect(screen.getByRole('button', { name: 'Remove all' })).toBeDisabled()
    expect(onChange).not.toHaveBeenCalled()
  })

  it('explains when an MCP is required by the selected agent template', async () => {
    const reason = 'This MCP is required by the selected agent template and cannot be removed.'
    const { userEvent } = setup(['m1'], jest.fn(), jest.fn(), ['m1'], reason)

    expect(screen.getByRole('button', { name: `MCP Qovery: ${reason}` })).toBeDisabled()
    await userEvent.hover(screen.getByText('MCP Qovery'))

    expect(await screen.findAllByText(reason)).not.toHaveLength(0)
  })

  it('keeps required MCPs when removing all other connections', async () => {
    const onChange = jest.fn()
    const { userEvent } = setup(['m1', 'm2'], onChange, jest.fn(), ['m1'])

    await userEvent.click(screen.getByRole('button', { name: 'Remove all' }))

    expect(onChange).toHaveBeenCalledWith(['m1'])
  })

  it('closes from the Done button', async () => {
    const onClose = jest.fn()
    const { userEvent } = setup(['m1'], jest.fn(), onClose)

    await userEvent.click(screen.getByRole('button', { name: 'Done' }))

    expect(onClose).toHaveBeenCalled()
  })

  it('locks picker and dismissal actions while saving', () => {
    renderWithProviders(
      <McpSheet
        createdMcpServers={[]}
        isLoading={false}
        isSaving
        mcpServers={mcpServers}
        value={[]}
        onChange={jest.fn()}
        onClose={jest.fn()}
        onMcpServerCreated={jest.fn()}
        onSave={jest.fn()}
      />
    )

    expect(screen.getByRole('button', { name: 'Add MCP Qovery' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'New MCP' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Close' })).toBeDisabled()
  })

  it('announces save failures', async () => {
    const { userEvent } = renderWithProviders(
      <McpSheet
        createdMcpServers={[]}
        isLoading={false}
        mcpServers={mcpServers}
        value={[]}
        onChange={jest.fn()}
        onClose={jest.fn()}
        onMcpServerCreated={jest.fn()}
        onSave={jest.fn().mockRejectedValue(new Error('Unable to save'))}
      />
    )

    await userEvent.click(screen.getByRole('button', { name: 'Save' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Unable to save the MCP selection. Try again.')
  })
})
