import { waitFor, within } from '@testing-library/react'
import { type AgenticWorkflowRun } from 'qovery-typescript-axios'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { AgenticWorkflowLastRun, AgenticWorkflowRuns } from './agentic-workflow-runs'

const mockUseRunHistory = jest.fn()

jest.mock('../hooks/use-agentic-workflow-run-history/use-agentic-workflow-run-history', () => ({
  useAgenticWorkflowRunHistory: (args: unknown) => mockUseRunHistory(args),
}))

const run: AgenticWorkflowRun = {
  id: 'run-123',
  source_workflow_id: 'workflow-123',
  trigger: 'WEBHOOK',
  prompt: 'Check the latest deployment',
  created_at: '2026-09-23T12:00:00Z',
  recorded_at: null,
}

describe('AgenticWorkflowRuns', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseRunHistory.mockReturnValue({
      data: [run],
      isLoading: false,
      isError: false,
      isFetching: false,
      refetch: jest.fn(),
    })
  })

  it('shows run status and duration from the API without deployment metadata', () => {
    mockUseRunHistory.mockReturnValue({
      data: [
        {
          ...run,
          status: 'COMPLETED',
          started_at: '2026-09-23T12:01:00Z',
          finished_at: '2026-09-23T12:02:05Z',
          duration_ms: 65000,
        },
      ],
      isLoading: false,
      isError: false,
    })
    renderWithProviders(<AgenticWorkflowRuns serviceId="workflow-123" />)

    expect(screen.getByText('Webhook')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'See the full prompt' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Copy run ID' })).toBeInTheDocument()
    expect(screen.getByText('run-123')).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Status' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Duration' })).toBeInTheDocument()
    expect(screen.getByText('Completed')).toBeInTheDocument()
    expect(screen.getByText('1m 5s')).toBeInTheDocument()
    expect(screen.queryByRole('columnheader', { name: 'Recorded' })).not.toBeInTheDocument()
    expect(mockUseRunHistory).toHaveBeenCalledWith({ serviceId: 'workflow-123', limit: undefined })
  })

  it('shows empty lifecycle values when the API has not updated a run yet', async () => {
    mockUseRunHistory.mockReturnValue({
      data: [{ ...run, status: 'QUEUED', started_at: null, finished_at: null, duration_ms: null }],
      isLoading: false,
      isError: false,
    })
    const { userEvent } = renderWithProviders(<AgenticWorkflowRuns serviceId="workflow-123" />)

    expect(screen.getByText('Queued')).toBeInTheDocument()
    expect(within(screen.getByRole('button', { name: /run-123/i })).getByText('—')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /run-123/i }))

    const details = within(screen.getByRole('dialog'))
    expect(details.getByText('Started (UTC)').nextElementSibling).toHaveTextContent('—')
    expect(details.getByText('Finished (UTC)').nextElementSibling).toHaveTextContent('—')
    expect(details.getByText('Duration').nextElementSibling).toHaveTextContent('—')
  })

  it('opens the run details in a sheet and closes it', async () => {
    const { userEvent } = renderWithProviders(<AgenticWorkflowRuns serviceId="workflow-123" />)

    await userEvent.click(screen.getByRole('button', { name: /run-123/i }))

    expect(screen.getByRole('dialog', { name: 'Run run-123' })).toBeInTheDocument()
    expect(screen.queryByText('Agent Task ID')).not.toBeInTheDocument()
    expect(screen.queryByText('Recorded in history (UTC)')).not.toBeInTheDocument()
    expect(within(screen.getByRole('dialog')).getByText('Check the latest deployment')).toBeInTheDocument()
    expect(screen.queryByText('No prompt recorded.')).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Close run details' }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('opens the full prompt from the row button without pagination', async () => {
    const fullPrompt = '123456789012345678901234567890 more details'
    mockUseRunHistory.mockReturnValue({
      data: [{ ...run, prompt: fullPrompt }],
      isLoading: false,
      isError: false,
    })
    const { userEvent } = renderWithProviders(<AgenticWorkflowRuns serviceId="workflow-123" />)

    const promptButton = screen.getByRole('button', { name: 'See the full prompt' })
    expect(promptButton).toHaveTextContent('123456789012345678901234567890…')
    expect(screen.queryByText(fullPrompt)).not.toBeInTheDocument()

    await userEvent.click(promptButton)

    expect(screen.getByRole('dialog', { name: 'Run run-123' })).toBeInTheDocument()
    expect(screen.getByText(fullPrompt)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Next' })).not.toBeInTheDocument()
  })

  it('treats whitespace-only prompts as missing in the table and sheet', async () => {
    mockUseRunHistory.mockReturnValue({
      data: [{ ...run, prompt: '  \n  ' }],
      isLoading: false,
      isError: false,
    })
    const { userEvent } = renderWithProviders(<AgenticWorkflowRuns serviceId="workflow-123" />)

    expect(screen.queryByRole('button', { name: 'See the full prompt' })).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /run-123/i }))

    expect(within(screen.getByRole('dialog')).getByText('No prompt recorded.')).toBeInTheDocument()
  })

  it('closes the copy tooltip when the run sheet opens', async () => {
    const { userEvent } = renderWithProviders(<AgenticWorkflowRuns serviceId="workflow-123" />)

    await userEvent.hover(screen.getByRole('button', { name: 'Copy run ID' }))
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Copy run ID')

    await userEvent.click(screen.getByRole('button', { name: /run-123/i }))
    await waitFor(() => expect(screen.queryByRole('tooltip')).not.toBeInTheDocument())
  })

  it('shows an empty state when no runs exist', () => {
    mockUseRunHistory.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    })

    renderWithProviders(<AgenticWorkflowLastRun serviceId="workflow-123" />)

    expect(screen.getByText('No runs yet')).toBeInTheDocument()
    expect(mockUseRunHistory).toHaveBeenCalledWith({ serviceId: 'workflow-123', limit: 1 })
  })

  it('shows only the latest run in the overview card and opens its details', async () => {
    mockUseRunHistory.mockReturnValue({
      data: [run, { ...run, id: 'run-older', prompt: 'Older prompt' }],
      isLoading: false,
      isError: false,
    })
    const { userEvent } = renderWithProviders(<AgenticWorkflowLastRun serviceId="workflow-123" />)

    expect(screen.queryByRole('table')).not.toBeInTheDocument()
    expect(screen.queryByText('Older prompt')).not.toBeInTheDocument()
    expect(mockUseRunHistory).toHaveBeenCalledWith({ serviceId: 'workflow-123', limit: 1 })
    await userEvent.click(screen.getByRole('button', { name: /Webhook run/i }))

    expect(screen.getByRole('dialog', { name: 'Run run-123' })).toBeInTheDocument()
  })

  it('allows retrying after an API error', async () => {
    const refetch = jest.fn()
    mockUseRunHistory.mockReturnValue({ isLoading: false, isError: true, refetch })
    const { userEvent } = renderWithProviders(<AgenticWorkflowRuns serviceId="workflow-123" />)

    await userEvent.click(screen.getByRole('button', { name: 'Retry' }))

    expect(refetch).toHaveBeenCalledTimes(1)
  })
})
