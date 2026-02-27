import { AlertRuleState } from 'qovery-typescript-axios'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { ServiceAlerting } from './service-alerting'

const mockUseParams = jest.fn()
const mockUseAlertRules = jest.fn()
const mockUseAlertRulesGhosted = jest.fn()
const mockUseDeleteAlertRule = jest.fn()
const mockUseEnvironment = jest.fn()
const mockUseService = jest.fn()

jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useParams: () => mockUseParams(),
}))

jest.mock('../../hooks/use-alert-rules/use-alert-rules', () => ({
  useAlertRules: (params: unknown) => mockUseAlertRules(params),
}))

jest.mock('../../hooks/use-alert-rules-ghosted/use-alert-rules-ghosted', () => ({
  useAlertRulesGhosted: (params: unknown) => mockUseAlertRulesGhosted(params),
}))

jest.mock('../../hooks/use-delete-alert-rule/use-delete-alert-rule', () => ({
  useDeleteAlertRule: (params: unknown) => mockUseDeleteAlertRule(params),
}))

jest.mock('../../hooks/use-environment/use-environment', () => ({
  useEnvironment: (params: unknown) => mockUseEnvironment(params),
}))

jest.mock('@qovery/domains/services/feature', () => ({
  useService: (params: unknown) => mockUseService(params),
}))

describe('ServiceAlerting', () => {
  const defaultEnvironment = {
    id: 'env-123',
    name: 'Production',
    organization: {
      id: 'org-123',
      name: 'Test Org',
    },
    project: {
      id: 'project-123',
      name: 'Test Project',
    },
  }

  const createAlertRule = (overrides = {}) => ({
    id: 'alert-1',
    name: 'High CPU Usage',
    state: 'MONITORING',
    enabled: true,
    severity: 'CRITICAL',
    is_up_to_date: true,
    source: 'MANAGED',
    target: {
      target_id: 'app-123',
      target_type: 'APPLICATION',
    },
    tag: 'cpu',
    for_duration: 'PT5M',
    condition: {
      kind: 'CUSTOM',
    },
    ...overrides,
  })

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseParams.mockReturnValue({
      organizationId: 'org-123',
      projectId: 'project-123',
      environmentId: 'env-123',
      serviceId: 'app-123',
    })
    mockUseEnvironment.mockReturnValue({
      data: defaultEnvironment,
    })
    mockUseService.mockReturnValue({
      data: { id: 'app-123', name: 'Test App', environment: { id: 'env-123' } },
    })
    mockUseAlertRules.mockReturnValue({
      data: [],
      isFetched: true,
    })
    mockUseAlertRulesGhosted.mockReturnValue({
      data: [],
      isFetched: true,
    })
    mockUseDeleteAlertRule.mockReturnValue({
      mutate: jest.fn(),
    })
  })

  it('should render alerting page header', () => {
    renderWithProviders(<ServiceAlerting />)

    expect(screen.getByRole('heading', { name: 'Alert rules' })).toBeInTheDocument()
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
    mockUseAlertRulesGhosted.mockReturnValue({
      data: [],
      isFetched: true,
    })

    renderWithProviders(<ServiceAlerting />)

    expect(screen.getByText('CPU Alert')).toBeInTheDocument()
    expect(screen.getByText('Memory Alert')).toBeInTheDocument()
  })

  it('should display correct status for different alert states', () => {
    const alertRules = [
      createAlertRule({ id: 'alert-1', name: 'Firing Alert', state: AlertRuleState.NOTIFIED }),
      createAlertRule({ id: 'alert-2', name: 'Suppressed Alert', state: AlertRuleState.SUPPRESSED }),
      createAlertRule({ id: 'alert-3', name: 'OK Alert', state: AlertRuleState.OK }),
    ]
    mockUseAlertRules.mockReturnValue({
      data: alertRules,
      isFetched: true,
    })
    mockUseAlertRulesGhosted.mockReturnValue({
      data: [],
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
    mockUseAlertRulesGhosted.mockReturnValue({
      data: [],
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
