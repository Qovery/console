import { renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import * as useInstantMetricsImport from '../../../hooks/use-instant-metrics/use-instant-metrics'
import { DashboardProvider } from '../../../util-filter/dashboard-context'
import { CardHTTPErrors } from './card-http-errors'

jest.mock('../../../hooks/use-instant-metrics/use-instant-metrics')
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
    httpRouteName: 'test-httproute-name',
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render successfully with loading state', () => {
    // Mock all 4 calls (nginx error, nginx total, envoy error, envoy total) as loading
    useInstantMetrics.mockReturnValue(createMockUseInstantMetricsReturn(undefined, true))

    const { baseElement } = renderWithProviders(
      <DashboardProvider>
        <CardHTTPErrors {...defaultProps} />
      </DashboardProvider>
    )

    expect(baseElement).toBeTruthy()
  })

  it('should render with no errors (GREEN status)', () => {
    useInstantMetrics
      // NGINX error requests
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
      // NGINX total requests
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
      // ENVOY error requests
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
      // ENVOY total requests
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
      <DashboardProvider>
        <CardHTTPErrors {...defaultProps} />
      </DashboardProvider>
    )

    expect(screen.getByText('0% HTTP error rate')).toBeInTheDocument()
    expect(screen.getByText(/on \d+ request/)).toBeInTheDocument()
  })

  it('should render with errors (RED status) and show modal link', () => {
    useInstantMetrics
      // NGINX error requests
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
      // NGINX total requests
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
      // ENVOY error requests
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
      // ENVOY total requests
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

    renderWithProviders(
      <DashboardProvider>
        <CardHTTPErrors {...defaultProps} />
      </DashboardProvider>
    )

    expect(screen.getByText('16% HTTP error rate')).toBeInTheDocument()
    expect(screen.getByText(/on \d+ request/)).toBeInTheDocument()

    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThan(0)
  })

  it('should handle empty metrics data', () => {
    useInstantMetrics
      // NGINX error requests
      .mockReturnValueOnce(
        createMockUseInstantMetricsReturn({
          data: {
            result: [],
          },
        })
      )
      // NGINX total requests
      .mockReturnValueOnce(
        createMockUseInstantMetricsReturn({
          data: {
            result: [],
          },
        })
      )
      // ENVOY error requests
      .mockReturnValueOnce(
        createMockUseInstantMetricsReturn({
          data: {
            result: [],
          },
        })
      )
      // ENVOY total requests
      .mockReturnValueOnce(
        createMockUseInstantMetricsReturn({
          data: {
            result: [],
          },
        })
      )

    renderWithProviders(
      <DashboardProvider>
        <CardHTTPErrors {...defaultProps} />
      </DashboardProvider>
    )

    expect(screen.getByText('0% HTTP error rate')).toBeInTheDocument()
  })

  it('should handle undefined metrics data', () => {
    useInstantMetrics
      // NGINX error requests
      .mockReturnValueOnce(createMockUseInstantMetricsReturn())
      // NGINX total requests
      .mockReturnValueOnce(createMockUseInstantMetricsReturn())
      // ENVOY error requests
      .mockReturnValueOnce(createMockUseInstantMetricsReturn())
      // ENVOY total requests
      .mockReturnValueOnce(createMockUseInstantMetricsReturn())

    renderWithProviders(
      <DashboardProvider>
        <CardHTTPErrors {...defaultProps} />
      </DashboardProvider>
    )

    expect(screen.getByText('0% HTTP error rate')).toBeInTheDocument()
  })

  it('should open modal when clicking on card with errors', async () => {
    let callCount = 0
    useInstantMetrics.mockImplementation(() => {
      callCount++
      // Calls: 1=nginx errors, 2=nginx total, 3=envoy errors, 4=envoy total
      if (callCount === 1) {
        // NGINX error requests
        return createMockUseInstantMetricsReturn({
          data: {
            result: [
              {
                value: [1234567890, '25'],
              },
            ],
          },
        })
      } else if (callCount === 2) {
        // NGINX total requests
        return createMockUseInstantMetricsReturn({
          data: {
            result: [
              {
                value: [1234567890, '100'],
              },
            ],
          },
        })
      } else if (callCount === 3) {
        // ENVOY error requests
        return createMockUseInstantMetricsReturn({
          data: {
            result: [
              {
                value: [1234567890, '0'],
              },
            ],
          },
        })
      } else {
        // ENVOY total requests
        return createMockUseInstantMetricsReturn({
          data: {
            result: [
              {
                value: [1234567890, '0'],
              },
            ],
          },
        })
      }
    })

    const { userEvent } = renderWithProviders(
      <DashboardProvider>
        <CardHTTPErrors {...defaultProps} />
      </DashboardProvider>
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
      // NGINX error requests
      .mockReturnValueOnce(createMockUseInstantMetricsReturn())
      // NGINX total requests
      .mockReturnValueOnce(createMockUseInstantMetricsReturn())
      // ENVOY error requests
      .mockReturnValueOnce(createMockUseInstantMetricsReturn())
      // ENVOY total requests
      .mockReturnValueOnce(createMockUseInstantMetricsReturn())

    renderWithProviders(
      <DashboardProvider>
        <CardHTTPErrors {...defaultProps} />
      </DashboardProvider>
    )

    // Now called 4 times: nginx errors, nginx total, envoy errors, envoy total
    expect(useInstantMetrics).toHaveBeenCalledTimes(4)

    // Check nginx calls
    expect(useInstantMetrics).toHaveBeenCalledWith({
      clusterId: 'test-cluster-id',
      query: expect.stringContaining('nginx:req_inc:5m'),
      startTimestamp: expect.any(String),
      endTimestamp: expect.any(String),
      boardShortName: 'service_overview',
      metricShortName: 'card_req_all_number',
    })

    const calledQuery = useInstantMetrics.mock.calls[0][0].query
    expect(calledQuery).toContain('test-ingress-name')

    // Check envoy calls
    const envoyQuery = useInstantMetrics.mock.calls[2][0].query
    expect(envoyQuery).toContain('test-httproute-name')
  })

  it('should not show modal link when there are no errors', () => {
    useInstantMetrics
      // NGINX error requests
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
      // NGINX total requests
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
      // ENVOY error requests
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
      // ENVOY total requests
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

    renderWithProviders(
      <DashboardProvider>
        <CardHTTPErrors {...defaultProps} />
      </DashboardProvider>
    )

    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBe(1)
    expect(buttons[0]).toBeInTheDocument()
  })
})
