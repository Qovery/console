import type { AlertRuleListResultsInner, AlertRuleResponse, GhostAlertRuleResponse } from 'qovery-typescript-axios'

/**
 * Legacy alert rule format without the source discriminator field
 * This represents the old API format before ghost alerts were introduced
 */
type LegacyAlertRuleResponse = Omit<AlertRuleResponse, 'source'>

/**
 * Union type that handles both old and new API formats
 */
type AlertRuleUnion = AlertRuleListResultsInner | LegacyAlertRuleResponse

/**
 * Type guard to check if an alert rule is a managed alert
 * For backward compatibility: if source field doesn't exist, assume it's a managed alert (old API)
 */
export function isManagedAlertRule(rule: AlertRuleUnion): rule is AlertRuleResponse & { source: 'MANAGED' } {
  // If source field doesn't exist, it's the old API format - treat as managed alert
  if (!('source' in rule)) {
    return true
  }
  return rule.source === 'MANAGED'
}

/**
 * Type guard to check if an alert rule is a ghost alert
 */
export function isGhostAlertRule(rule: AlertRuleUnion): rule is GhostAlertRuleResponse & { source: 'GHOST' } {
  return 'source' in rule && rule.source === 'GHOST'
}
