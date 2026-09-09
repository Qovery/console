import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { AgentTaskRuns } from './agent-task-runs'

describe('AgentTaskRuns', () => {
  it('filters demo runs and opens the selected execution details', async () => {
    const { userEvent } = renderWithProviders(<AgentTaskRuns />)
    await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Status' }), 'FAILED')
    expect(screen.getAllByRole('row')).toHaveLength(2)
    await userEvent.click(screen.getByRole('button', { name: /Open run/ }))
    expect(screen.getByRole('region', { name: 'Run details' })).toBeInTheDocument()
    expect(
      screen.getByText(/The configured monitoring integration could not be reached/, { selector: 'p' })
    ).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(screen.queryByRole('region', { name: 'Run details' })).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Clear filters' }))
    expect(screen.getAllByRole('row')).toHaveLength(6)
  })

  it('handles a filter combination with no matching runs', async () => {
    const { userEvent } = renderWithProviders(<AgentTaskRuns />)
    await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Agent Task' }), 'demo-incident-agent')
    await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Status' }), 'FAILED')
    expect(screen.getByText('No matching runs')).toBeInTheDocument()
  })
})
