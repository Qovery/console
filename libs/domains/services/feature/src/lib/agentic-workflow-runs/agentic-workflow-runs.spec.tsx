import { waitFor, within } from '@testing-library/react'
import { type AgenticWorkflowRun } from 'qovery-typescript-axios'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { AgenticWorkflowRuns } from './agentic-workflow-runs'

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

  it('shows the API run fields without deployment status or duration', () => {
    renderWithProviders(<AgenticWorkflowRuns serviceId="workflow-123" />)

    expect(screen.getByText('Webhook')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'See the full prompt' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Copy run ID' })).toBeInTheDocument()
    expect(screen.getByText('run-123')).toBeInTheDocument()
    expect(screen.queryByRole('columnheader', { name: 'Status' })).not.toBeInTheDocument()
    expect(screen.queryByRole('columnheader', { name: 'Duration' })).not.toBeInTheDocument()
    expect(screen.queryByRole('columnheader', { name: 'Recorded' })).not.toBeInTheDocument()
    expect(mockUseRunHistory).toHaveBeenCalledWith({ serviceId: 'workflow-123', limit: undefined })
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

    renderWithProviders(<AgenticWorkflowRuns serviceId="workflow-123" compact />)

    expect(screen.getByText('No runs yet')).toBeInTheDocument()
    expect(mockUseRunHistory).toHaveBeenCalledWith({ serviceId: 'workflow-123', limit: 5 })
  })

  it('allows retrying after an API error', async () => {
    const refetch = jest.fn()
    mockUseRunHistory.mockReturnValue({ isLoading: false, isError: true, refetch })
    const { userEvent } = renderWithProviders(<AgenticWorkflowRuns serviceId="workflow-123" />)

    await userEvent.click(screen.getByRole('button', { name: 'Retry' }))

    expect(refetch).toHaveBeenCalledTimes(1)
  })
})
