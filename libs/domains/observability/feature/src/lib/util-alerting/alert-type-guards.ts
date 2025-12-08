import type { AlertRuleListResultsInner, AlertRuleResponse, GhostAlertRuleResponse } from 'qovery-typescript-axios'

/**
 * Type guard to check if an alert rule is a managed alert
 * For backward compatibility: if source field doesn't exist, assume it's a managed alert (old API)
 */
export function isManagedAlertRule(
  rule: AlertRuleListResultsInner | any
): rule is AlertRuleResponse & { source: 'MANAGED' } {
  // If source field doesn't exist, it's the old API format - treat as managed alert
  if (!('source' in rule)) {
    return true
  }
  return rule.source === 'MANAGED'
}

/**
 * Type guard to check if an alert rule is a ghost alert
 */
export function isGhostAlertRule(
  rule: AlertRuleListResultsInner | any
): rule is GhostAlertRuleResponse & { source: 'GHOST' } {
  return 'source' in rule && rule.source === 'GHOST'
}
