import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import * as useInstantMetricsImport from '../../hooks/use-instant-metrics/use-instant-metrics'
import * as useLokiMetricsImport from '../../hooks/use-loki-metrics/use-loki-metrics'
import { ServiceOverviewProvider } from '../util-filter/service-overview-context'
import { CardLogErrors } from './card-log-errors'

const mockedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate,
  useLocation: () => ({ pathname: '/test' }),
}))

jest.mock('../../hooks/use-instant-metrics/use-instant-metrics')
jest.mock('../../hooks/use-loki-metrics/use-loki-metrics')

const useInstantMetrics = useInstantMetricsImport.useInstantMetrics as jest.MockedFunction<
  typeof useInstantMetricsImport.useInstantMetrics
>

const useLokiMetrics = useLokiMetricsImport.useLokiMetrics as jest.MockedFunction<
  typeof useLokiMetricsImport.useLokiMetrics
>

const createMockUseInstantMetricsReturn = (
  data?: {
    data?: {
      result?: Array<unknown>
    }
  },
  isLoading = false
) =>
  ({
    data,
    isLoading,
  }) as unknown as ReturnType<typeof useInstantMetricsImport.useInstantMetrics>

const createMockUseLokiMetricsReturn = (
  data?: {
    data?: {
      result?: Array<unknown>
    }
  },
  isLoading = false
) =>
  ({
    data,
    isLoading,
  }) as unknown as ReturnType<typeof useLokiMetricsImport.useLokiMetrics>

describe('CardLogErrors', () => {
  const defaultProps = {
    organizationId: 'test-org-id',
    projectId: 'test-project-id',
    environmentId: 'test-env-id',
    serviceId: 'test-service-id',
    clusterId: 'test-cluster-id',
    containerName: 'test-container-name',
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockedNavigate.mockClear()
    useInstantMetrics.mockReturnValue(createMockUseInstantMetricsReturn(undefined, false))
    useLokiMetrics.mockReturnValue(createMockUseLokiMetricsReturn(undefined, false))
  })

  it('should render successfully with loading state', () => {
    useLokiMetrics.mockReturnValue(createMockUseLokiMetricsReturn(undefined, true))

    const { baseElement } = renderWithProviders(
      <ServiceOverviewProvider>
        <CardLogErrors {...defaultProps} />
      </ServiceOverviewProvider>
    )

    expect(baseElement).toBeTruthy()
  })

  it('should render with no log errors (GREEN status)', () => {
    useLokiMetrics.mockReturnValue(
      createMockUseLokiMetricsReturn({
        data: {
          result: [],
        },
      })
    )

    renderWithProviders(
      <ServiceOverviewProvider>
        <CardLogErrors {...defaultProps} />
      </ServiceOverviewProvider>
    )

    expect(screen.getByText('0 log errors')).toBeInTheDocument()
    expect(screen.getByText('total log errors detected in the selected time range')).toBeInTheDocument()
  })

  it('should render with log errors (RED status)', () => {
    useLokiMetrics.mockReturnValue(
      createMockUseLokiMetricsReturn({
        data: {
          result: [{ value: [null, 2] }],
        },
      })
    )

    renderWithProviders(
      <ServiceOverviewProvider>
        <CardLogErrors {...defaultProps} />
      </ServiceOverviewProvider>
    )

    expect(screen.getByText('2 log errors')).toBeInTheDocument()
    expect(screen.getByText('total log errors detected in the selected time range')).toBeInTheDocument()
  })

  it('should handle empty metrics data', () => {
    useLokiMetrics.mockReturnValue(
      createMockUseLokiMetricsReturn({
        data: {
          result: [],
        },
      })
    )

    renderWithProviders(
      <ServiceOverviewProvider>
        <CardLogErrors {...defaultProps} />
      </ServiceOverviewProvider>
    )

    expect(screen.getByText('0 log errors')).toBeInTheDocument()
    expect(screen.getByText('total log errors detected in the selected time range')).toBeInTheDocument()
  })

  it('should handle undefined metrics data', () => {
    useLokiMetrics.mockReturnValue(createMockUseLokiMetricsReturn())

    renderWithProviders(
      <ServiceOverviewProvider>
        <CardLogErrors {...defaultProps} />
      </ServiceOverviewProvider>
    )

    expect(screen.getByText('0 log errors')).toBeInTheDocument()
    expect(screen.getByText('total log errors detected in the selected time range')).toBeInTheDocument()
  })

  it('should navigate to logs when clicked', async () => {
    useLokiMetrics.mockReturnValue(
      createMockUseLokiMetricsReturn({
        data: {
          result: [{ value: [null, 1] }],
        },
      })
    )

    const { userEvent } = renderWithProviders(
      <ServiceOverviewProvider>
        <CardLogErrors {...defaultProps} />
      </ServiceOverviewProvider>
    )

    const button = screen.getByRole('button')
    await userEvent.click(button)

    expect(mockedNavigate).toHaveBeenCalledWith(
      expect.stringContaining(
        '/organization/test-org-id/project/test-project-id/environment/test-env-id/logs/test-service-id/service-logs?startDate='
      ),
      {
        state: { prevUrl: '/test' },
      }
    )

    const navigateUrl = mockedNavigate.mock.calls[0][0]
    expect(navigateUrl).toMatch(/startDate=[\d-]+T[\d:.%A-Z]+/)
    expect(navigateUrl).toMatch(/endDate=[\d-]+T[\d:.%A-Z]+/)
  })

  it('should call useLokiMetrics with correct parameters for short time ranges', () => {
    useLokiMetrics.mockReturnValue(createMockUseLokiMetricsReturn())

    renderWithProviders(
      <ServiceOverviewProvider>
        <CardLogErrors {...defaultProps} />
      </ServiceOverviewProvider>
    )

    expect(useLokiMetrics).toHaveBeenCalledWith({
      clusterId: 'test-cluster-id',
      query: 'sum(count_over_time({qovery_com_service_id="test-service-id", level="error"} [1h]))',
      endTimestamp: expect.any(String),
      enabled: true,
    })
  })
})
