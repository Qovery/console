import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { AgenticWorkflowSettingsFormHarness } from '../agentic-workflow-settings-test-utils'
import { AgenticWorkflowGovernanceSettings } from './agentic-workflow-governance-settings'

describe('AgenticWorkflowGovernanceSettings', () => {
  it('renders both network allowlists', () => {
    renderWithProviders(
      <AgenticWorkflowSettingsFormHarness>
        {(form) => <AgenticWorkflowGovernanceSettings form={form} />}
      </AgenticWorkflowSettingsFormHarness>
    )

    expect(screen.getByRole('textbox', { name: 'Domain allowlist' })).toHaveValue('*')
    expect(screen.getByRole('textbox', { name: 'Webhook IP allowlist' })).toHaveValue('10.0.0.0/8')
  })
})
