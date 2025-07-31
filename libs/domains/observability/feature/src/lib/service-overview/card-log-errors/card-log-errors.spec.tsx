import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import * as useMetricsImport from '../../hooks/use-metrics/use-metrics'
import { ServiceOverviewProvider } from '../util-filter/service-overview-context'
import { CardLogErrors } from './card-log-errors'

const mockedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate,
  useLocation: () => ({ pathname: '/test' }),
}))

jest.mock('../../hooks/use-metrics/use-metrics')
const useMetrics = useMetricsImport.useMetrics as jest.MockedFunction<typeof useMetricsImport.useMetrics>

const createMockUseMetricsReturn = (
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
  }) as unknown as ReturnType<typeof useMetricsImport.useMetrics>

describe('CardLogErrors', () => {
  const defaultProps = {
    organizationId: 'test-org-id',
    projectId: 'test-project-id',
    environmentId: 'test-env-id',
    serviceId: 'test-service-id',
    clusterId: 'test-cluster-id',
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockedNavigate.mockClear()
  })

  it('should render successfully with loading state', () => {
    useMetrics.mockReturnValue(createMockUseMetricsReturn(undefined, true))

    const { baseElement } = renderWithProviders(
      <ServiceOverviewProvider>
        <CardLogErrors {...defaultProps} />
      </ServiceOverviewProvider>
    )

    expect(baseElement).toBeTruthy()
  })

  it('should render with no log errors (GREEN status)', () => {
    useMetrics.mockReturnValue(
      createMockUseMetricsReturn({
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

    expect(screen.getByText('Log error rate')).toBeInTheDocument()
    expect(screen.getByText('0')).toBeInTheDocument()
    expect(screen.getByText('in the last 30m')).toBeInTheDocument()
  })

  it('should render with log errors (RED status)', () => {
    useMetrics.mockReturnValue(
      createMockUseMetricsReturn({
        data: {
          result: [{}, {}],
        },
      })
    )

    renderWithProviders(
      <ServiceOverviewProvider>
        <CardLogErrors {...defaultProps} />
      </ServiceOverviewProvider>
    )

    expect(screen.getByText('Log error rate')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('in the last 30m')).toBeInTheDocument()
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
        <CardLogErrors {...defaultProps} />
      </ServiceOverviewProvider>
    )

    expect(screen.getByText('0')).toBeInTheDocument()
    expect(screen.getByText('in the last 30m')).toBeInTheDocument()
  })

  it('should handle undefined metrics data', () => {
    useMetrics.mockReturnValue(createMockUseMetricsReturn())

    renderWithProviders(
      <ServiceOverviewProvider>
        <CardLogErrors {...defaultProps} />
      </ServiceOverviewProvider>
    )

    expect(screen.getByText('0')).toBeInTheDocument()
    expect(screen.getByText('in the last 30m')).toBeInTheDocument()
  })

  it('should navigate to logs when clicked', async () => {
    useMetrics.mockReturnValue(
      createMockUseMetricsReturn({
        data: {
          result: [{}],
        },
      })
    )

    const { userEvent } = renderWithProviders(
      <ServiceOverviewProvider>
        <CardLogErrors {...defaultProps} />
      </ServiceOverviewProvider>
    )

    const button = screen.getByRole('button', { name: /log error rate/i })
    await userEvent.click(button)

    expect(mockedNavigate).toHaveBeenCalledWith(
      '/organization/test-org-id/project/test-project-id/environment/test-env-id/logs/test-service-id/service-logs',
      {
        state: { prevUrl: '/test' },
      }
    )
  })

  it('should call useMetrics with correct parameters', () => {
    useMetrics.mockReturnValue(createMockUseMetricsReturn())

    renderWithProviders(
      <ServiceOverviewProvider>
        <CardLogErrors {...defaultProps} />
      </ServiceOverviewProvider>
    )

    expect(useMetrics).toHaveBeenCalledWith({
      clusterId: 'test-cluster-id',
      query: 'sum (increase(promtail_custom_q_log_errors_total{qovery_com_service_id=~"test-service-id"}[30m]))',
      queryRange: 'query',
      timeRange: '30m',
    })
  })
})
