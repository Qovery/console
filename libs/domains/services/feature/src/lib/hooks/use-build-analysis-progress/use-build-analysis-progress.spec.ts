import { type QueryClient } from '@tanstack/react-query'
import { act, renderHook } from '@testing-library/react'
import { useReactQueryWsSubscription } from '@qovery/state/util-queries'
import {
  type BuildAnalysisEvent,
  type UseBuildAnalysisProgressProps,
  useBuildAnalysisProgress,
} from './use-build-analysis-progress'

jest.mock('@qovery/state/util-queries', () => ({
  queries: { services: { buildAnalysis: { _def: ['services', 'buildAnalysis'] } } },
  useReactQueryWsSubscription: jest.fn(),
}))

const props: UseBuildAnalysisProgressProps = {
  organizationId: 'organization-1',
  clusterId: 'cluster-1',
  projectId: 'project-1',
  environmentId: 'environment-1',
  serviceId: 'service-1',
  serviceType: 'APPLICATION',
}

const event: BuildAnalysisEvent = { status: 'ANALYSING', step: 'Reading the Dockerfile', terminal: false }

function receive(event: BuildAnalysisEvent) {
  const { onMessage } = jest.mocked(useReactQueryWsSubscription).mock.lastCall?.[0] ?? {}
  act(() => onMessage?.({ invalidateQueries: jest.fn() } as unknown as QueryClient, event))
}

describe('useBuildAnalysisProgress', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns the last event of the analysis', () => {
    const { result } = renderHook(() => useBuildAnalysisProgress(props))

    receive(event)

    expect(result.current).toEqual(event)
  })

  it('clears progress and refreshes analysis when the socket closes before completion', () => {
    const { result } = renderHook(() => useBuildAnalysisProgress(props))
    receive(event)
    const invalidateQueries = jest.fn()
    const { onClose } = jest.mocked(useReactQueryWsSubscription).mock.lastCall?.[0] ?? {}

    act(() => onClose?.({ invalidateQueries } as unknown as QueryClient, new CloseEvent('close')))

    expect(result.current).toBeUndefined()
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['services', 'buildAnalysis', props.serviceId, props.serviceType],
    })
  })

  it("doesn't show the progress of the previous service", () => {
    const { result, rerender } = renderHook((serviceId: string) => useBuildAnalysisProgress({ ...props, serviceId }), {
      initialProps: 'service-1',
    })
    receive(event)

    rerender('service-2')

    expect(result.current).toBeUndefined()
  })

  it("doesn't show the progress of the previous run", () => {
    const { result, rerender } = renderHook((enabled: boolean) => useBuildAnalysisProgress({ ...props, enabled }), {
      initialProps: true,
    })
    receive(event)

    rerender(false)
    rerender(true)

    expect(result.current).toBeUndefined()
  })
})
