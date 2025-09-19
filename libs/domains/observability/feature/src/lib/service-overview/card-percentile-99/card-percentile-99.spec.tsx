import { renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import * as useInstantMetricsImport from '../../hooks/use-instant-metrics/use-instant-metrics'
import { ServiceOverviewProvider } from '../util-filter/service-overview-context'
import { CardPercentile99 } from './card-percentile-99'

jest.mock('../../hooks/use-instant-metrics.ts/use-instant-metrics')
const useInstantMetrics = useInstantMetricsImport.useInstantMetrics as jest.MockedFunction<
  typeof useInstantMetricsImport.useInstantMetrics
>

jest.mock('../network-request-duration-chart/network-request-duration-chart', () => ({
  __esModule: true,
  default: () => <div data-testid="network-request-duration-chart">Chart Component</div>,
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

describe('CardPercentile99', () => {
  const defaultProps = {
    serviceId: 'test-service-id',
    clusterId: 'test-cluster-id',
    containerName: 'test-container-name',
    ingressName: 'test-ingress-name',
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render successfully with loading state', () => {
    useInstantMetrics.mockReturnValue(createMockUseInstantMetricsReturn(undefined, true))

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
    useInstantMetrics.mockReturnValue(
      createMockUseInstantMetricsReturn({
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
    useInstantMetrics.mockReturnValue(
      createMockUseInstantMetricsReturn({
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
    useInstantMetrics.mockReturnValue(createMockUseInstantMetricsReturn())

    renderWithProviders(
      <ServiceOverviewProvider>
        <CardPercentile99 {...defaultProps} />
      </ServiceOverviewProvider>
    )

    expect(screen.getByText('0ms network request duration')).toBeInTheDocument()
    expect(screen.getByText('for p99')).toBeInTheDocument()
  })

  it('should open modal when clicking on card', async () => {
    useInstantMetrics.mockReturnValue(
      createMockUseInstantMetricsReturn({
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

  it('should call useInstantMetrics with correct parameters', () => {
    useInstantMetrics.mockReturnValue(createMockUseInstantMetricsReturn())

    renderWithProviders(
      <ServiceOverviewProvider>
        <CardPercentile99 {...defaultProps} />
      </ServiceOverviewProvider>
    )

    expect(useInstantMetrics).toHaveBeenCalledWith({
      clusterId: 'test-cluster-id',
      query: expect.stringContaining('histogram_quantile'),
      endTimestamp: expect.any(String),
      boardShortName: 'service_overview',
      metricShortName: 'card_p99_count',
    })

    const call = useInstantMetrics.mock.calls[0][0].query
    expect(call).toContain('test-ingress-name')
    expect(call).toContain('0.99')
  })

  it('should always show modal link', () => {
    useInstantMetrics.mockReturnValue(
      createMockUseInstantMetricsReturn({
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
