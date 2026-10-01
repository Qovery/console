import { useParams } from '@tanstack/react-router'
import { type AlertRuleResponse } from 'qovery-typescript-axios'
import { type AnyService } from '@qovery/domains/services/data-access'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import * as useAlertRulesGhosted from '../../hooks/use-alert-rules-ghosted/use-alert-rules-ghosted'
import * as useAlertRules from '../../hooks/use-alert-rules/use-alert-rules'
import * as useDeleteAlertRule from '../../hooks/use-delete-alert-rule/use-delete-alert-rule'
import { AlertRulesOverview } from './alert-rules-overview'

const mockUseAlertRules = jest.spyOn(useAlertRules, 'useAlertRules') as jest.Mock
const mockUseAlertRulesGhosted = jest.spyOn(useAlertRulesGhosted, 'useAlertRulesGhosted') as jest.Mock
const mockUseDeleteAlertRule = jest.spyOn(useDeleteAlertRule, 'useDeleteAlertRule') as jest.Mock

describe('AlertRulesOverview', () => {
  const mockDeleteAlertRule = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    jest.mocked(useParams).mockReturnValue({ organizationId: 'org-123', projectId: 'project-1' })
    mockUseDeleteAlertRule.mockReturnValue({
      mutate: mockDeleteAlertRule,
    })
  })

  it('should render loader when loading', () => {
    mockUseAlertRules.mockReturnValue({
      data: [],
      isFetched: false,
    })
    mockUseAlertRulesGhosted.mockReturnValue({
      data: [],
      isFetched: false,
    })

    const { container } = renderWithProviders(<AlertRulesOverview organizationId="org-123" />)

    expect(container.querySelector('.animate-spin')).toBeInTheDocument()
  })

  it('should render empty state when no alert rules exist', () => {
    mockUseAlertRules.mockReturnValue({
      data: [],
      isFetched: true,
    })
    mockUseAlertRulesGhosted.mockReturnValue({
      data: [],
      isFetched: true,
    })

    renderWithProviders(<AlertRulesOverview organizationId="org-123" />)

    expect(screen.getByText('No alerts created for this organization')).toBeInTheDocument()
  })

  it('should render table with alert rules when they exist', () => {
    const alertRules = [
      {
        id: 'rule-1',
        name: 'High CPU Alert',
        state: 'MONITORING',
        severity: 'MEDIUM',
        enabled: true,
        is_up_to_date: true,
        source: 'MANAGED',
        target: {
          target_type: 'APPLICATION',
          service: {
            id: 'service-1',
            name: 'My Service',
            project_id: 'project-1',
            environment_id: 'env-1',
          },
        },
      },
      {
        id: 'rule-2',
        name: 'Memory Alert',
        state: 'NOTIFIED',
        severity: 'CRITICAL',
        enabled: true,
        is_up_to_date: true,
        source: 'MANAGED',
        target: {
          target_type: 'APPLICATION',
          service: {
            id: 'service-2',
            name: 'Another Service',
            project_id: 'project-1',
            environment_id: 'env-1',
          },
        },
      },
    ] as unknown as AlertRuleResponse[]

    mockUseAlertRules.mockReturnValue({
      data: alertRules,
      isFetched: true,
    })
    mockUseAlertRulesGhosted.mockReturnValue({
      data: [],
      isFetched: true,
    })

    renderWithProviders(<AlertRulesOverview organizationId="org-123" />)

    expect(screen.getByText('High CPU Alert')).toBeInTheDocument()
    expect(screen.getByText('Memory Alert')).toBeInTheDocument()
    expect(screen.getByText('Monitoring')).toBeInTheDocument()
    expect(screen.getByText('Firing')).toBeInTheDocument()
  })

  it('should filter alert rules by name', () => {
    const alertRules = [
      {
        id: 'rule-1',
        name: 'High CPU Alert',
        state: 'MONITORING',
        severity: 'MEDIUM',
        enabled: true,
        is_up_to_date: true,
        source: 'MANAGED',
        target: { target_type: 'APPLICATION' },
      },
      {
        id: 'rule-2',
        name: 'Memory Alert',
        state: 'MONITORING',
        severity: 'CRITICAL',
        enabled: true,
        is_up_to_date: true,
        source: 'MANAGED',
        target: { target_type: 'APPLICATION' },
      },
    ] as unknown as AlertRuleResponse[]

    mockUseAlertRules.mockReturnValue({
      data: alertRules,
      isFetched: true,
    })
    mockUseAlertRulesGhosted.mockReturnValue({
      data: [],
      isFetched: true,
    })

    renderWithProviders(<AlertRulesOverview organizationId="org-123" filter="CPU" />)

    expect(screen.getByText('High CPU Alert')).toBeInTheDocument()
    expect(screen.queryByText('Memory Alert')).not.toBeInTheDocument()
  })

  it('shows a cluster alert without a service link or an edit action', () => {
    const dbInstance = 'z04d06b19-postgresql'
    mockUseAlertRules.mockReturnValue({
      data: [
        {
          id: 'rule-1',
          name: 'High CPU Alert',
          state: 'MONITORING',
          severity: 'MEDIUM',
          enabled: true,
          is_up_to_date: true,
          source: 'MANAGED',
          cluster_id: 'cluster-1',
          target: { target_id: 'cluster-1', target_type: 'CLUSTER', service: null },
          condition: {
            kind: 'CUSTOM',
            promql: `aws_rds_cpuutilization_average{dimension_DBInstanceIdentifier="${dbInstance}"} > 80`,
          },
        },
        {
          id: 'rule-2',
          name: 'Backend CPU Alert',
          state: 'MONITORING',
          severity: 'MEDIUM',
          enabled: true,
          is_up_to_date: true,
          source: 'MANAGED',
          cluster_id: 'cluster-1',
          target: {
            target_id: 'app-1',
            target_type: 'APPLICATION',
            service: {
              id: 'app-1',
              name: 'backend',
              service_type: 'APPLICATION',
              project_id: 'project-1',
              environment_id: 'env-1',
            },
          },
          condition: { kind: 'BUILT', promql: 'container_cpu' },
        },
      ] as AlertRuleResponse[],
      isFetched: true,
    })
    mockUseAlertRulesGhosted.mockReturnValue({ data: [], isFetched: true })

    renderWithProviders(<AlertRulesOverview organizationId="org-123" />)

    expect(screen.getByText('High CPU Alert')).toBeInTheDocument()
    expect(screen.getByText('Cluster')).toBeInTheDocument()
    // Only the service-targeted rule has the route parameters needed to open the edit page.
    expect(document.querySelectorAll('.fa-pen')).toHaveLength(1)
  })

  it('keeps the edit action on a service page when the API omits the nested service', () => {
    mockUseAlertRules.mockReturnValue({
      data: [
        {
          id: 'rule-1',
          name: 'RDS CPU Alert',
          state: 'MONITORING',
          severity: 'MEDIUM',
          enabled: true,
          is_up_to_date: true,
          source: 'MANAGED',
          cluster_id: 'cluster-1',
          target: { target_id: 'service-1', target_type: 'TERRAFORM' },
          condition: { kind: 'BUILT', promql: 'rds_query' },
        },
      ] as AlertRuleResponse[],
      isFetched: true,
    })
    mockUseAlertRulesGhosted.mockReturnValue({ data: [], isFetched: true })

    renderWithProviders(
      <AlertRulesOverview
        organizationId="org-123"
        service={{ id: 'service-1', environment: { id: 'env-1' } } as AnyService}
      />
    )

    expect(screen.getByText('RDS CPU Alert')).toBeInTheDocument()
    expect(document.querySelectorAll('.fa-pen')).toHaveLength(1)
  })
})
