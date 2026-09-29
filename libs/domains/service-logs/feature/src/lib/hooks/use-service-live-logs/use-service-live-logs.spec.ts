import { act, renderHook } from '@testing-library/react'
import { useReactQueryWsSubscription } from '@qovery/state/util-queries'
import { useServiceLiveLogs } from './use-service-live-logs'

let mockSearchParams: { search?: string; nginx?: boolean; envoy?: boolean } = {}

jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useParams: () => ({
    organizationId: 'organization-1',
    projectId: 'project-1',
    environmentId: 'environment-1',
  }),
  useSearch: () => mockSearchParams,
}))

jest.mock('@qovery/state/util-queries', () => ({
  useReactQueryWsSubscription: jest.fn(),
}))

describe('useServiceLiveLogs', () => {
  beforeEach(() => {
    mockSearchParams = {}
    jest.clearAllMocks()
  })

  it('passes the service type to the live logs websocket params', () => {
    renderHook(() =>
      useServiceLiveLogs({
        clusterId: 'cluster-1',
        serviceId: 'service-1',
        serviceType: 'ARGOCD_APP',
        enabled: true,
      })
    )

    expect(useReactQueryWsSubscription).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        urlSearchParams: expect.objectContaining({
          service_type: 'ARGOCD_APP',
        }),
      })
    )
  })

  it('clears previously received logs when the search changes', () => {
    jest.useFakeTimers()

    try {
      const { result, rerender } = renderHook(() =>
        useServiceLiveLogs({ clusterId: 'cluster-1', serviceId: 'service-1', enabled: true })
      )

      const initialSubscription = jest.mocked(useReactQueryWsSubscription).mock.calls[0][0]
      act(() => {
        initialSubscription.onMessage?.({} as never, { created_at: 1, message: 'other log' })
      })
      act(() => {
        jest.advanceTimersByTime(400)
      })
      expect(result.current.data.map((log) => log.message)).toEqual(['other log'])

      act(() => {
        initialSubscription.onMessage?.({} as never, { created_at: 2, message: 'pending old log' })
      })

      jest.mocked(useReactQueryWsSubscription).mockClear()
      mockSearchParams = { search: '33' }
      rerender()
      expect(result.current.data).toEqual([])

      const filteredSubscription = jest.mocked(useReactQueryWsSubscription).mock.calls[0][0]
      expect(filteredSubscription?.urlSearchParams).toEqual(
        expect.objectContaining({ query: expect.stringContaining('33') })
      )

      act(() => {
        jest.advanceTimersByTime(400)
      })
      expect(result.current.data).toEqual([])

      act(() => {
        filteredSubscription?.onMessage?.({} as never, { created_at: 3, message: 'log 33' })
      })
      act(() => {
        jest.advanceTimersByTime(400)
      })
      expect(result.current.data.map((log) => log.message)).toEqual(['log 33'])
    } finally {
      jest.useRealTimers()
    }
  })

  it.each(['nginx', 'envoy'] as const)('clears displayed logs when %s is toggled', (source) => {
    jest.useFakeTimers()

    try {
      mockSearchParams = { [source]: true }
      const { result, rerender } = renderHook(() =>
        useServiceLiveLogs({ clusterId: 'cluster-1', serviceId: 'service-1', enabled: true })
      )

      const sourceIndex = source === 'nginx' ? 1 : 2
      const sourceSubscription = jest.mocked(useReactQueryWsSubscription).mock.calls[sourceIndex][0]
      act(() => {
        sourceSubscription.onMessage?.({} as never, { created_at: 1, message: `${source} log` })
        jest.advanceTimersByTime(400)
      })
      expect(result.current.data).toHaveLength(1)

      mockSearchParams = {}
      rerender()
      expect(result.current.data).toEqual([])

      const regularSubscription = jest.mocked(useReactQueryWsSubscription).mock.calls.at(-3)?.[0]
      act(() => {
        regularSubscription?.onMessage?.({} as never, { created_at: 2, message: 'regular log' })
        jest.advanceTimersByTime(400)
      })
      expect(result.current.data).toHaveLength(1)

      mockSearchParams = { [source]: true }
      rerender()
      expect(result.current.data).toEqual([])
    } finally {
      jest.useRealTimers()
    }
  })
})
