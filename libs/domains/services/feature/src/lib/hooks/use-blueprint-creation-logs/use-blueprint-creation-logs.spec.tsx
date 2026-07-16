import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook } from '@testing-library/react'
import { type EnvironmentLogs } from 'qovery-typescript-axios'
import { type PropsWithChildren } from 'react'
import { useReactQueryWsSubscription } from '@qovery/state/util-queries'
import { useBlueprintCreationLogs } from './use-blueprint-creation-logs'

jest.mock('@qovery/shared/util-node-env', () => ({
  QOVERY_WS: 'wss://ws.qovery.com',
}))

jest.mock('@qovery/state/util-queries', () => ({
  ...jest.requireActual('@qovery/state/util-queries'),
  useReactQueryWsSubscription: jest.fn(),
}))

const useReactQueryWsSubscriptionMock = jest.mocked(useReactQueryWsSubscription)

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: PropsWithChildren) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

function renderUseBlueprintCreationLogs(props: Parameters<typeof useBlueprintCreationLogs>[0]) {
  const queryClient = new QueryClient()
  const result = renderHook(() => useBlueprintCreationLogs(props), {
    wrapper: createWrapper(queryClient),
  })

  return { ...result, queryClient }
}

function createLog(transmitter: { id: string; type: string }) {
  return {
    timestamp: `${transmitter.id}-${transmitter.type}`,
    details: { transmitter },
  } as EnvironmentLogs
}

describe('useBlueprintCreationLogs', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should subscribe to deployment logs only when all creation identifiers are available', () => {
    renderUseBlueprintCreationLogs({
      blueprintId: 'blueprint-1',
      clusterId: 'cluster-1',
      environmentId: 'environment-1',
      organizationId: 'organization-1',
      projectId: 'project-1',
    })

    expect(useReactQueryWsSubscriptionMock).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'wss://ws.qovery.com/deployment/logs',
        urlSearchParams: {
          organization: 'organization-1',
          cluster: 'cluster-1',
          project: 'project-1',
          environment: 'environment-1',
        },
        enabled: true,
      })
    )
  })

  it('should keep only logs emitted by the created blueprint', () => {
    const { result, queryClient } = renderUseBlueprintCreationLogs({
      blueprintId: 'blueprint-1',
      clusterId: 'cluster-1',
      environmentId: 'environment-1',
      organizationId: 'organization-1',
      projectId: 'project-1',
    })
    const subscriptionConfig = useReactQueryWsSubscriptionMock.mock.calls[0]?.[0]

    act(() => {
      subscriptionConfig?.onMessage?.(queryClient, [
        createLog({ id: 'blueprint-1', type: 'Blueprint' }),
        createLog({ id: 'blueprint-2', type: 'Blueprint' }),
        createLog({ id: 'blueprint-1', type: 'Environment' }),
      ])
    })

    expect(result.current.logs).toEqual([createLog({ id: 'blueprint-1', type: 'Blueprint' })])
  })
})
