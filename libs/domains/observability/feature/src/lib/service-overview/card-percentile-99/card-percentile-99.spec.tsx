import { renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import * as useMetricsImport from '../../hooks/use-metrics/use-metrics'
import { ServiceOverviewProvider } from '../util-filter/service-overview-context'
import { CardPercentile99 } from './card-percentile-99'

jest.mock('../../hooks/use-metrics/use-metrics')
const useMetrics = useMetricsImport.useMetrics as jest.MockedFunction<typeof useMetricsImport.useMetrics>

jest.mock('../network-request-duration-chart/network-request-duration-chart', () => ({
  __esModule: true,
  default: () => <div data-testid="network-request-duration-chart">Chart Component</div>,
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

describe('CardPercentile99', () => {
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
        <CardPercentile99 {...defaultProps} />
      </ServiceOverviewProvider>
    )

    expect(baseElement).toBeTruthy()
    const skeleton = document.querySelector('[aria-busy="true"]')
    expect(skeleton).toBeInTheDocument()
  })

  it('should render with high percentile value (RED status)', () => {
    useMetrics.mockReturnValue(
      createMockUseMetricsReturn({
        data: {
          result: [
            {
              value: [1234567890, '0.2'],
            },
          ],
        },
      })
    )

    renderWithProviders(
      <ServiceOverviewProvider>
        <CardPercentile99 {...defaultProps} />
      </ServiceOverviewProvider>
    )

    expect(screen.getByText('200ms network request duration')).toBeInTheDocument()
    expect(screen.getByText('for p99')).toBeInTheDocument()
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
        <CardPercentile99 {...defaultProps} />
      </ServiceOverviewProvider>
    )

    expect(screen.getByText('0ms network request duration')).toBeInTheDocument()
    expect(screen.getByText('for p99')).toBeInTheDocument()
  })

  it('should handle undefined metrics data', () => {
    useMetrics.mockReturnValue(createMockUseMetricsReturn())

    renderWithProviders(
      <ServiceOverviewProvider>
        <CardPercentile99 {...defaultProps} />
      </ServiceOverviewProvider>
    )

    expect(screen.getByText('0ms network request duration')).toBeInTheDocument()
    expect(screen.getByText('for p99')).toBeInTheDocument()
  })

  it('should open modal when clicking on card', async () => {
    useMetrics.mockReturnValue(
      createMockUseMetricsReturn({
        data: {
          result: [
            {
              value: [1234567890, '0.100'],
            },
          ],
        },
      })
    )

    const { userEvent } = renderWithProviders(
      <ServiceOverviewProvider>
        <CardPercentile99 {...defaultProps} />
      </ServiceOverviewProvider>
    )

    const buttons = screen.getAllByRole('button')
    const mainButton = buttons[0]
    await userEvent.click(mainButton)

    await waitFor(() => {
      expect(screen.getByTestId('network-request-duration-chart')).toBeInTheDocument()
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })
  })

  it('should call useMetrics with correct parameters', () => {
    useMetrics.mockReturnValue(createMockUseMetricsReturn())

    renderWithProviders(
      <ServiceOverviewProvider>
        <CardPercentile99 {...defaultProps} />
      </ServiceOverviewProvider>
    )

    expect(useMetrics).toHaveBeenCalledWith({
      clusterId: 'test-cluster-id',
      query: expect.stringContaining('histogram_quantile'),
      queryRange: 'query',
      timeRange: '1h',
    })

    const call = useMetrics.mock.calls[0][0].query
    expect(call).toContain('test-service-id')
    expect(call).toContain('0.99')
  })

  it('should always show modal link', () => {
    useMetrics.mockReturnValue(
      createMockUseMetricsReturn({
        data: {
          result: [
            {
              value: [1234567890, '0.100'],
            },
          ],
        },
      })
    )

    renderWithProviders(
      <ServiceOverviewProvider>
        <CardPercentile99 {...defaultProps} />
      </ServiceOverviewProvider>
    )

    const buttons = screen.getAllByRole('button')
    const mainButton = buttons[0]
    expect(mainButton).not.toHaveClass('cursor-default')
  })
})
