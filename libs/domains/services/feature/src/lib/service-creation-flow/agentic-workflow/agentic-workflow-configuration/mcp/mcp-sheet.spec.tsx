import { type McpServerResponse } from 'qovery-typescript-axios'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { McpSheet } from './mcp-sheet'

jest.mock('@qovery/domains/organizations/feature', () => ({
  McpServerCreateEditModal: () => <div>Create MCP server</div>,
}))

const mcpServers = [{ id: 'm1', name: 'Qovery Read-only', url: 'https://mcp.qovery.com' }] as McpServerResponse[]

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

  it('closes from the Save button', async () => {
    const onClose = jest.fn()
    const { userEvent } = setup(['m1'], jest.fn(), onClose)

    await userEvent.click(screen.getByRole('button', { name: 'Save' }))

    expect(onClose).toHaveBeenCalled()
  })
})
