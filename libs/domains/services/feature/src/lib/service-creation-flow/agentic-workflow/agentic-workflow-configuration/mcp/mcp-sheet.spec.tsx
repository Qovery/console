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
    url: 'https://mcp.qovery.com',
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

function setup(value: string[] = [], onChange = jest.fn(), onClose = jest.fn()) {
  return {
    onChange,
    onClose,
    ...renderWithProviders(
      <McpSheet
        createdMcpServers={[]}
        isLoading={false}
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
    expect(screen.getByText('Qovery Read-only')).toBeInTheDocument()
  })

  it('links a server when clicked', async () => {
    const onChange = jest.fn()
    const { userEvent } = setup([], onChange)

    await userEvent.click(screen.getByRole('button', { name: 'Add Qovery Read-only' }))

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

  it('closes from the Done button', async () => {
    const onClose = jest.fn()
    const { userEvent } = setup(['m1'], jest.fn(), onClose)

    await userEvent.click(screen.getByRole('button', { name: 'Done' }))

    expect(onClose).toHaveBeenCalled()
  })
})
