import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { AgenticWorkflowSettingsFormHarness } from '../agentic-workflow-settings-test-utils'
import { AgenticWorkflowAutomationsSettings } from './agentic-workflow-automations-settings'

describe('AgenticWorkflowAutomationsSettings', () => {
  const automation = {
    id: 'automation',
    triggers: [
      { id: 'webhook', type: 'webhook' as const },
      {
        id: 'schedule',
        type: 'schedule' as const,
        cronExpression: '0 8 * * 1-5',
        timezone: 'Europe/Paris',
      },
    ],
    outputs: [{ name: 'Audit log', url: null, headersJson: '{}', prompt: '' }],
  }

  it('summarizes and opens the trigger editor', async () => {
    const { userEvent } = renderWithProviders(
      <AgenticWorkflowSettingsFormHarness values={{ automation }}>
        {(form) => <AgenticWorkflowAutomationsSettings form={form} section="triggers" />}
      </AgenticWorkflowSettingsFormHarness>
    )

    expect(screen.getByText('Schedule')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Configure' }))

    expect(screen.getByText('Configure triggers')).toBeInTheDocument()
    expect(screen.queryByText('Audit log')).not.toBeInTheDocument()
  })

  it('summarizes and opens the output editor', async () => {
    const { userEvent } = renderWithProviders(
      <AgenticWorkflowSettingsFormHarness values={{ automation }}>
        {(form) => <AgenticWorkflowAutomationsSettings form={form} section="outputs" />}
      </AgenticWorkflowSettingsFormHarness>
    )

    expect(screen.getByText('1 output configured')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Configure' }))

    expect(screen.getByText('Configure output')).toBeInTheDocument()
    expect(screen.getByText('Audit log')).toBeInTheDocument()
  })
})
