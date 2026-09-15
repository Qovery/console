import { McpServerScope } from 'qovery-typescript-axios'
import { type UseFormReturn } from 'react-hook-form'
import * as organizationsDomain from '@qovery/domains/organizations/feature'
import * as servicesDomain from '@qovery/domains/services/feature'
import { renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import { type AgenticWorkflowSettingsFormValues } from '../agentic-workflow-settings'
import { AgenticWorkflowSettingsFormHarness } from '../agentic-workflow-settings-test-utils'
import { AgenticWorkflowConnectionsSettings } from './agentic-workflow-connections-settings'

const useMcpServersSpy = jest.spyOn(organizationsDomain, 'useMcpServers') as jest.Mock
const useCreateQoveryMcpServerSpy = jest.spyOn(organizationsDomain, 'useCreateQoveryMcpServer') as jest.Mock
const useContextServicesSpy = jest.spyOn(servicesDomain, 'useAgenticWorkflowContextServices') as jest.Mock
const refetchMcpServers = jest.fn()

jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useParams: () => ({ organizationId: 'organization-1' }),
}))

describe('AgenticWorkflowConnectionsSettings', () => {
  beforeEach(() => {
    refetchMcpServers.mockReset().mockResolvedValue({ data: [], isError: false })
    useMcpServersSpy.mockReturnValue({
      data: [
        {
          id: 'mcp-1',
          name: 'Documentation',
          url: 'https://docs.example.com',
          scope: McpServerScope.ORGANIZATION,
          attachable: true,
        },
      ],
      isError: false,
      isLoading: false,
      refetch: refetchMcpServers,
    })
    useContextServicesSpy.mockReturnValue({ data: [], isError: false, isLoading: false })
    useCreateQoveryMcpServerSpy.mockReturnValue({ mutateAsync: jest.fn() })
  })

  it('renders Git context and MCPs with settings-specific confirmation labels', async () => {
    const { userEvent } = renderWithProviders(
      <AgenticWorkflowSettingsFormHarness
        values={{
          repositories: [
            {
              repository: 'qovery/console',
              branch: 'staging',
              gitRepository: {
                id: 'repository-1',
                name: 'qovery/console',
                url: 'https://github.com/qovery/console.git',
                default_branch: 'staging',
              },
              isPublicRepository: true,
            },
          ],
          mcpServerIds: ['mcp-1'],
          mcp: '{"mcpServers":{}}',
          dockerFragment: 'RUN apt-get update',
        }}
      >
        {(form) => (
          <AgenticWorkflowConnectionsSettings environmentId="environment-1" form={form} gitTokensLoading={false} />
        )}
      </AgenticWorkflowSettingsFormHarness>
    )

    expect(screen.getByText('qovery/console')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Remove Documentation' })).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Manage context' }))
    expect(screen.getByRole('button', { name: 'Apply changes' })).toBeInTheDocument()
  })

  it('shows and edits persisted Qovery service context', async () => {
    const qoveryMcpServer = {
      id: 'qovery-mcp',
      name: 'qovery',
      url: 'https://mcp.qovery.com/mcp',
      scope: McpServerScope.ORGANIZATION,
      attachable: true,
    }
    useMcpServersSpy.mockReturnValue({ data: [qoveryMcpServer], isLoading: false })
    useContextServicesSpy.mockReturnValue({
      data: [{ id: 'service-1', name: 'api', type: 'APPLICATION' }],
      isLoading: false,
    })
    let settingsForm: UseFormReturn<AgenticWorkflowSettingsFormValues> | undefined
    const { userEvent } = renderWithProviders(
      <AgenticWorkflowSettingsFormHarness
        values={{
          contextServiceIds: ['service-1'],
          mcpServerIds: [qoveryMcpServer.id],
          requiredMcpServerIds: [qoveryMcpServer.id],
        }}
      >
        {(form) => {
          settingsForm = form
          return (
            <AgenticWorkflowConnectionsSettings environmentId="environment-1" form={form} gitTokensLoading={false} />
          )
        }}
      </AgenticWorkflowSettingsFormHarness>
    )

    expect(screen.getByText('api')).toBeInTheDocument()
    const lockedMcpButton = screen.getByRole('button', {
      name: /MCP Qovery: This MCP is required by the selected Qovery service context/,
    })
    expect(lockedMcpButton).toBeDisabled()
    await userEvent.hover(lockedMcpButton.parentElement as HTMLElement)
    expect(await screen.findByRole('tooltip')).toHaveTextContent(
      'This MCP is required by the selected Qovery service context and cannot be removed.'
    )
    await userEvent.click(screen.getByRole('button', { name: 'Manage Qovery service context' }))
    expect(screen.getByRole('checkbox', { name: 'api' })).toBeChecked()
    await userEvent.click(screen.getByRole('checkbox', { name: 'api' }))
    await userEvent.click(screen.getByRole('button', { name: 'Confirm' }))

    expect(settingsForm?.getValues('contextServiceIds')).toEqual([])
    expect(settingsForm?.getValues('requiredMcpServerIds')).toEqual([qoveryMcpServer.id])
    expect(screen.getByText('Add Qovery services')).toBeInTheDocument()
  })

  it('creates an attachable Qovery MCP instead of selecting an unavailable one', async () => {
    const unavailableQoveryMcpServer = {
      id: 'unavailable-qovery-mcp',
      name: 'qovery',
      url: 'https://mcp.qovery.com/mcp',
      scope: McpServerScope.USER,
      attachable: false,
    }
    const createdQoveryMcpServer = {
      id: 'created-qovery-mcp',
      name: 'qovery',
      url: 'https://mcp.qovery.com/mcp',
      scope: McpServerScope.ORGANIZATION,
    }
    const createQoveryMcpServer = jest.fn().mockResolvedValue(createdQoveryMcpServer)
    useMcpServersSpy.mockReturnValue({ data: [unavailableQoveryMcpServer], isLoading: false })
    useContextServicesSpy.mockReturnValue({
      data: [{ id: 'service-1', name: 'api', type: 'APPLICATION' }],
      isLoading: false,
    })
    useCreateQoveryMcpServerSpy.mockReturnValue({ mutateAsync: createQoveryMcpServer })
    let settingsForm: UseFormReturn<AgenticWorkflowSettingsFormValues> | undefined
    const { userEvent } = renderWithProviders(
      <AgenticWorkflowSettingsFormHarness>
        {(form) => {
          settingsForm = form
          return (
            <AgenticWorkflowConnectionsSettings environmentId="environment-1" form={form} gitTokensLoading={false} />
          )
        }}
      </AgenticWorkflowSettingsFormHarness>
    )

    await userEvent.click(screen.getByRole('button', { name: /^Add Qovery services/ }))
    await userEvent.click(screen.getByRole('checkbox', { name: 'api' }))
    await userEvent.click(screen.getByRole('button', { name: 'Confirm' }))

    expect(createQoveryMcpServer).toHaveBeenCalledWith({ organizationId: 'organization-1' })
    expect(settingsForm?.getValues('mcpServerIds')).toEqual([createdQoveryMcpServer.id])
    expect(settingsForm?.getValues('requiredMcpServerIds')).toEqual([createdQoveryMcpServer.id])
  })

  it('does not create a Qovery MCP when the MCP inventory cannot be loaded', async () => {
    const createQoveryMcpServer = jest.fn()
    refetchMcpServers.mockResolvedValue({
      data: undefined,
      error: new Error('MCP servers failed to load'),
      isError: true,
    })
    useMcpServersSpy.mockReturnValue({
      data: undefined,
      isError: true,
      isLoading: false,
      refetch: refetchMcpServers,
    })
    useContextServicesSpy.mockReturnValue({
      data: [{ id: 'service-1', name: 'api', type: 'APPLICATION' }],
      isError: false,
      isLoading: false,
    })
    useCreateQoveryMcpServerSpy.mockReturnValue({ mutateAsync: createQoveryMcpServer })
    const { userEvent } = renderWithProviders(
      <AgenticWorkflowSettingsFormHarness>
        {(form) => (
          <AgenticWorkflowConnectionsSettings environmentId="environment-1" form={form} gitTokensLoading={false} />
        )}
      </AgenticWorkflowSettingsFormHarness>
    )

    await userEvent.click(screen.getByRole('button', { name: /^Add Qovery services/ }))
    await userEvent.click(screen.getByRole('checkbox', { name: 'api' }))
    await userEvent.click(screen.getByRole('button', { name: 'Confirm' }))

    await waitFor(() => expect(refetchMcpServers).toHaveBeenCalled())
    expect(createQoveryMcpServer).not.toHaveBeenCalled()
    expect(screen.getByText('Unable to add the selected services. Try again.')).toBeInTheDocument()
  })

  it('prevents editing service context when the context inventory cannot be loaded', () => {
    useContextServicesSpy.mockReturnValue({ data: undefined, isError: true, isLoading: false })

    renderWithProviders(
      <AgenticWorkflowSettingsFormHarness values={{ contextServiceIds: ['service-1'] }}>
        {(form) => (
          <AgenticWorkflowConnectionsSettings environmentId="environment-1" form={form} gitTokensLoading={false} />
        )}
      </AgenticWorkflowSettingsFormHarness>
    )

    expect(screen.getByRole('button', { name: /^Add Qovery services/ })).toBeDisabled()
  })

  it.each([
    { contextServicesLoading: true, mcpServersLoading: false },
    { contextServicesLoading: false, mcpServersLoading: true },
  ])(
    'prevents editing persisted Qovery service context while dependencies are loading',
    ({ contextServicesLoading, mcpServersLoading }) => {
      useMcpServersSpy.mockReturnValue({ data: [], isLoading: mcpServersLoading })
      useContextServicesSpy.mockReturnValue({
        data: [{ id: 'service-1', name: 'api', type: 'APPLICATION' }],
        isLoading: contextServicesLoading,
      })

      renderWithProviders(
        <AgenticWorkflowSettingsFormHarness values={{ contextServiceIds: ['service-1'] }}>
          {(form) => (
            <AgenticWorkflowConnectionsSettings environmentId="environment-1" form={form} gitTokensLoading={false} />
          )}
        </AgenticWorkflowSettingsFormHarness>
      )

      expect(screen.getByRole('button', { name: 'Manage Qovery service context' })).toBeDisabled()
    }
  )
})
