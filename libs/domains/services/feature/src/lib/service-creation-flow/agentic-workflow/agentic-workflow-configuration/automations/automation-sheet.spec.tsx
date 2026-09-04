import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { type AgenticWorkflowAutomation } from '../../agentic-workflow-context'
import { AutomationSheet } from './automation-sheet'

const emptyAutomation: AgenticWorkflowAutomation = { id: 'automation-1', triggers: [], outputs: [] }

describe('AutomationSheet', () => {
  it('requires at least one trigger before saving', async () => {
    const onSave = jest.fn()
    const { userEvent } = renderWithProviders(
      <AutomationSheet automation={emptyAutomation} onClose={jest.fn()} onSave={onSave} />
    )

    const save = screen.getByRole('button', { name: 'Apply changes' })
    expect(save).toBeDisabled()

    // The Triggers section "Add" is the first one (Outputs also has an "Add").
    await userEvent.click(screen.getAllByRole('button', { name: 'Add' })[0])
    await userEvent.click(screen.getByRole('menuitem', { name: 'From a webhook' }))

    expect(screen.getByText('Webhook')).toBeInTheDocument()
    expect(save).toBeEnabled()

    await userEvent.click(save)
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ triggers: [expect.objectContaining({ type: 'webhook' })] })
    )
  })

  it('shows configured triggers and outputs when editing', () => {
    const automation: AgenticWorkflowAutomation = {
      id: 'automation-1',
      triggers: [{ id: 'trigger-1', type: 'schedule', cronExpression: '0 8 * * 1-5', timezone: 'Etc/UTC' }],
      outputs: [{ url: 'https://hooks.example.com', headersJson: '{}', prompt: '' }],
    }

    renderWithProviders(<AutomationSheet automation={automation} onClose={jest.fn()} onSave={jest.fn()} />)

    expect(screen.getByText('Schedule')).toBeInTheDocument()
    expect(screen.getByText('https://hooks.example.com')).toBeInTheDocument()
    expect(screen.queryByRole('switch', { name: 'Enable agent task' })).not.toBeInTheDocument()
  })
})
