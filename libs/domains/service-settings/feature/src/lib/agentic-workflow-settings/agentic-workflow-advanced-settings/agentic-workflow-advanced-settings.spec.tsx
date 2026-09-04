import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { AgenticWorkflowSettingsFormHarness } from '../agentic-workflow-settings-test-utils'
import { AgenticWorkflowAdvancedSettings } from './agentic-workflow-advanced-settings'

describe('AgenticWorkflowAdvancedSettings', () => {
  it('renders the Dockerfile configuration with an apply action', async () => {
    const { userEvent } = renderWithProviders(
      <AgenticWorkflowSettingsFormHarness values={{ mcp: '{"mcpServers":{}}', dockerFragment: 'RUN apt-get update' }}>
        {(form) => <AgenticWorkflowAdvancedSettings form={form} />}
      </AgenticWorkflowSettingsFormHarness>
    )

    expect(screen.getByRole('button', { name: 'Delete Dockerfile fragment' })).toBeInTheDocument()
    expect(screen.queryByText('Advanced MCP configuration')).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Edit' }))
    expect(screen.getByRole('button', { name: 'Apply changes' })).toBeInTheDocument()
  })
})
