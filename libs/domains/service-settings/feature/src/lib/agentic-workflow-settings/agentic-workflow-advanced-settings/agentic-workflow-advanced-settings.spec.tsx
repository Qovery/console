import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { AgenticWorkflowSettingsFormHarness } from '../agentic-workflow-settings-test-utils'
import { AgenticWorkflowAdvancedSettings } from './agentic-workflow-advanced-settings'

describe('AgenticWorkflowAdvancedSettings', () => {
  it('renders the Dockerfile and MCP configurations', () => {
    renderWithProviders(
      <AgenticWorkflowSettingsFormHarness values={{ mcp: '{"mcpServers":{}}', dockerFragment: 'RUN apt-get update' }}>
        {(form) => <AgenticWorkflowAdvancedSettings form={form} />}
      </AgenticWorkflowSettingsFormHarness>
    )

    expect(screen.getByRole('button', { name: 'Delete Advanced MCP configuration' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Delete Dockerfile fragment' })).toBeInTheDocument()
  })
})
