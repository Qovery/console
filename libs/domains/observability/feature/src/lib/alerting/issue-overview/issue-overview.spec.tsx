import { type AlertRuleResponse } from 'qovery-typescript-axios'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import * as useAlerts from '../../hooks/use-alerts/use-alerts'
import { IssueOverview } from './issue-overview'

const mockUseAlerts = jest.spyOn(useAlerts, 'useAlerts') as jest.Mock

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ organizationId: 'org-123' }),
}))

describe('IssueOverview', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render loader when loading', () => {
    mockUseAlerts.mockReturnValue({
      data: [],
      isFetched: false,
    })

    const { container } = renderWithProviders(<IssueOverview />)

    expect(container.querySelector('.animate-spin')).toBeInTheDocument()
  })

  it('should render empty state when no alerts exist', () => {
    mockUseAlerts.mockReturnValue({
      data: [],
      isFetched: true,
    })

    renderWithProviders(<IssueOverview />)

    expect(screen.getByText('All clear, no issues detected!')).toBeInTheDocument()
    expect(screen.getByText('All monitored services are operating within normal thresholds.')).toBeInTheDocument()
  })

  it('should render table with alerts when they exist', () => {
    const alerts: AlertRuleResponse[] = [
      {
        id: 'alert-1',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        organization_id: 'org-123',
        cluster_id: 'cluster-1',
        name: 'High CPU Alert',
        description: 'Alert for high CPU usage',
        tag: 'cpu',
        condition: {
          kind: 'BUILT',
          operator: 'ABOVE',
          threshold: 0.8,
          promql: 'cpu_usage > 0.8',
        },
        for_duration: 'PT5M',
        severity: 'HIGH',
        enabled: true,
        alert_receiver_ids: [],
        presentation: { color: '#FF0000', icon: 'cpu' },
        state: 'NOTIFIED',
        is_up_to_date: true,
        target: {
          target_type: 'APPLICATION',
          target_id: 'service-1',
          service: {
            id: 'service-1',
            name: 'My Service',
            description: 'Service description',
            icon_uri: 'icon-uri',
            service_type: 'APPLICATION',
            project_id: 'project-1',
            project_name: 'Project 1',
            environment_id: 'env-1',
            environment_name: 'Environment 1',
          },
        },
      } as AlertRuleResponse,
      {
        id: 'alert-2',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        organization_id: 'org-123',
        cluster_id: 'cluster-1',
        name: 'Memory Alert',
        description: 'Alert for high memory usage',
        tag: 'memory',
        condition: {
          kind: 'BUILT',
          operator: 'ABOVE',
          threshold: 0.9,
          promql: 'memory_usage > 0.9',
        },
        for_duration: 'PT10M',
        severity: 'CRITICAL',
        enabled: true,
        alert_receiver_ids: [],
        presentation: { color: '#FF0000', icon: 'memory' },
        state: 'NOTIFIED',
        is_up_to_date: true,
        target: {
          target_type: 'CONTAINER',
          target_id: 'service-2',
          service: {
            id: 'service-2',
            name: 'Another Service',
            description: 'Service description',
            icon_uri: 'icon-uri',
            service_type: 'CONTAINER',
            project_id: 'project-2',
            project_name: 'Project 2',
            environment_id: 'env-2',
            environment_name: 'Environment 2',
          },
        },
      } as AlertRuleResponse,
    ]

    mockUseAlerts.mockReturnValue({
      data: alerts,
      isFetched: true,
    })

    renderWithProviders(<IssueOverview />)

    expect(screen.getByText('Issues')).toBeInTheDocument()
    expect(screen.getByText('My Service')).toBeInTheDocument()
    expect(screen.getByText('Another Service')).toBeInTheDocument()
    expect(screen.getByText('High')).toBeInTheDocument()
    expect(screen.getByText('Critical')).toBeInTheDocument()
  })

  it('should display muted icon when alert is disabled', () => {
    const alerts: AlertRuleResponse[] = [
      {
        id: 'alert-1',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        organization_id: 'org-123',
        cluster_id: 'cluster-1',
        name: 'Muted Alert',
        description: 'A muted alert',
        tag: 'cpu',
        condition: {
          kind: 'BUILT',
          operator: 'ABOVE',
          threshold: 0.8,
          promql: 'cpu_usage > 0.8',
        },
        for_duration: 'PT5M',
        severity: 'MEDIUM',
        enabled: false,
        alert_receiver_ids: [],
        presentation: { color: '#FFCC00', icon: 'cpu' },
        state: 'NOTIFIED',
        is_up_to_date: true,
        target: {
          target_type: 'APPLICATION',
          target_id: 'service-1',
          service: {
            id: 'service-1',
            name: 'Muted Service',
            description: 'Service description',
            icon_uri: 'icon-uri',
            service_type: 'APPLICATION',
            project_id: 'project-1',
            project_name: 'Project 1',
            environment_id: 'env-1',
            environment_name: 'Environment 1',
          },
        },
      } as AlertRuleResponse,
    ]

    mockUseAlerts.mockReturnValue({
      data: alerts,
      isFetched: true,
    })

    const { container } = renderWithProviders(<IssueOverview />)

    expect(container.querySelector('.fa-bell-slash')).toBeInTheDocument()
  })
})
