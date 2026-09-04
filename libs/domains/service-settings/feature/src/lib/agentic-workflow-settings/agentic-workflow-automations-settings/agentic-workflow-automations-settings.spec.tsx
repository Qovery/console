import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { AgenticWorkflowSettingsFormHarness } from '../agentic-workflow-settings-test-utils'
import { AgenticWorkflowAutomationsSettings } from './agentic-workflow-automations-settings'

describe('AgenticWorkflowAutomationsSettings', () => {
  it('summarizes and opens the automation editor', async () => {
    const { userEvent } = renderWithProviders(
      <AgenticWorkflowSettingsFormHarness
        values={{
          automation: {
            id: 'automation',
            triggers: [
              { id: 'webhook', type: 'webhook' },
              { id: 'schedule', type: 'schedule', cronExpression: '0 8 * * 1-5', timezone: 'Europe/Paris' },
            ],
            outputs: [{ name: 'Audit log', url: null, headersJson: '{}', prompt: '' }],
          },
        }}
      >
        {(form) => <AgenticWorkflowAutomationsSettings form={form} />}
      </AgenticWorkflowSettingsFormHarness>
    )

    expect(screen.getByText('Webhook + schedule')).toBeInTheDocument()
    expect(screen.getByText('1 output configured')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Configure' }))

    expect(screen.getByText('Configure automation')).toBeInTheDocument()
    expect(screen.getByText('Audit log')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Apply changes' })).toBeInTheDocument()
  })
})
