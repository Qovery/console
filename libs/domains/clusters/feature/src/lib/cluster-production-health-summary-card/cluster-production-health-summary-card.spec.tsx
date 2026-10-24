import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act } from '@testing-library/react'
import type { Cluster, ClusterStatus } from 'qovery-typescript-axios'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import useClusterRunningStatusSocket from '../hooks/use-cluster-running-status-socket/use-cluster-running-status-socket'
import { ClusterProductionHealthSummaryCard } from './cluster-production-health-summary-card'

const mockOpenModal = jest.fn()
const mockCloseModal = jest.fn()
const mockUseFeatureFlagVariantKey = jest.fn(() => true)

jest.mock('posthog-js/react', () => ({
  useFeatureFlagVariantKey: () => mockUseFeatureFlagVariantKey(),
}))

jest.mock('@qovery/shared/ui', () => ({
  ...jest.requireActual('@qovery/shared/ui'),
  useModal: () => ({
    openModal: mockOpenModal,
    closeModal: mockCloseModal,
  }),
}))

jest.mock('../hooks/use-cluster-running-status-socket/use-cluster-running-status-socket', () => ({
  __esModule: true,
  default: jest.fn(),
  useClusterRunningStatusSocket: jest.fn(),
}))

jest.mock('@qovery/state/util-queries', () => ({
  ...jest.requireActual('@qovery/state/util-queries'),
  useReactQueryWsSubscription: jest.fn(),
}))

const mockUseQueries = jest.fn<{ data: unknown }[], unknown[]>(() => [])

jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  useQueries: (args: unknown) => mockUseQueries(args),
}))

const baseCluster = {
  id: 'cluster-id',
  name: 'prod-cluster',
  organization: { id: 'org-id' },
  cloud_provider: 'AWS',
  region: 'us-east-1',
  version: '1.27',
  kubernetes: 'MANAGED',
  deployment_status: 'UP_TO_DATE',
  production: true,
} as unknown as Cluster

const deployedStatus: ClusterStatus = {
  cluster_id: 'cluster-id',
  status: 'DEPLOYED',
  is_deployed: true,
} as ClusterStatus

describe('ClusterProductionHealthSummaryCard', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    jest.clearAllMocks()
    mockUseQueries.mockReset()
    jest.mocked(useClusterRunningStatusSocket).mockReset()
    mockUseFeatureFlagVariantKey.mockReturnValue(true)
    mockUseQueries.mockReturnValue([{ data: { computed_status: { global_status: 'RUNNING' } } }])
  })

  afterEach(() => {
    // The pending skeleton timeout updates the still mounted card
    act(() => {
      jest.runOnlyPendingTimers()
    })
    jest.useRealTimers()
  })

  it('renders the healthy card when no clusters have issues', () => {
    renderWithProviders(
      <ClusterProductionHealthSummaryCard clusters={[baseCluster]} clusterStatuses={[deployedStatus]} />
    )

    expect(screen.getByText('All clusters healthy')).toBeInTheDocument()
  })

  it('renders the update-needed copy when clusters only have updates available', () => {
    const outOfDateCluster = {
      ...baseCluster,
      deployment_status: 'OUT_OF_DATE',
    } as Cluster

    renderWithProviders(
      <ClusterProductionHealthSummaryCard clusters={[outOfDateCluster]} clusterStatuses={[deployedStatus]} />
    )

    expect(screen.getByText('Update needed on 1 cluster')).toBeInTheDocument()
  })

  it('renders the issues card and opens the modal when clusters have issues', async () => {
    const failingStatus = { ...deployedStatus, status: 'DEPLOYMENT_ERROR' } as ClusterStatus

    const { userEvent } = renderWithProviders(
      <ClusterProductionHealthSummaryCard clusters={[baseCluster]} clusterStatuses={[failingStatus]} />
    )

    const trigger = screen.getByRole('button', { name: /1 cluster with ongoing issue/i })
    expect(trigger).toBeInTheDocument()

    await userEvent.click(trigger)

    expect(mockOpenModal).toHaveBeenCalledWith(
      expect.objectContaining({
        options: expect.objectContaining({ width: 676 }),
      })
    )
  })

  it('does not show running-status issues when the feature flag is disabled', () => {
    mockUseFeatureFlagVariantKey.mockReturnValue(false)
    mockUseQueries.mockReturnValue([{ data: { computed_status: { global_status: 'ERROR' } } }])

    renderWithProviders(
      <ClusterProductionHealthSummaryCard clusters={[baseCluster]} clusterStatuses={[deployedStatus]} />
    )

    expect(screen.getByText('All clusters healthy')).toBeInTheDocument()
    expect(screen.queryByText(/cluster with ongoing issue/i)).not.toBeInTheDocument()
  })

  it('does not wait for live health on a stopped cluster', () => {
    mockUseQueries.mockReturnValue([{ data: undefined }])
    renderWithProviders(
      <ClusterProductionHealthSummaryCard
        clusters={[baseCluster]}
        clusterStatuses={[{ ...deployedStatus, status: 'STOPPED' }]}
      />
    )
    expect(screen.getByText('All clusters healthy')).toBeInTheDocument()
  })

  it('waits for the shared status deadline and gives a new cluster its own loading deadline', async () => {
    mockUseQueries.mockImplementation(jest.requireActual('@tanstack/react-query').useQueries)
    jest
      .mocked(useClusterRunningStatusSocket)
      .mockImplementation(
        jest.requireActual('../hooks/use-cluster-running-status-socket/use-cluster-running-status-socket').default
      )
    const client = new QueryClient()
    const renderCard = (cluster: Cluster) => (
      <QueryClientProvider client={client}>
        <ClusterProductionHealthSummaryCard
          clusters={[cluster]}
          clusterStatuses={[{ ...deployedStatus, cluster_id: cluster.id }]}
        />
      </QueryClientProvider>
    )
    const { rerender, container, unmount } = renderWithProviders(renderCard(baseCluster))
    const advance = async (ms: number) => {
      await act(async () => {
        jest.advanceTimersByTime(ms)
      })
    }

    try {
      expect(container.querySelector('[aria-busy="true"]')).toBeInTheDocument()
      await advance(2_999)
      expect(container.querySelector('[aria-busy="true"]')).toBeInTheDocument()
      expect(screen.queryByText('1 cluster needs attention')).not.toBeInTheDocument()

      await advance(1)
      // React Query batches observer notifications on a separate timer.
      await advance(1)
      expect(screen.getByText('1 cluster needs attention')).toBeInTheDocument()
      expect(container.querySelector('[aria-busy="true"]')).not.toBeInTheDocument()

      const nextCluster = {
        ...baseCluster,
        id: 'cluster-id-2',
        organization: { id: 'org-id-2' },
        name: 'prod-cluster-2',
      } as Cluster
      rerender(renderCard(nextCluster))

      expect(container.querySelector('[aria-busy="true"]')).toBeInTheDocument()
      await advance(2_999)
      expect(container.querySelector('[aria-busy="true"]')).toBeInTheDocument()
      expect(screen.queryByText('1 cluster needs attention')).not.toBeInTheDocument()

      await advance(1)
      await advance(1)
      expect(screen.getByText('1 cluster needs attention')).toBeInTheDocument()
      expect(container.querySelector('[aria-busy="true"]')).not.toBeInTheDocument()
    } finally {
      unmount()
      client.clear()
    }
  })
})
