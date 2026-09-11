import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { type AgenticWorkflowAutomation } from '../../agentic-workflow-context'
import { AutomationSheet } from './automation-sheet'

const emptyAutomation: AgenticWorkflowAutomation = { id: 'automation-1', triggers: [], outputs: [] }

describe('AutomationSheet', () => {
  it('shows and focuses the missing trigger error until a trigger is added', async () => {
    const { userEvent } = renderWithProviders(
      <AutomationSheet automation={emptyAutomation} showTriggerError onClose={jest.fn()} onSave={jest.fn()} />
    )

    expect(screen.getByText('At least one trigger is required.')).toBeInTheDocument()
    expect(screen.getByTestId('trigger-validation')).toHaveFocus()
    expect(screen.getByTestId('trigger-validation')).toHaveClass('outline-negative')

    await userEvent.click(screen.getAllByRole('button', { name: 'Add' })[0])
    await userEvent.click(screen.getByRole('menuitem', { name: 'From a webhook' }))

    expect(screen.getByTestId('trigger-validation')).not.toHaveClass('outline-negative')
  })

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

  it('links to the CRON expression builder when configuring a schedule', async () => {
    const { userEvent } = renderWithProviders(
      <AutomationSheet automation={emptyAutomation} onClose={jest.fn()} onSave={jest.fn()} />
    )

    await userEvent.click(screen.getAllByRole('button', { name: 'Add' })[0])
    await userEvent.click(screen.getByRole('menuitem', { name: 'On a schedule' }))

    expect(screen.getByRole('link', { name: 'CRON expression builder' })).toHaveAttribute(
      'href',
      'https://crontab.guru/'
    )
  })

  it('allows saving outputs independently from triggers', async () => {
    const onSave = jest.fn()
    const { userEvent } = renderWithProviders(
      <AutomationSheet automation={emptyAutomation} section="outputs" onClose={jest.fn()} onSave={onSave} />
    )

    expect(screen.getByRole('heading', { name: 'Configure output' })).toBeInTheDocument()
    expect(screen.queryByText('Triggers')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Apply changes' })).toBeEnabled()

    await userEvent.click(screen.getByRole('button', { name: 'Apply changes' }))
    expect(onSave).toHaveBeenCalledWith(emptyAutomation)
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
