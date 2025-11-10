import { renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import * as useInstantMetricsImport from '../../../hooks/use-instant-metrics/use-instant-metrics'
import { DashboardProvider } from '../../../util-filter/dashboard-context'
import { CardInstanceStatus } from './card-instance-status'

jest.mock('../../../hooks/use-instant-metrics/use-instant-metrics')
const useInstantMetrics = useInstantMetricsImport.useInstantMetrics as jest.MockedFunction<
  typeof useInstantMetricsImport.useInstantMetrics
>

jest.mock('../instance-status-chart/instance-status-chart', () => ({
  InstanceStatusChart: () => <div data-testid="instance-status-chart">Chart Component</div>,
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

describe('CardInstanceStatus', () => {
  const defaultProps = {
    serviceId: 'test-service-id',
    clusterId: 'test-cluster-id',
    containerName: 'test-container-name',
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render successfully with loading state', () => {
    useInstantMetrics.mockReturnValue(createMockUseInstantMetricsReturn(undefined, true))

    const { baseElement } = renderWithProviders(
      <DashboardProvider>
        <CardInstanceStatus {...defaultProps} />
      </DashboardProvider>
    )

    expect(baseElement).toBeTruthy()
  })

  it('should render with no instance issues (GREEN status)', () => {
    useInstantMetrics.mockReturnValue(
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
        <CardInstanceStatus {...defaultProps} />
      </DashboardProvider>
    )

    expect(screen.getByText('Instance errors')).toBeInTheDocument()
    const instanceErrorsElement = screen.getByText('Instance errors').closest('div')
    const instanceErrorsValue = instanceErrorsElement?.querySelector('.font-medium')
    expect(instanceErrorsValue).toHaveTextContent('0')
  })

  it('should render with instance issues (RED status) and show modal link', () => {
    useInstantMetrics.mockReturnValue(
      createMockUseInstantMetricsReturn({
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
      <DashboardProvider>
        <CardInstanceStatus {...defaultProps} />
      </DashboardProvider>
    )

    expect(screen.getByText('Instance errors')).toBeInTheDocument()
    const instanceErrorsElement = screen.getByText('Instance errors').closest('div')
    const instanceErrorsValue = instanceErrorsElement?.querySelector('.font-medium')
    expect(instanceErrorsValue).toHaveTextContent('2')

    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThan(0)
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
      <DashboardProvider>
        <CardInstanceStatus {...defaultProps} />
      </DashboardProvider>
    )

    const instanceErrorsElement = screen.getByText('Instance errors').closest('div')
    const instanceErrorsValue = instanceErrorsElement?.querySelector('.font-medium')
    expect(instanceErrorsValue).toHaveTextContent('0')
  })

  it('should handle undefined metrics data', () => {
    useInstantMetrics.mockReturnValue(createMockUseInstantMetricsReturn())

    renderWithProviders(
      <DashboardProvider>
        <CardInstanceStatus {...defaultProps} />
      </DashboardProvider>
    )

    const instanceErrorsElement = screen.getByText('Instance errors').closest('div')
    const instanceErrorsValue = instanceErrorsElement?.querySelector('.font-medium')
    expect(instanceErrorsValue).toHaveTextContent('0')
  })

  it('should open modal when clicking on card with instance issues', async () => {
    useInstantMetrics.mockReturnValue(
      createMockUseInstantMetricsReturn({
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
      <DashboardProvider>
        <CardInstanceStatus {...defaultProps} />
      </DashboardProvider>
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

  it('should call useInstantMetrics with correct parameters', () => {
    useInstantMetrics.mockReturnValue(createMockUseInstantMetricsReturn())

    renderWithProviders(
      <DashboardProvider>
        <CardInstanceStatus {...defaultProps} />
      </DashboardProvider>
    )

    expect(useInstantMetrics).toHaveBeenCalledTimes(2)
    expect(useInstantMetrics).toHaveBeenCalledWith({
      clusterId: 'test-cluster-id',
      query: expect.stringContaining('kube_pod_container_status_restarts_total'),
      startTimestamp: expect.any(String),
      endTimestamp: expect.any(String),
      boardShortName: 'service_overview',
      metricShortName: 'card_instance_status_error_count',
    })

    const call = useInstantMetrics.mock.calls[0][0].query
    expect(call).toContain('test-container-name')
    expect(call).toContain('kube_pod_container_status_waiting_reason')
  })

  it('should always show modal link', () => {
    useInstantMetrics.mockReturnValue(
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
        <CardInstanceStatus {...defaultProps} />
      </DashboardProvider>
    )

    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThan(0)
    expect(buttons[0]).not.toHaveClass('cursor-default')
  })
})
