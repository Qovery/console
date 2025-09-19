import { renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import * as useInstantMetricsImport from '../../hooks/use-instant-metrics/use-instant-metrics'
import { ServiceOverviewProvider } from '../util-filter/service-overview-context'
import { CardStorage } from './card-storage'

jest.mock('../../hooks/use-instant-metrics.ts/use-instant-metrics')
const useInstantMetrics = useInstantMetricsImport.useInstantMetrics as jest.MockedFunction<
  typeof useInstantMetricsImport.useInstantMetrics
>

jest.mock('../persistent-storage-chart/persistent-storage-chart', () => ({
  PersistentStorageChart: () => <div data-testid="persistent-storage-chart">Storage Chart Component</div>,
}))

const createMockUseInstantMetricsReturn = (
  data?: {
    data?: {
      result?: Array<{
        value: [number, string]
      }>
    }
  },
  isLoading = false
) =>
  ({
    data,
    isLoading,
  }) as unknown as ReturnType<typeof useInstantMetricsImport.useInstantMetrics>

describe('CardStorage', () => {
  const defaultProps = {
    serviceId: 'test-service-id',
    clusterId: 'test-cluster-id',
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render successfully with loading state', () => {
    useInstantMetrics.mockReturnValue(createMockUseInstantMetricsReturn(undefined, true))

    const { baseElement } = renderWithProviders(
      <ServiceOverviewProvider>
        <CardStorage {...defaultProps} />
      </ServiceOverviewProvider>
    )

    expect(baseElement).toBeTruthy()
    const skeleton = document.querySelector('[aria-busy="true"]')
    expect(skeleton).toBeInTheDocument()
  })

  it('should render with low storage usage (GREEN status)', () => {
    useInstantMetrics.mockReturnValue(
      createMockUseInstantMetricsReturn({
        data: {
          result: [
            {
              value: [1234567890, '50'],
            },
          ],
        },
      })
    )

    renderWithProviders(
      <ServiceOverviewProvider>
        <CardStorage {...defaultProps} />
      </ServiceOverviewProvider>
    )

    expect(screen.getByText(/50.*max storage usage/)).toBeInTheDocument()
    expect(screen.getByText(/50% of your/)).toBeInTheDocument()
  })

  it('should render with high storage usage (RED status)', () => {
    useInstantMetrics.mockReturnValue(
      createMockUseInstantMetricsReturn({
        data: {
          result: [
            {
              value: [1234567890, '85'],
            },
          ],
        },
      })
    )

    renderWithProviders(
      <ServiceOverviewProvider>
        <CardStorage {...defaultProps} />
      </ServiceOverviewProvider>
    )

    expect(screen.getByText(/85.*max storage usage/)).toBeInTheDocument()
    expect(screen.getByText(/85% of your/)).toBeInTheDocument()
  })

  it('should handle empty metrics data', () => {
    useInstantMetrics.mockReturnValue(
      createMockUseInstantMetricsReturn({
        data: {
          result: [],
        },
      })
    )

    renderWithProviders(
      <ServiceOverviewProvider>
        <CardStorage {...defaultProps} />
      </ServiceOverviewProvider>
    )

    expect(screen.getByText('No storage usage data')).toBeInTheDocument()
  })

  it('should handle undefined metrics data', () => {
    useInstantMetrics.mockReturnValue(createMockUseInstantMetricsReturn())

    renderWithProviders(
      <ServiceOverviewProvider>
        <CardStorage {...defaultProps} />
      </ServiceOverviewProvider>
    )

    expect(screen.getByText('No storage usage data')).toBeInTheDocument()
  })

  it('should open modal when clicking on card', async () => {
    useInstantMetrics.mockReturnValue(
      createMockUseInstantMetricsReturn({
        data: {
          result: [
            {
              value: [1234567890, '70'],
            },
          ],
        },
      })
    )

    const { userEvent } = renderWithProviders(
      <ServiceOverviewProvider>
        <CardStorage {...defaultProps} />
      </ServiceOverviewProvider>
    )

    const button = screen.getByRole('button')
    await userEvent.click(button)

    await waitFor(() => {
      expect(screen.getByText('Storage usage over time.')).toBeInTheDocument()
      expect(screen.getByTestId('persistent-storage-chart')).toBeInTheDocument()
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })
  })

  it('should call useInstantMetrics with correct parameters', () => {
    useInstantMetrics.mockReturnValue(createMockUseInstantMetricsReturn())

    renderWithProviders(
      <ServiceOverviewProvider>
        <CardStorage {...defaultProps} />
      </ServiceOverviewProvider>
    )

    expect(useInstantMetrics).toHaveBeenCalledWith({
      clusterId: 'test-cluster-id',
      query: expect.stringContaining('kubelet_volume_stats_used_bytes'),
      endTimestamp: expect.any(String),
      boardShortName: 'service_overview',
      metricShortName: 'card_storage_utilization_number',
    })

    const call = useInstantMetrics.mock.calls[0][0].query
    expect(call).toContain('test-service-id')
    expect(call).toContain('kubelet_volume_stats_capacity_bytes')
  })

  it('should always show modal link', () => {
    useInstantMetrics.mockReturnValue(
      createMockUseInstantMetricsReturn({
        data: {
          result: [
            {
              value: [1234567890, '60'],
            },
          ],
        },
      })
    )

    renderWithProviders(
      <ServiceOverviewProvider>
        <CardStorage {...defaultProps} />
      </ServiceOverviewProvider>
    )

    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
  })
})
