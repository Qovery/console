import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { AgenticWorkflowSettingsFormHarness } from '../agentic-workflow-settings-test-utils'
import { AgenticWorkflowGeneralSettings } from './agentic-workflow-general-settings'

describe('AgenticWorkflowGeneralSettings', () => {
  it('shows errors for existing resources below the minimums', () => {
    renderWithProviders(
      <AgenticWorkflowSettingsFormHarness values={{ cpu: '500', ram: '1024' }}>
        {(form) => <AgenticWorkflowGeneralSettings form={form} />}
      </AgenticWorkflowSettingsFormHarness>
    )

    expect(screen.getByText('CPU (mCPU) must be at least 1000.')).toBeInTheDocument()
    expect(screen.getByText('Memory (MiB) must be at least 2046.')).toBeInTheDocument()
  })

  it('renders identity, execution mode, and resources', async () => {
    const { userEvent } = renderWithProviders(
      <AgenticWorkflowSettingsFormHarness>
        {(form) => <AgenticWorkflowGeneralSettings form={form} />}
      </AgenticWorkflowSettingsFormHarness>
    )

    expect(screen.getByRole('textbox', { name: 'Name' })).toHaveValue('Incident assistant')
    expect(screen.getByRole('spinbutton', { name: 'CPU (mCPU)' })).toHaveValue(2000)

    const cpuInput = screen.getByRole('spinbutton', { name: 'CPU (mCPU)' })
    const memoryInput = screen.getByRole('spinbutton', { name: 'Memory (MiB)' })
    await userEvent.clear(cpuInput)
    await userEvent.type(cpuInput, '999')
    await userEvent.clear(memoryInput)
    await userEvent.type(memoryInput, '2045')

    expect(screen.getByText('CPU (mCPU) must be at least 1000.')).toBeInTheDocument()
    expect(screen.getByText('Memory (MiB) must be at least 2046.')).toBeInTheDocument()

    await userEvent.clear(cpuInput)
    await userEvent.clear(memoryInput)
    expect(screen.getByText('CPU is required.')).toBeInTheDocument()
    expect(screen.getByText('Memory is required.')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: /Clone environment/ }))

    expect(screen.getByRole('button', { name: /Clone environment/ })).toHaveAttribute('aria-pressed', 'true')
  })
})
