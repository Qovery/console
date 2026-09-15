import { McpServerScope } from 'qovery-typescript-axios'
import * as organizationsDomain from '@qovery/domains/organizations/feature'
import * as servicesDomain from '@qovery/domains/services/feature'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { AgenticWorkflowSettingsFormHarness } from '../agentic-workflow-settings-test-utils'
import { AgenticWorkflowConnectionsSettings } from './agentic-workflow-connections-settings'

const useMcpServersSpy = jest.spyOn(organizationsDomain, 'useMcpServers') as jest.Mock
const useCreateQoveryMcpServerSpy = jest.spyOn(organizationsDomain, 'useCreateQoveryMcpServer') as jest.Mock
const useContextServicesSpy = jest.spyOn(servicesDomain, 'useAgenticWorkflowContextServices') as jest.Mock

jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useParams: () => ({ organizationId: 'organization-1' }),
}))

describe('AgenticWorkflowConnectionsSettings', () => {
  beforeEach(() => {
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
      isLoading: false,
    })
    useContextServicesSpy.mockReturnValue({ data: [], isLoading: false })
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
    useContextServicesSpy.mockReturnValue({
      data: [{ id: 'service-1', name: 'api', type: 'APPLICATION' }],
      isLoading: false,
    })
    const { userEvent } = renderWithProviders(
      <AgenticWorkflowSettingsFormHarness values={{ contextServiceIds: ['service-1'] }}>
        {(form) => (
          <AgenticWorkflowConnectionsSettings environmentId="environment-1" form={form} gitTokensLoading={false} />
        )}
      </AgenticWorkflowSettingsFormHarness>
    )

    expect(screen.getByText('api')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Manage Qovery service context' }))
    expect(screen.getByRole('checkbox', { name: 'api' })).toBeChecked()
  })
})
