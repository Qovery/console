import { renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import * as useMetricsImport from '../../hooks/use-metrics/use-metrics'
import { ServiceOverviewProvider } from '../util-filter/service-overview-context'
import { CardInstanceStatus } from './card-instance-status'

jest.mock('../../hooks/use-metrics/use-metrics')
const useMetrics = useMetricsImport.useMetrics as jest.MockedFunction<typeof useMetricsImport.useMetrics>

jest.mock('../instance-status-chart/instance-status-chart', () => ({
  InstanceStatusChart: () => <div data-testid="instance-status-chart">Chart Component</div>,
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

describe('CardInstanceStatus', () => {
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
        <CardInstanceStatus {...defaultProps} />
      </ServiceOverviewProvider>
    )

    expect(baseElement).toBeTruthy()
  })

  it('should render with no instance issues (GREEN status)', () => {
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
        <CardInstanceStatus {...defaultProps} />
      </ServiceOverviewProvider>
    )

    expect(screen.getByText('Instance errors')).toBeInTheDocument()
    const instanceErrorsElement = screen.getByText('Instance errors').closest('div')
    const instanceErrorsValue = instanceErrorsElement?.querySelector('.font-medium')
    expect(instanceErrorsValue).toHaveTextContent('0')
  })

  it('should render with instance issues (RED status) and show modal link', () => {
    useMetrics.mockReturnValue(
      createMockUseMetricsReturn({
        data: {
          result: [
            {
              value: [1234567890, '2'],
            },
          ],
        },
      })
    )

    renderWithProviders(
      <ServiceOverviewProvider>
        <CardInstanceStatus {...defaultProps} />
      </ServiceOverviewProvider>
    )

    expect(screen.getByText('Instance errors')).toBeInTheDocument()
    const instanceErrorsElement = screen.getByText('Instance errors').closest('div')
    const instanceErrorsValue = instanceErrorsElement?.querySelector('.font-medium')
    expect(instanceErrorsValue).toHaveTextContent('2')

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
        <CardInstanceStatus {...defaultProps} />
      </ServiceOverviewProvider>
    )

    const instanceErrorsElement = screen.getByText('Instance errors').closest('div')
    const instanceErrorsValue = instanceErrorsElement?.querySelector('.font-medium')
    expect(instanceErrorsValue).toHaveTextContent('0')
  })

  it('should handle undefined metrics data', () => {
    useMetrics.mockReturnValue(createMockUseMetricsReturn())

    renderWithProviders(
      <ServiceOverviewProvider>
        <CardInstanceStatus {...defaultProps} />
      </ServiceOverviewProvider>
    )

    const instanceErrorsElement = screen.getByText('Instance errors').closest('div')
    const instanceErrorsValue = instanceErrorsElement?.querySelector('.font-medium')
    expect(instanceErrorsValue).toHaveTextContent('0')
  })

  it('should open modal when clicking on card with instance issues', async () => {
    useMetrics.mockReturnValue(
      createMockUseMetricsReturn({
        data: {
          result: [
            {
              value: [1234567890, '3'],
            },
          ],
        },
      })
    )

    const { userEvent } = renderWithProviders(
      <ServiceOverviewProvider>
        <CardInstanceStatus {...defaultProps} />
      </ServiceOverviewProvider>
    )

    const buttons = screen.getAllByRole('button')
    const cardButton = buttons[0]
    await userEvent.click(cardButton)

    await waitFor(() => {
      expect(screen.getByText('Number of healthy and unhealthy instances over time.')).toBeInTheDocument()
      expect(screen.getAllByTestId('instance-status-chart')[0]).toBeInTheDocument()
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })
  })

  it('should call useMetrics with correct parameters', () => {
    useMetrics.mockReturnValue(createMockUseMetricsReturn())

    renderWithProviders(
      <ServiceOverviewProvider>
        <CardInstanceStatus {...defaultProps} />
      </ServiceOverviewProvider>
    )

    expect(useMetrics).toHaveBeenCalledTimes(2)
    expect(useMetrics).toHaveBeenCalledWith({
      clusterId: 'test-cluster-id',
      query: expect.stringContaining('kube_pod_container_status_restarts_total'),
      queryRange: 'query',
    })

    const call = useMetrics.mock.calls[0][0].query
    expect(call).toContain('test-service-id')
    expect(call).toContain('kube_pod_container_status_waiting_reason')
  })

  it('should always show modal link', () => {
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
        <CardInstanceStatus {...defaultProps} />
      </ServiceOverviewProvider>
    )

    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThan(0)
    expect(buttons[0]).not.toHaveClass('cursor-default')
  })
})
