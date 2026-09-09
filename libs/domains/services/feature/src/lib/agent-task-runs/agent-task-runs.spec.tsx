import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { AgentTaskRuns } from './agent-task-runs'

describe('AgentTaskRuns', () => {
  it('opens and closes execution details without filters', async () => {
    const { userEvent } = renderWithProviders(<AgentTaskRuns />)
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
    expect(screen.getAllByRole('row')).toHaveLength(6)
    await userEvent.click(screen.getByRole('button', { name: 'Open run a83f1203-a121-4000-8000-000000000003' }))
    expect(screen.getByRole('dialog', { name: 'Run a83f1203' })).toBeInTheDocument()
    expect(
      screen.getByText(/The configured monitoring integration could not be reached/, { selector: 'p' })
    ).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('shows an empty state for an agent without runs', () => {
    renderWithProviders(<AgentTaskRuns agentTaskId="unknown-agent" />)
    expect(screen.getByText('No runs yet')).toBeInTheDocument()
  })
})
