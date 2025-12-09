import type { AlertRuleListResultsInner, AlertRuleResponse, GhostAlertRuleResponse } from 'qovery-typescript-axios'

/**
 * Type guard to check if an alert rule is a managed alert
 */
export function isManagedAlertRule(rule: AlertRuleListResultsInner): rule is AlertRuleResponse & { source: 'MANAGED' } {
  return rule.source === 'MANAGED'
}

/**
 * Type guard to check if an alert rule is a ghost alert
 */
export function isGhostAlertRule(
  rule: AlertRuleListResultsInner
): rule is GhostAlertRuleResponse & { source: 'GHOST' } {
  return rule.source === 'GHOST'
}
