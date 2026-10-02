import { waitFor, within } from '@testing-library/react'
import { type AgenticWorkflowRun } from 'qovery-typescript-axios'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { AgenticWorkflowLastRun, AgenticWorkflowRuns } from './agentic-workflow-runs'

const mockUseRunHistory = jest.fn()
const mockCopyToClipboard = jest.fn()
const mockMonacoEditor = jest.fn()

jest.mock('@monaco-editor/react', () => ({
  Editor: (props: { value?: string }) => {
    mockMonacoEditor(props)
    return <pre data-testid="monaco-editor">{props.value}</pre>
  },
}))

jest.mock('../hooks/use-agentic-workflow-run-history/use-agentic-workflow-run-history', () => ({
  useAgenticWorkflowRunHistory: (args: unknown) => mockUseRunHistory(args),
}))
jest.mock('@qovery/shared/util-hooks', () => ({
  ...jest.requireActual('@qovery/shared/util-hooks'),
  useCopyToClipboard: () => [jest.fn(), mockCopyToClipboard],
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

  it('shows run status, duration, and full dates on hover', async () => {
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
    const { userEvent } = renderWithProviders(<AgenticWorkflowRuns serviceId="workflow-123" />)

    expect(screen.getByText('Webhook')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'See the full prompt' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Copy run ID' })).toBeInTheDocument()
    expect(screen.getByText('run-123')).toBeInTheDocument()
    expect(screen.getByText('23 Sep, 12:01')).toBeInTheDocument()
    expect(screen.getByText('12:02')).toBeInTheDocument()
    expect(screen.getByText('23 Sep, 12:01').parentElement?.querySelector('i')).toHaveClass('fa-arrow-right')
    await userEvent.hover(screen.getByText('23 Sep, 12:01'))
    const tooltip = within(await screen.findByRole('tooltip'))
    expect(tooltip.getByText('Started (UTC): 23 Sep 2026, 12:01')).toBeInTheDocument()
    expect(tooltip.getByText('Finished (UTC): 23 Sep 2026, 12:02')).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Status' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Duration' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Payload' })).toBeInTheDocument()
    expect(screen.getAllByRole('columnheader').map((header) => header.textContent)).toEqual([
      'Date',
      'Status',
      'Trigger',
      'Payload',
      'Duration',
      'Prompt',
    ])
    expect(screen.getByText('Completed')).toBeInTheDocument()
    expect(screen.getByText('Completed').closest('[data-accent-color]')).not.toBeInTheDocument()
    expect(screen.getByText('Completed').closest('td')?.firstElementChild).toHaveClass('justify-between')
    expect(screen.getByText('Completed').closest('td')?.querySelector('svg')).toBeInTheDocument()
    expect(screen.getByText('00:01:05').querySelector('i')).toHaveClass('fa-clock-eight')
    expect(screen.getByText('Webhook').querySelector('i')).toHaveClass('fa-webhook')
    expect(screen.queryByRole('columnheader', { name: 'Recorded' })).not.toBeInTheDocument()
    expect(mockUseRunHistory).toHaveBeenCalledWith({ serviceId: 'workflow-123' })
  })

  it('keeps the finish date when a run crosses a UTC day boundary', () => {
    mockUseRunHistory.mockReturnValue({
      data: [{ ...run, started_at: '2026-09-23T23:59:00Z', finished_at: '2026-09-24T00:01:00Z' }],
      isLoading: false,
      isError: false,
    })

    renderWithProviders(<AgenticWorkflowRuns serviceId="workflow-123" />)

    expect(screen.getByText('23 Sep, 23:59')).toBeInTheDocument()
    expect(screen.getByText('24 Sep, 00:01')).toBeInTheDocument()
  })

  it.each([
    ['QUEUED', 'Queued'],
    ['RUNNING', 'Running'],
    ['COMPLETED', 'Completed'],
    ['FAILED', 'Failed'],
    ['CANCELLED', 'Cancelled'],
  ])('renders %s as text and a status icon', (status, label) => {
    mockUseRunHistory.mockReturnValue({
      data: [{ ...run, status }],
      isLoading: false,
      isError: false,
    })

    renderWithProviders(<AgenticWorkflowRuns serviceId="workflow-123" />)

    const statusCell = screen.getByText(label).closest('td')
    expect(statusCell?.querySelector('[data-accent-color]')).not.toBeInTheDocument()
    expect(statusCell?.querySelector('svg')).toBeInTheDocument()
  })

  it('shows a placeholder for an unknown run status', async () => {
    mockUseRunHistory.mockReturnValue({
      data: [{ ...run, status: 'UNKNOWN' }],
      isLoading: false,
      isError: false,
    })
    const { userEvent } = renderWithProviders(<AgenticWorkflowRuns serviceId="workflow-123" />)

    const cells = within(screen.getByRole('button', { name: /run-123/i })).getAllByRole('cell')
    expect(cells[1]).toHaveTextContent('—')
    await userEvent.click(screen.getByRole('button', { name: /run-123/i }))
    expect(within(screen.getByRole('dialog')).getByText('Status').nextElementSibling).toHaveTextContent('—')
  })

  it('shows empty lifecycle values when the API has not updated a run yet', async () => {
    mockUseRunHistory.mockReturnValue({
      data: [{ ...run, status: 'QUEUED', started_at: null, finished_at: null, duration_ms: null }],
      isLoading: false,
      isError: false,
    })
    const { userEvent } = renderWithProviders(<AgenticWorkflowRuns serviceId="workflow-123" />)

    expect(screen.getByText('Queued')).toBeInTheDocument()
    expect(screen.getByText('23 Sep, 12:00')).toBeInTheDocument()
    await userEvent.hover(screen.getByText('23 Sep, 12:00'))
    const tooltip = within(await screen.findByRole('tooltip'))
    expect(tooltip.getByText('Started (UTC): —')).toBeInTheDocument()
    expect(tooltip.getByText('Finished (UTC): —')).toBeInTheDocument()
    expect(tooltip.queryByText(/Requested \(UTC\)/)).not.toBeInTheDocument()
    const cells = within(screen.getByRole('button', { name: /run-123/i })).getAllByRole('cell')
    expect(cells[3]).toHaveTextContent('—')
    expect(cells[4]).toHaveTextContent('—')
    await userEvent.click(screen.getByRole('button', { name: /run-123/i }))

    const details = within(screen.getByRole('dialog'))
    expect(details.queryByText('Requested (UTC)')).not.toBeInTheDocument()
    expect(details.getByText('Started (UTC)').nextElementSibling).toHaveTextContent('—')
    expect(details.getByText('Finished (UTC)').nextElementSibling).toHaveTextContent('—')
    expect(details.getByText('Duration').nextElementSibling).toHaveTextContent('—')
  })

  it('rounds run durations to the nearest second', () => {
    mockUseRunHistory.mockReturnValue({
      data: [
        { ...run, duration_ms: 1500 },
        { ...run, id: 'run-456', duration_ms: 59999 },
      ],
      isLoading: false,
      isError: false,
    })

    renderWithProviders(<AgenticWorkflowRuns serviceId="workflow-123" />)

    expect(screen.getByText('00:00:02')).toBeInTheDocument()
    expect(screen.getByText('00:01:00')).toBeInTheDocument()
  })

  it('opens the run details in a sheet and closes it', async () => {
    const { userEvent } = renderWithProviders(<AgenticWorkflowRuns serviceId="workflow-123" />)

    await userEvent.click(screen.getByRole('button', { name: /run-123/i }))

    expect(screen.getByRole('dialog', { name: 'Run run-123' })).toBeInTheDocument()
    expect(screen.queryByText('Agent Task ID')).not.toBeInTheDocument()
    expect(screen.queryByText('Recorded in history (UTC)')).not.toBeInTheDocument()
    expect(within(screen.getByRole('dialog')).getByText('Check the latest deployment')).toBeInTheDocument()
    expect(screen.queryByText('No prompt recorded.')).not.toBeInTheDocument()
    expect(within(screen.getByRole('dialog')).getByText('No payload recorded.')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Close run details' }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('shows a valid JSON payload in a read-only JSON editor and keeps the table preview condensed', async () => {
    const payload = '{"message":"deploy completed","tags":["a","b"],"meta":{"attempt":1}}'
    mockUseRunHistory.mockReturnValue({
      data: [{ ...run, payload }],
      isLoading: false,
      isError: false,
    })
    const { userEvent } = renderWithProviders(<AgenticWorkflowRuns serviceId="workflow-123" />)

    expect(screen.getByRole('button', { name: 'See the full payload' })).toHaveTextContent(`${payload.slice(0, 30)}…`, {
      normalizeWhitespace: false,
    })
    await userEvent.click(screen.getByRole('button', { name: 'See the full payload' }))

    const editor = within(screen.getByRole('dialog')).getByTestId('monaco-editor')
    expect(editor).toHaveTextContent(JSON.stringify(JSON.parse(payload), null, 2), { normalizeWhitespace: false })
    expect(mockMonacoEditor).toHaveBeenCalledWith(
      expect.objectContaining({
        language: 'json',
        options: expect.objectContaining({ readOnly: true, wordWrap: 'on', wrappingIndent: 'indent' }),
      })
    )
  })

  it.each([
    ['large integers', '{"id":12345678901234567890}'],
    ['exponents', '{"big":1e400}'],
    ['number spellings', '{"price":1.10,"neg":-0.0}'],
    ['duplicate keys', '{"a":1,"a":2}'],
    ['unicode escapes', '{"a":"\\u00e9"}'],
  ])('shows JSON as received when re-serializing would alter it: %s', async (_name, payload) => {
    mockUseRunHistory.mockReturnValue({
      data: [{ ...run, payload }],
      isLoading: false,
      isError: false,
    })
    const { userEvent } = renderWithProviders(<AgenticWorkflowRuns serviceId="workflow-123" />)

    await userEvent.click(screen.getByRole('button', { name: 'See the full payload' }))

    const payloadElement = within(screen.getByRole('dialog')).getByText(payload)
    expect(payloadElement).toHaveTextContent(payload, { normalizeWhitespace: false })
    expect(screen.queryByTestId('monaco-editor')).not.toBeInTheDocument()
  })

  it('formats JSON with structural characters inside strings and empty containers', async () => {
    const payload = '{ "a" : "x\\"{,}[:]", "e": {}, "l": [ ] }'
    mockUseRunHistory.mockReturnValue({
      data: [{ ...run, payload }],
      isLoading: false,
      isError: false,
    })
    const { userEvent } = renderWithProviders(<AgenticWorkflowRuns serviceId="workflow-123" />)

    await userEvent.click(screen.getByRole('button', { name: 'See the full payload' }))

    expect(within(screen.getByRole('dialog')).getByTestId('monaco-editor')).toHaveTextContent(
      '{\n  "a": "x\\"{,}[:]",\n  "e": {},\n  "l": []\n}',
      { normalizeWhitespace: false }
    )
  })

  it('shows an invalid JSON payload unchanged in the run details', async () => {
    const payload = '{"message": "deploy completed",}'
    mockUseRunHistory.mockReturnValue({
      data: [{ ...run, payload }],
      isLoading: false,
      isError: false,
    })
    const { userEvent } = renderWithProviders(<AgenticWorkflowRuns serviceId="workflow-123" />)

    await userEvent.click(screen.getByRole('button', { name: 'See the full payload' }))

    const payloadElement = within(screen.getByRole('dialog')).getByText(/deploy completed/)
    expect(payloadElement).toHaveTextContent(payload, { normalizeWhitespace: false })
    expect(payloadElement).toHaveClass('whitespace-pre-wrap', 'break-words')
    expect(screen.queryByTestId('monaco-editor')).not.toBeInTheDocument()
  })

  it('shows a manual run with an empty payload', async () => {
    mockUseRunHistory.mockReturnValue({
      data: [{ ...run, trigger: 'MANUAL', payload: '' }],
      isLoading: false,
      isError: false,
    })
    const { userEvent } = renderWithProviders(<AgenticWorkflowRuns serviceId="workflow-123" />)

    expect(screen.getByText('Manual')).toBeInTheDocument()
    expect(screen.getByText('Manual').querySelector('i')).toHaveClass('fa-play')
    await userEvent.click(screen.getByRole('button', { name: /run-123/i }))

    expect(within(screen.getByRole('dialog')).getByText('Empty payload.')).toBeInTheDocument()
  })

  it('shows a schedule icon before a scheduled run', () => {
    mockUseRunHistory.mockReturnValue({
      data: [{ ...run, trigger: 'SCHEDULE' }],
      isLoading: false,
      isError: false,
    })

    renderWithProviders(<AgenticWorkflowRuns serviceId="workflow-123" />)

    expect(screen.getByText('Schedule').querySelector('i')).toHaveClass('fa-calendar-day')
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

  it('copies the run ID from the keyboard', async () => {
    const { userEvent } = renderWithProviders(<AgenticWorkflowRuns serviceId="workflow-123" />)

    await userEvent.tab()
    await userEvent.tab()
    expect(screen.getByRole('button', { name: 'Copy run ID' })).toHaveFocus()

    await userEvent.keyboard('{Enter}')
    expect(mockCopyToClipboard).toHaveBeenCalledWith(run.id)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('shows an empty state when no runs exist', () => {
    mockUseRunHistory.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    })

    renderWithProviders(<AgenticWorkflowLastRun serviceId="workflow-123" />)

    expect(screen.getByText('No runs yet')).toBeInTheDocument()
    expect(mockUseRunHistory).toHaveBeenCalledWith({ serviceId: 'workflow-123', pageSize: 1 })
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
    expect(screen.queryByText(run.prompt)).not.toBeInTheDocument()
    expect(mockUseRunHistory).toHaveBeenCalledWith({ serviceId: 'workflow-123', pageSize: 1 })
    const overviewRun = screen.getByRole('button', { name: /Webhook run/i })
    expect(overviewRun).toHaveTextContent('Webhook run')
    await userEvent.click(overviewRun)

    expect(screen.getByRole('dialog', { name: 'Run run-123' })).toBeInTheDocument()
    expect(within(screen.getByRole('dialog')).getByText(run.prompt)).toBeInTheDocument()
  })

  it('allows retrying after an API error', async () => {
    const refetch = jest.fn()
    mockUseRunHistory.mockReturnValue({ isLoading: false, isError: true, refetch })
    const { userEvent } = renderWithProviders(<AgenticWorkflowRuns serviceId="workflow-123" />)

    await userEvent.click(screen.getByRole('button', { name: 'Retry' }))

    expect(refetch).toHaveBeenCalledTimes(1)
  })
})
