import { renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import * as useMetricsImport from '../../hooks/use-metrics/use-metrics'
import { ServiceOverviewProvider } from '../util-filter/service-overview-context'
import { CardHTTPErrors } from './card-http-errors'

jest.mock('../../hooks/use-metrics/use-metrics')
const useMetrics = useMetricsImport.useMetrics as jest.MockedFunction<typeof useMetricsImport.useMetrics>

jest.mock('../instance-http-errors-chart/instance-http-errors-chart', () => ({
  InstanceHTTPErrorsChart: () => <div data-testid="instance-http-errors-chart">Chart Component</div>,
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

describe('CardHTTPErrors', () => {
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
        <CardHTTPErrors {...defaultProps} />
      </ServiceOverviewProvider>
    )

    expect(baseElement).toBeTruthy()
  })

  it('should render with no errors (GREEN status)', () => {
    useMetrics.mockReturnValue(
      createMockUseMetricsReturn({
        data: {
          result: [
            {
              value: [1234567890, '0'],
            },
          ],
        },
      })
    )

    renderWithProviders(
      <ServiceOverviewProvider>
        <CardHTTPErrors {...defaultProps} />
      </ServiceOverviewProvider>
    )

    expect(screen.getByText('0% HTTP error rate')).toBeInTheDocument()
    expect(screen.getByText(/on \d+ request/)).toBeInTheDocument()
  })

  it('should render with errors (RED status) and show modal link', () => {
    useMetrics.mockReturnValue(
      createMockUseMetricsReturn({
        data: {
          result: [
            {
              value: [1234567890, '15.5'],
            },
          ],
        },
      })
    )

    renderWithProviders(
      <ServiceOverviewProvider>
        <CardHTTPErrors {...defaultProps} />
      </ServiceOverviewProvider>
    )

    expect(screen.getByText('16% HTTP error rate')).toBeInTheDocument()
    expect(screen.getByText(/on \d+ request/)).toBeInTheDocument()

    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThan(0)
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
        <CardHTTPErrors {...defaultProps} />
      </ServiceOverviewProvider>
    )

    expect(screen.getByText('0% HTTP error rate')).toBeInTheDocument()
  })

  it('should handle undefined metrics data', () => {
    useMetrics.mockReturnValue(createMockUseMetricsReturn())

    renderWithProviders(
      <ServiceOverviewProvider>
        <CardHTTPErrors {...defaultProps} />
      </ServiceOverviewProvider>
    )

    expect(screen.getByText('0% HTTP error rate')).toBeInTheDocument()
  })

  it('should open modal when clicking on card with errors', async () => {
    useMetrics.mockReturnValue(
      createMockUseMetricsReturn({
        data: {
          result: [
            {
              value: [1234567890, '25'],
            },
          ],
        },
      })
    )

    const { userEvent } = renderWithProviders(
      <ServiceOverviewProvider>
        <CardHTTPErrors {...defaultProps} />
      </ServiceOverviewProvider>
    )

    const buttons = screen.getAllByRole('button')
    const cardButton = buttons[0]
    await userEvent.click(cardButton)

    await waitFor(() => {
      expect(screen.getByText('Number of HTTP errors over time.')).toBeInTheDocument()
      expect(screen.getByTestId('instance-http-errors-chart')).toBeInTheDocument()
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })
  })

  it('should call useMetrics with correct parameters', () => {
    const mockUseMetrics = jest.spyOn(useMetricsImport, 'useMetrics')

    mockUseMetrics.mockReturnValue(createMockUseMetricsReturn())

    renderWithProviders(
      <ServiceOverviewProvider>
        <CardHTTPErrors {...defaultProps} />
      </ServiceOverviewProvider>
    )

    expect(mockUseMetrics).toHaveBeenCalledWith({
      clusterId: 'test-cluster-id',
      query: expect.stringContaining('nginx_ingress_controller_requests{status=~"499|5.."}'),
      queryRange: 'query',
    })

    const calledQuery = mockUseMetrics.mock.calls[0][0].query
    expect(calledQuery).toContain('test-service-id')
  })

  it('should not show modal link when there are no errors', () => {
    useMetrics.mockReturnValue(
      createMockUseMetricsReturn({
        data: {
          result: [
            {
              value: [1234567890, '0'],
            },
          ],
        },
      })
    )

    renderWithProviders(
      <ServiceOverviewProvider>
        <CardHTTPErrors {...defaultProps} />
      </ServiceOverviewProvider>
    )

    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBe(1)
    expect(buttons[0]).toBeInTheDocument()
  })
})
