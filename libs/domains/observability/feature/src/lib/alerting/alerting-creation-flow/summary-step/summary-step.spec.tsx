import { type AlertSeverity } from 'qovery-typescript-axios'
import { type ReactNode } from 'react'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { AlertingCreationFlowContext } from '../alerting-creation-flow'
import { type AlertConfiguration } from '../alerting-creation-flow.types'
import { SummaryStep } from './summary-step'

const mockMutateAsync = jest.fn()

jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useNavigate: () => jest.fn(),
  useParams: () => ({ organizationId: 'org-123', serviceId: 'service-123' }),
  useRouterState: ({ select }: { select: (state: { location: { pathname: string; searchStr: string } }) => unknown }) =>
    select({ location: { pathname: '/summary', searchStr: '' } }),
}))

jest.mock('@qovery/domains/services/feature', () => ({
  ...jest.requireActual('@qovery/domains/services/feature'),
  useService: () => ({
    data: {
      id: 'service-123',
      name: 'My Service',
      serviceType: 'APPLICATION',
      environment: { id: 'env-123' },
    },
  }),
}))

jest.mock('@qovery/domains/environments/feature', () => ({
  ...jest.requireActual('@qovery/domains/environments/feature'),
  useEnvironment: () => ({
    data: { id: 'env-123', cluster_id: 'cluster-123' },
  }),
}))

jest.mock('../../../hooks/use-create-alert-rule/use-create-alert-rule', () => ({
  ...jest.requireActual('../../../hooks/use-create-alert-rule/use-create-alert-rule'),
  useCreateAlertRule: () => ({ mutateAsync: mockMutateAsync }),
}))

const createAlert = (overrides: Partial<AlertConfiguration> = {}): AlertConfiguration => ({
  id: 'alert-1',
  name: 'CPU Alert',
  tag: 'CPU',
  for_duration: 'PT5M',
  condition: { kind: 'BUILT', function: 'AVG', operator: 'ABOVE', threshold: 80, promql: '' },
  severity: 'CRITICAL' as AlertSeverity,
  alert_receiver_ids: ['channel-1'],
  presentation: { summary: 'My description' },
  skipped: false,
  ...overrides,
})

const renderWithContext = (alerts: AlertConfiguration[], selectedMetrics: string[] = ['cpu']) => {
  const mockSetCurrentStepIndex = jest.fn()
  const mockSetAlerts = jest.fn()
  const mockOnComplete = jest.fn()

  const Wrapper = ({ children }: { children: ReactNode }) => (
    <AlertingCreationFlowContext.Provider
      value={{
        organizationId: 'org-123',
        selectedMetrics,
        serviceId: 'service-123',
        serviceName: 'My Service',
        currentStepIndex: 0,
        setCurrentStepIndex: mockSetCurrentStepIndex,
        alerts,
        setAlerts: mockSetAlerts,
        onNavigateToMetric: jest.fn(),
        onComplete: mockOnComplete,
        totalSteps: selectedMetrics.length + 1,
        containerName: 'container-1',
        isLoading: false,
      }}
    >
      {children}
    </AlertingCreationFlowContext.Provider>
  )

  return renderWithProviders(
    <Wrapper>
      <SummaryStep />
    </Wrapper>
  )
}

describe('SummaryStep', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render summary with service name and alerts', () => {
    renderWithContext([createAlert()])

    expect(screen.getByText('Summary')).toBeInTheDocument()
    expect(screen.getByText('My Service')).toBeInTheDocument()
    expect(screen.getByText('Target service')).toBeInTheDocument()
    expect(screen.getByText('Alerts included in creation (1)')).toBeInTheDocument()
    expect(screen.getByText('CPU Alert')).toBeInTheDocument()
  })

  it('should render multiple alerts', () => {
    renderWithContext(
      [
        createAlert({ id: 'alert-1', name: 'CPU Alert', tag: 'cpu' }),
        createAlert({ id: 'alert-2', name: 'Memory Alert', tag: 'memory' }),
      ],
      ['cpu', 'memory']
    )

    expect(screen.getByText('Alerts included in creation (2)')).toBeInTheDocument()
    expect(screen.getByText('CPU Alert')).toBeInTheDocument()
    expect(screen.getByText('Memory Alert')).toBeInTheDocument()
  })

  it('should render skipped alerts separately', () => {
    renderWithContext(
      [
        createAlert({ id: 'alert-1', name: 'CPU Alert', skipped: false }),
        createAlert({ id: 'alert-2', name: 'Memory Alert', skipped: true }),
      ],
      ['cpu', 'memory']
    )

    expect(screen.getByText('Alerts included in creation (1)')).toBeInTheDocument()
    expect(screen.getByText('Alerts excluded from creation (1)')).toBeInTheDocument()
    expect(screen.getByText('Memory Alert')).toBeInTheDocument()
  })

  it('should render empty state and disable button when no active alerts', () => {
    renderWithContext([createAlert({ skipped: true })])

    expect(screen.getByText('No alerts included in creation')).toBeInTheDocument()
    expect(screen.getByText(/All alerts were skipped during setup/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /confirm and create/i })).toBeDisabled()
  })

  it('should enable confirm button when active alerts exist', () => {
    renderWithContext([createAlert()])

    expect(screen.getByRole('button', { name: /confirm and create/i })).toBeEnabled()
  })
})
