import * as organizationsDomain from '@qovery/domains/organizations/feature'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { AgenticWorkflowSettingsFormHarness } from '../agentic-workflow-settings-test-utils'
import { AgenticWorkflowConnectionsSettings } from './agentic-workflow-connections-settings'

const useMcpServersSpy = jest.spyOn(organizationsDomain, 'useMcpServers') as jest.Mock

jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useParams: () => ({ organizationId: 'organization-1' }),
}))

describe('AgenticWorkflowConnectionsSettings', () => {
  beforeEach(() => {
    useMcpServersSpy.mockReturnValue({
      data: [{ id: 'mcp-1', name: 'Documentation', url: 'https://docs.example.com' }],
      isLoading: false,
    })
  })

  it('renders Git context and MCPs', () => {
    renderWithProviders(
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
        {(form) => <AgenticWorkflowConnectionsSettings form={form} />}
      </AgenticWorkflowSettingsFormHarness>
    )

    expect(screen.getByText('qovery/console')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Remove Documentation' })).toBeInTheDocument()
  })
})
