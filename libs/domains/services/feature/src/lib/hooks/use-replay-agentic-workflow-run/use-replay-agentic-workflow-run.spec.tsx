import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { type PropsWithChildren } from 'react'
import { act, renderHook, waitFor } from '@qovery/shared/util-tests'
import { queries } from '@qovery/state/util-queries'
import { useReplayAgenticWorkflowRun } from './use-replay-agentic-workflow-run'

const mockToast = jest.fn()
const mockFetch = jest.fn()

jest.mock('@qovery/shared/ui', () => ({
  ...jest.requireActual('@qovery/shared/ui'),
  toast: (...args: unknown[]) => mockToast(...args),
}))

const webhookUrl = 'https://webhook.example.com/agentic/abc'

describe('useReplayAgenticWorkflowRun', () => {
  let queryClient: QueryClient
  let invalidateQueries: jest.SpyInstance
  const wrapper = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )

  beforeEach(() => {
    jest.clearAllMocks()
    queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
    invalidateQueries = jest.spyOn(queryClient, 'invalidateQueries')
    global.fetch = mockFetch
    mockFetch.mockResolvedValue({ ok: true, status: 202 })
  })

  afterEach(() => {
    queryClient.clear()
  })

  it('posts the original payload unchanged to the webhook URL from the browser', async () => {
    const payload = '{ "id":  12345678901234567890,\n  "a":"\\u00e9" }'
    const { result } = renderHook(() => useReplayAgenticWorkflowRun({ serviceId: 'service-1' }), { wrapper })

    await act(async () => {
      await result.current.mutateAsync({ webhookUrl, payload })
    })

    expect(mockFetch).toHaveBeenCalledTimes(1)
    const [url, init] = mockFetch.mock.calls[0]
    expect(url).toBe(webhookUrl)
    expect(init).toEqual(
      expect.objectContaining({
        method: 'POST',
        body: payload,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'omit',
      })
    )
  })

  it('sends a non-JSON payload as plain text', async () => {
    const { result } = renderHook(() => useReplayAgenticWorkflowRun({ serviceId: 'service-1' }), { wrapper })

    await act(async () => {
      await result.current.mutateAsync({ webhookUrl, payload: 'not json' })
    })

    expect(mockFetch.mock.calls[0][1]).toEqual(
      expect.objectContaining({ body: 'not json', headers: { 'Content-Type': 'text/plain' } })
    )
  })

  it('refreshes the run history of the service and shows a success toast', async () => {
    const { result } = renderHook(() => useReplayAgenticWorkflowRun({ serviceId: 'service-1' }), { wrapper })

    await act(async () => {
      await result.current.mutateAsync({ webhookUrl, payload: '{}' })
    })

    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: [...queries.services.agenticWorkflowRunHistory._def, 'service-1'],
    })
    expect(mockToast).toHaveBeenCalledWith('success', 'Run replayed', expect.any(String))
  })

  it('shows the HTTP status and does not refresh the history when the webhook rejects the request', async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 403 })
    const { result } = renderHook(() => useReplayAgenticWorkflowRun({ serviceId: 'service-1' }), { wrapper })

    await act(async () => {
      await result.current.mutateAsync({ webhookUrl, payload: '{}' }).catch(() => undefined)
    })

    await waitFor(() =>
      expect(mockToast).toHaveBeenCalledWith('error', 'Replay failed', 'The webhook responded with status 403.')
    )
    expect(invalidateQueries).not.toHaveBeenCalled()
    expect(mockToast).not.toHaveBeenCalledWith('success', expect.anything(), expect.anything())
  })

  it('explains a network or CORS failure', async () => {
    mockFetch.mockRejectedValue(new TypeError('Failed to fetch'))
    const { result } = renderHook(() => useReplayAgenticWorkflowRun({ serviceId: 'service-1' }), { wrapper })

    await act(async () => {
      await result.current.mutateAsync({ webhookUrl, payload: '{}' }).catch(() => undefined)
    })

    await waitFor(() =>
      expect(mockToast).toHaveBeenCalledWith('error', 'Replay failed', expect.stringContaining('CORS'))
    )
    expect(invalidateQueries).not.toHaveBeenCalled()
  })
})
