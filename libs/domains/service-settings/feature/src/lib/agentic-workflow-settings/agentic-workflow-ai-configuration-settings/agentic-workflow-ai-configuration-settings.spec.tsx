import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { AgenticWorkflowSettingsFormHarness } from '../agentic-workflow-settings-test-utils'
import { AgenticWorkflowAiConfigurationSettings } from './agentic-workflow-ai-configuration-settings'

describe('AgenticWorkflowAiConfigurationSettings', () => {
  it('renders the write-only API key, model settings, and instructions', () => {
    renderWithProviders(
      <AgenticWorkflowSettingsFormHarness>
        {(form) => <AgenticWorkflowAiConfigurationSettings environmentId="environment-1" form={form} />}
      </AgenticWorkflowSettingsFormHarness>
    )

    expect(screen.getByLabelText('API key')).toHaveValue('')
    expect(screen.getByText('Cloud settings JSON')).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Instructions' })).not.toBeInTheDocument()
    const instructions = screen.getByRole('textbox', { name: 'Instructions' })
    expect(instructions).toBeInTheDocument()
    expect(instructions).toHaveAttribute('aria-invalid', 'false')
  })

  it('does not show an instructions error before the field is modified', () => {
    renderWithProviders(
      <AgenticWorkflowSettingsFormHarness values={{ agentPrompt: '' }}>
        {(form) => <AgenticWorkflowAiConfigurationSettings environmentId="environment-1" form={form} />}
      </AgenticWorkflowSettingsFormHarness>
    )

    expect(screen.getByRole('textbox', { name: 'Instructions' })).toHaveAttribute('aria-invalid', 'false')
    expect(screen.queryByText('Please enter instructions.')).not.toBeInTheDocument()
  })
})
