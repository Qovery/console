import { renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import * as useMetricsImport from '../../hooks/use-metrics/use-metrics'
import { ServiceOverviewProvider } from '../util-filter/service-overview-context'
import { CardStorage } from './card-storage'

jest.mock('../../hooks/use-metrics/use-metrics')
const useMetrics = useMetricsImport.useMetrics as jest.MockedFunction<typeof useMetricsImport.useMetrics>

jest.mock('../persistent-storage-chart/persistent-storage-chart', () => ({
  PersistentStorageChart: () => <div data-testid="persistent-storage-chart">Storage Chart Component</div>,
}))

const createMockUseMetricsReturn = (
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
  }) as unknown as ReturnType<typeof useMetricsImport.useMetrics>

describe('CardStorage', () => {
  const defaultProps = {
    serviceId: 'test-service-id',
    clusterId: 'test-cluster-id',
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render successfully with loading state', () => {
    useMetrics.mockReturnValue(createMockUseMetricsReturn(undefined, true))

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
    useMetrics.mockReturnValue(
      createMockUseMetricsReturn({
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
    useMetrics.mockReturnValue(
      createMockUseMetricsReturn({
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
    useMetrics.mockReturnValue(
      createMockUseMetricsReturn({
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
    useMetrics.mockReturnValue(createMockUseMetricsReturn())

    renderWithProviders(
      <ServiceOverviewProvider>
        <CardStorage {...defaultProps} />
      </ServiceOverviewProvider>
    )

    expect(screen.getByText('No storage usage data')).toBeInTheDocument()
  })

  it('should open modal when clicking on card', async () => {
    useMetrics.mockReturnValue(
      createMockUseMetricsReturn({
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

  it('should call useMetrics with correct parameters', () => {
    useMetrics.mockReturnValue(createMockUseMetricsReturn())

    renderWithProviders(
      <ServiceOverviewProvider>
        <CardStorage {...defaultProps} />
      </ServiceOverviewProvider>
    )

    expect(useMetrics).toHaveBeenCalledWith({
      clusterId: 'test-cluster-id',
      query: expect.stringContaining('kubelet_volume_stats_used_bytes'),
      queryRange: 'query',
      timeRange: '1h',
    })

    const call = useMetrics.mock.calls[0][0].query
    expect(call).toContain('test-service-id')
    expect(call).toContain('kubelet_volume_stats_capacity_bytes')
  })

  it('should always show modal link', () => {
    useMetrics.mockReturnValue(
      createMockUseMetricsReturn({
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
