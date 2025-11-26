import {
  AlertRuleConditionFunction,
  AlertRuleConditionKind,
  AlertRuleConditionOperator,
  AlertRuleState,
  AlertSeverity,
  AlertTargetType,
} from 'qovery-typescript-axios'
import type { AlertRuleResponse } from 'qovery-typescript-axios'
import { getRuleSummary } from './get-rule-summary'

type AlertOverrides = Partial<Omit<AlertRuleResponse, 'condition' | 'target' | 'presentation'>> & {
  condition?: Partial<AlertRuleResponse['condition']>
  target?: Partial<AlertRuleResponse['target']>
  presentation?: Partial<AlertRuleResponse['presentation']>
}

function createAlert(overrides: AlertOverrides = {}): AlertRuleResponse {
  const baseAlert: AlertRuleResponse = {
    id: 'alert-1',
    created_at: '2024-01-01T00:00:00Z',
    organization_id: 'org-1',
    cluster_id: 'cluster-1',
    name: 'CPU Alert',
    description: 'CPU alert description',
    tag: 'cpu',
    condition: {
      kind: AlertRuleConditionKind.BUILT,
      operator: AlertRuleConditionOperator.ABOVE,
      threshold: 0.8,
      function: AlertRuleConditionFunction.AVG,
      promql: '',
    },
    for_duration: 'PT5M',
    severity: AlertSeverity.MEDIUM,
    enabled: true,
    alert_receiver_ids: [],
    presentation: {},
    target: {
      target_id: 'service-1',
      target_type: AlertTargetType.APPLICATION,
    },
    state: AlertRuleState.TRIGGERED,
    is_up_to_date: true,
  }

  const { condition, presentation, target, ...rest } = overrides

  return {
    ...baseAlert,
    ...rest,
    condition: {
      ...baseAlert.condition,
      ...(condition ?? {}),
    },
    presentation: {
      ...baseAlert.presentation,
      ...(presentation ?? {}),
    },
    target: {
      ...baseAlert.target,
      ...(target ?? {}),
    },
  }
}

describe('getRuleSummary', () => {
  it('formats built-in alert rules into readable summaries', () => {
    const alert = createAlert()

    expect(getRuleSummary(alert)).toBe('CPU > 80% for 5 minutes')
  })

  it('returns the original name for custom alerts', () => {
    const alert = createAlert({
      name: 'Custom alert',
      condition: { kind: AlertRuleConditionKind.CUSTOM },
    })

    expect(getRuleSummary(alert)).toBe('Custom alert')
  })
})
