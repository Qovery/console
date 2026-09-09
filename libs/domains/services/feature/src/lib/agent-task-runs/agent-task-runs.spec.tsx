import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { AgentTaskRuns } from './agent-task-runs'

describe('AgentTaskRuns', () => {
  it('opens and closes execution details without filters', async () => {
    const { userEvent } = renderWithProviders(<AgentTaskRuns />)
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
    expect(screen.getAllByRole('row')).toHaveLength(6)
    await userEvent.click(screen.getByRole('button', { name: 'Open run a83f1203-a121-4000-8000-000000000003' }))
    expect(screen.getByRole('dialog', { name: 'Run a83f1203' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'View output' })).not.toBeInTheDocument()
    expect(
      screen.getByText(/The configured monitoring integration could not be reached/, { selector: 'p' })
    ).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('shows the output and its external link for a completed run', async () => {
    const { userEvent } = renderWithProviders(<AgentTaskRuns />)
    await userEvent.click(screen.getByRole('button', { name: 'Open run a83f1202-a121-4000-8000-000000000002' }))
    expect(screen.getByRole('heading', { name: 'Output' })).toBeInTheDocument()
    expect(screen.getByText(/Deployment completed successfully/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'View output' })).toHaveAttribute(
      'href',
      'https://example.com/agent-output'
    )
    expect(screen.getByRole('link', { name: 'View output' })).toHaveAttribute('target', '_blank')
  })

  it('shows an empty state for an agent without runs', () => {
    renderWithProviders(<AgentTaskRuns agentTaskId="unknown-agent" />)
    expect(screen.getByText('No runs yet')).toBeInTheDocument()
  })
})
