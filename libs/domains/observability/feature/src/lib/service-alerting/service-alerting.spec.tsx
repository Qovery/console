import { AlertRuleState, AlertSeverity } from 'qovery-typescript-axios'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { ServiceAlerting } from './service-alerting'

const mockUseParams = jest.fn()
const mockUseAlertRules = jest.fn()
const mockUseEnvironment = jest.fn()

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => mockUseParams(),
}))

jest.mock('../hooks/use-alert-rules/use-alert-rules', () => ({
  useAlertRules: (params: unknown) => mockUseAlertRules(params),
}))

jest.mock('../hooks/use-environment/use-environment', () => ({
  useEnvironment: (params: unknown) => mockUseEnvironment(params),
}))

describe('ServiceAlerting', () => {
  const defaultEnvironment = {
    id: 'env-123',
    name: 'Production',
    organization: {
      id: 'org-123',
      name: 'Test Org',
    },
  }

  const createAlertRule = (overrides = {}) => ({
    id: 'alert-1',
    name: 'High CPU Usage',
    state: AlertRuleState.OK,
    enabled: true,
    severity: AlertSeverity.CRITICAL,
    target: {
      target_id: 'app-123',
    },
    ...overrides,
  })

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseParams.mockReturnValue({
      environmentId: 'env-123',
      applicationId: 'app-123',
    })
    mockUseEnvironment.mockReturnValue({
      data: defaultEnvironment,
    })
    mockUseAlertRules.mockReturnValue({
      data: [],
      isFetched: true,
    })
  })

  it('should render null when environment is not loaded', () => {
    mockUseEnvironment.mockReturnValue({
      data: undefined,
    })

    const { container } = renderWithProviders(<ServiceAlerting />)

    expect(container).toBeEmptyDOMElement()
  })

  it('should render null when alert rules are not fetched', () => {
    mockUseAlertRules.mockReturnValue({
      data: [],
      isFetched: false,
    })

    const { container } = renderWithProviders(<ServiceAlerting />)

    expect(container).toBeEmptyDOMElement()
  })

  it('should render empty state when no alerts exist', () => {
    renderWithProviders(<ServiceAlerting />)

    expect(screen.getByText('No alerts created for this service')).toBeInTheDocument()
  })

  it('should render table with alert rules when they exist', () => {
    const alertRules = [
      createAlertRule({ id: 'alert-1', name: 'CPU Alert' }),
      createAlertRule({ id: 'alert-2', name: 'Memory Alert' }),
    ]
    mockUseAlertRules.mockReturnValue({
      data: alertRules,
      isFetched: true,
    })

    renderWithProviders(<ServiceAlerting />)

    expect(screen.getByText('CPU Alert')).toBeInTheDocument()
    expect(screen.getByText('Memory Alert')).toBeInTheDocument()
  })

  it('should display correct status for different alert states', () => {
    const alertRules = [
      createAlertRule({ id: 'alert-1', name: 'Triggered Alert', state: AlertRuleState.TRIGGERED }),
      createAlertRule({ id: 'alert-2', name: 'Suppressed Alert', state: AlertRuleState.SUPPRESSED }),
      createAlertRule({ id: 'alert-3', name: 'OK Alert', state: AlertRuleState.OK }),
    ]
    mockUseAlertRules.mockReturnValue({
      data: alertRules,
      isFetched: true,
    })

    renderWithProviders(<ServiceAlerting />)

    expect(screen.getByText('Firing')).toBeInTheDocument()
    expect(screen.getByText('Suppressed')).toBeInTheDocument()
    expect(screen.getByText('Monitoring')).toBeInTheDocument()
  })

  it('should display mute indicator for disabled alerts', () => {
    const alertRule = createAlertRule({ enabled: false })
    mockUseAlertRules.mockReturnValue({
      data: [alertRule],
      isFetched: true,
    })

    renderWithProviders(<ServiceAlerting />)

    const mutedIcons = document.querySelectorAll('.fa-bell-slash')
    expect(mutedIcons.length).toBeGreaterThan(0)
  })

  it('should call useAlertRules with correct organizationId and serviceId', () => {
    renderWithProviders(<ServiceAlerting />)

    expect(mockUseAlertRules).toHaveBeenCalledWith({
      organizationId: 'org-123',
      serviceId: 'app-123',
    })
  })
})
