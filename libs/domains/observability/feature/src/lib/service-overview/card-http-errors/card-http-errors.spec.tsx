import { renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import * as useInstantMetricsImport from '../../hooks/use-instant-metrics.ts/use-instant-metrics'
import { ServiceOverviewProvider } from '../util-filter/service-overview-context'
import { CardHTTPErrors } from './card-http-errors'

jest.mock('../../hooks/use-instant-metrics.ts/use-instant-metrics')
const useInstantMetrics = useInstantMetricsImport.useInstantMetrics as jest.MockedFunction<
  typeof useInstantMetricsImport.useInstantMetrics
>

jest.mock('../instance-http-errors-chart/instance-http-errors-chart', () => ({
  InstanceHTTPErrorsChart: () => <div data-testid="instance-http-errors-chart">Chart Component</div>,
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

describe('CardHTTPErrors', () => {
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
        <CardHTTPErrors {...defaultProps} />
      </ServiceOverviewProvider>
    )

    expect(baseElement).toBeTruthy()
  })

  it('should render with no errors (GREEN status)', () => {
    useInstantMetrics
      .mockReturnValueOnce(
        createMockUseInstantMetricsReturn({
          data: {
            result: [
              {
                value: [1234567890, '0'],
              },
            ],
          },
        })
      )
      .mockReturnValueOnce(
        createMockUseInstantMetricsReturn({
          data: {
            result: [
              {
                value: [1234567890, '100'],
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
    useInstantMetrics
      .mockReturnValueOnce(
        createMockUseInstantMetricsReturn({
          data: {
            result: [
              {
                value: [1234567890, '15.5'],
              },
            ],
          },
        })
      )
      .mockReturnValueOnce(
        createMockUseInstantMetricsReturn({
          data: {
            result: [
              {
                value: [1234567890, '100'],
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
    useInstantMetrics
      .mockReturnValueOnce(
        createMockUseInstantMetricsReturn({
          data: {
            result: [],
          },
        })
      )
      .mockReturnValueOnce(
        createMockUseInstantMetricsReturn({
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
    useInstantMetrics
      .mockReturnValueOnce(createMockUseInstantMetricsReturn())
      .mockReturnValueOnce(createMockUseInstantMetricsReturn())

    renderWithProviders(
      <ServiceOverviewProvider>
        <CardHTTPErrors {...defaultProps} />
      </ServiceOverviewProvider>
    )

    expect(screen.getByText('0% HTTP error rate')).toBeInTheDocument()
  })

  it('should open modal when clicking on card with errors', async () => {
    let callCount = 0
    useInstantMetrics.mockImplementation(() => {
      callCount++
      if (callCount === 1) {
        return createMockUseInstantMetricsReturn({
          data: {
            result: [
              {
                value: [1234567890, '25'],
              },
            ],
          },
        })
      } else {
        return createMockUseInstantMetricsReturn({
          data: {
            result: [
              {
                value: [1234567890, '100'],
              },
            ],
          },
        })
      }
    })

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

  it('should call useInstantMetrics with correct parameters', () => {
    useInstantMetrics
      .mockReturnValueOnce(createMockUseInstantMetricsReturn())
      .mockReturnValueOnce(createMockUseInstantMetricsReturn())

    renderWithProviders(
      <ServiceOverviewProvider>
        <CardHTTPErrors {...defaultProps} />
      </ServiceOverviewProvider>
    )

    expect(useInstantMetrics).toHaveBeenCalledTimes(2)
    expect(useInstantMetrics).toHaveBeenCalledWith({
      clusterId: 'test-cluster-id',
      query: expect.stringContaining('nginx_ingress_controller_requests'),
      endTimestamp: expect.any(String),
    })

    const calledQuery = useInstantMetrics.mock.calls[0][0].query
    expect(calledQuery).toContain('test-ingress-name')
  })

  it('should not show modal link when there are no errors', () => {
    useInstantMetrics
      .mockReturnValueOnce(
        createMockUseInstantMetricsReturn({
          data: {
            result: [
              {
                value: [1234567890, '0'],
              },
            ],
          },
        })
      )
      .mockReturnValueOnce(
        createMockUseInstantMetricsReturn({
          data: {
            result: [
              {
                value: [1234567890, '100'],
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
