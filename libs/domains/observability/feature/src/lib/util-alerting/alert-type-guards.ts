import type { AlertRuleListResultsInner, AlertRuleResponse, GhostAlertRuleResponse } from 'qovery-typescript-axios'

export function isManagedAlertRule(rule: AlertRuleListResultsInner): rule is AlertRuleResponse & { source: 'MANAGED' } {
  return rule.source === 'MANAGED'
}

export function isGhostAlertRule(
  rule: AlertRuleListResultsInner
): rule is GhostAlertRuleResponse & { source: 'GHOST' } {
  return rule.source === 'GHOST'
}
