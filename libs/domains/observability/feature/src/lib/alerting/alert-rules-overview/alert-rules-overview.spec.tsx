import { type AlertRuleResponse } from 'qovery-typescript-axios'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import * as useAlertRules from '../../hooks/use-alert-rules/use-alert-rules'
import * as useDeleteAlertRule from '../../hooks/use-delete-alert-rule/use-delete-alert-rule'
import { AlertRulesOverview } from './alert-rules-overview'

const mockUseAlertRules = jest.spyOn(useAlertRules, 'useAlertRules') as jest.Mock
const mockUseDeleteAlertRule = jest.spyOn(useDeleteAlertRule, 'useDeleteAlertRule') as jest.Mock

describe('AlertRulesOverview', () => {
  const mockDeleteAlertRule = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseDeleteAlertRule.mockReturnValue({
      mutate: mockDeleteAlertRule,
    })
  })

  it('should render loader when loading', () => {
    mockUseAlertRules.mockReturnValue({
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
        target: { target_type: 'APPLICATION' },
      },
      {
        id: 'rule-2',
        name: 'Memory Alert',
        state: 'MONITORING',
        severity: 'CRITICAL',
        enabled: true,
        is_up_to_date: true,
        target: { target_type: 'APPLICATION' },
      },
    ] as unknown as AlertRuleResponse[]

    mockUseAlertRules.mockReturnValue({
      data: alertRules,
      isFetched: true,
    })

    renderWithProviders(<AlertRulesOverview organizationId="org-123" filter="CPU" />)

    expect(screen.getByText('High CPU Alert')).toBeInTheDocument()
    expect(screen.queryByText('Memory Alert')).not.toBeInTheDocument()
  })
})
