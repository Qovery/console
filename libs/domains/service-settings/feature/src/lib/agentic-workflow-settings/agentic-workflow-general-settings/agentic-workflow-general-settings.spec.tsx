import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { AgenticWorkflowSettingsFormHarness } from '../agentic-workflow-settings-test-utils'
import { AgenticWorkflowGeneralSettings } from './agentic-workflow-general-settings'

describe('AgenticWorkflowGeneralSettings', () => {
  it('renders identity, execution mode, and resources', async () => {
    const { userEvent } = renderWithProviders(
      <AgenticWorkflowSettingsFormHarness>
        {(form) => <AgenticWorkflowGeneralSettings form={form} />}
      </AgenticWorkflowSettingsFormHarness>
    )

    expect(screen.getByRole('textbox', { name: 'Name' })).toHaveValue('Incident assistant')
    expect(screen.getByRole('spinbutton', { name: 'CPU (mCPU)' })).toHaveValue(2000)

    await userEvent.click(screen.getByRole('button', { name: /Clone environment/ }))

    expect(screen.getByRole('button', { name: /Clone environment/ })).toHaveAttribute('aria-pressed', 'true')
  })
})
