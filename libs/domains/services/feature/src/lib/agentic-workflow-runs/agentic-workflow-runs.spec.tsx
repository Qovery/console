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
      data: { page: 1, page_size: 20, results: [run] },
      isLoading: false,
      isError: false,
      isFetching: false,
      refetch: jest.fn(),
    })
  })

  it('shows the API run fields without deployment status or duration', () => {
    renderWithProviders(<AgenticWorkflowRuns serviceId="workflow-123" />)

    expect(screen.getByText('Webhook')).toBeInTheDocument()
    expect(screen.getByText('Check the latest deployment')).toBeInTheDocument()
    expect(screen.getByText('run-123')).toBeInTheDocument()
    expect(screen.queryByRole('columnheader', { name: 'Status' })).not.toBeInTheDocument()
    expect(screen.queryByRole('columnheader', { name: 'Duration' })).not.toBeInTheDocument()
    expect(mockUseRunHistory).toHaveBeenCalledWith({ serviceId: 'workflow-123', page: 1, pageSize: 20 })
  })

  it('requests the next page and disables Next when fewer than 20 runs are returned', async () => {
    mockUseRunHistory.mockImplementation(({ page }: { page: number }) => ({
      data: {
        page,
        page_size: 20,
        results: page === 1 ? Array.from({ length: 20 }, (_, index) => ({ ...run, id: `run-${index}` })) : [run],
      },
      isLoading: false,
      isError: false,
      isFetching: false,
      refetch: jest.fn(),
    }))
    const { userEvent } = renderWithProviders(<AgenticWorkflowRuns serviceId="workflow-123" />)

    await userEvent.click(screen.getByRole('button', { name: /Next/i }))

    expect(mockUseRunHistory).toHaveBeenLastCalledWith({ serviceId: 'workflow-123', page: 2, pageSize: 20 })
    expect(screen.getByRole('button', { name: /Next/i })).toBeDisabled()
    expect(screen.getByText('Page 2')).toBeInTheDocument()
  })

  it('shows an empty state when no runs exist', () => {
    mockUseRunHistory.mockReturnValue({
      data: { page: 1, page_size: 20, results: [] },
      isLoading: false,
      isError: false,
    })

    renderWithProviders(<AgenticWorkflowRuns serviceId="workflow-123" compact />)

    expect(screen.getByText('No runs yet')).toBeInTheDocument()
    expect(mockUseRunHistory).toHaveBeenCalledWith({ serviceId: 'workflow-123', page: 1, pageSize: 5 })
  })

  it('allows retrying after an API error', async () => {
    const refetch = jest.fn()
    mockUseRunHistory.mockReturnValue({ isLoading: false, isError: true, refetch })
    const { userEvent } = renderWithProviders(<AgenticWorkflowRuns serviceId="workflow-123" />)

    await userEvent.click(screen.getByRole('button', { name: 'Retry' }))

    expect(refetch).toHaveBeenCalledTimes(1)
  })
})
