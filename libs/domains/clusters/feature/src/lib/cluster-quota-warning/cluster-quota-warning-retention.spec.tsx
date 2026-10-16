import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act } from '@testing-library/react'
import { type Cluster } from 'qovery-typescript-axios'
import { type ClusterStatusDto } from 'qovery-ws-typescript-axios'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { useReactQueryWsSubscription } from '@qovery/state/util-queries'
import { ClusterRunningStatusIndicator } from '../cluster-running-status-indicator/cluster-running-status-indicator'
import { useClusterRunningStatusSocket } from '../hooks/use-cluster-running-status-socket/use-cluster-running-status-socket'
import { ClusterQuotaWarningCallout } from './cluster-quota-warning-callout'

jest.mock('@qovery/state/util-queries', () => ({
  ...jest.requireActual('@qovery/state/util-queries'),
  useReactQueryWsSubscription: jest.fn(),
}))

function Subscription() {
  useClusterRunningStatusSocket({ organizationId: 'org', clusterId: 'cluster' })
  return null
}

jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useParams: () => ({ organizationId: 'org', clusterId: 'cluster' }),
}))
jest.mock('../hooks/use-cluster-status/use-cluster-status', () => ({
  useClusterStatus: () => ({ data: { status: 'DEPLOYED' } }),
}))
jest.mock('posthog-js/react', () => ({ useFeatureFlagVariantKey: () => true }))

it('keeps the quota callout and badge consistent through disconnect, expiry and recovery', async () => {
  jest.useFakeTimers()
  const client = new QueryClient()
  jest.mocked(useReactQueryWsSubscription).mockClear()
  const warning = {
    computed_status: {
      global_status: 'WARNING',
      node_warnings: {},
      quota_warning: {
        status: 'ACTIVE',
        provider: 'AWS',
        quota_code: 'spot-quota',
        quota_name: 'Spot quota',
        message: 'Spot quota reached',
        suggested_action: 'Request a quota increase',
      },
    },
  } as ClusterStatusDto
  const { unmount } = renderWithProviders(
    <QueryClientProvider client={client}>
      <Subscription />
      <Subscription />
      <ClusterRunningStatusIndicator cluster={{ id: 'cluster', organization: { id: 'org' } } as Cluster} />
      <ClusterQuotaWarningCallout />
    </QueryClientProvider>
  )
  const [first, second] = jest.mocked(useReactQueryWsSubscription).mock.calls.map(([options]) => options)
  const advance = async (ms: number) => {
    await act(async () => {
      jest.advanceTimersByTime(ms)
    })
    await act(async () => {
      jest.advanceTimersByTime(1)
    })
  }
  try {
    await advance(2_998)
    expect(screen.queryByText('Status unavailable')).not.toBeInTheDocument()
    await advance(1)
    expect(screen.getByText('Status unavailable')).toBeInTheDocument()
    await act(async () => {
      first.onMessage?.(client, warning)
    })
    await advance(1)
    expect(screen.getByText('warning')).toBeInTheDocument()
    expect(screen.getByText('Spot quota reached')).toBeInTheDocument()
    await act(async () => {
      first.onDisconnect?.(client, new CloseEvent('close', { reason: 'NotFound' }))
      jest.advanceTimersByTime(60_000)
    })
    expect(screen.getByText('warning')).toBeInTheDocument()
    expect(screen.getByText('Spot quota reached')).toBeInTheDocument()
    // A second socket's close must not extend the first socket's deadline.
    await act(async () => {
      second.onDisconnect?.(client, new CloseEvent('close', { reason: 'NotFound' }))
      jest.advanceTimersByTime(30_000)
    })
    await act(async () => {
      jest.advanceTimersByTime(1)
    })
    expect(screen.getByText('Status unavailable')).toBeInTheDocument()
    expect(screen.queryByText('Spot quota reached')).not.toBeInTheDocument()
    await act(async () => {
      second.onMessage?.(client, warning)
      jest.advanceTimersByTime(1)
    })
    expect(screen.getByText('warning')).toBeInTheDocument()
    expect(screen.getByText('Spot quota reached')).toBeInTheDocument()
    await act(async () => {
      first.onDisconnect?.(client, new CloseEvent('close'))
    })
    await advance(45_000)
    await act(async () => {
      second.onMessage?.(client, warning)
    })
    await advance(90_000)
    expect(screen.getByText('warning')).toBeInTheDocument()
  } finally {
    unmount()
    client.clear()
    jest.clearAllTimers()
    jest.useRealTimers()
  }
})
