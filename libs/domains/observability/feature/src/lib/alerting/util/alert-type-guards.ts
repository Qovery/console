import {
  type AlertRuleListResultsInner,
  type AlertRuleResponse,
  AlertTargetType,
  type GhostAlertRuleResponse,
} from 'qovery-typescript-axios'
import { isRdsMetricCategory } from '../alerting-creation-flow/rds-alert-metrics'

export function isManagedAlertRule(rule: AlertRuleListResultsInner): rule is AlertRuleResponse & { source: 'MANAGED' } {
  return rule.source === 'MANAGED'
}

export function isGhostAlertRule(
  rule: AlertRuleListResultsInner
): rule is GhostAlertRuleResponse & { source: 'GHOST' } {
  return rule.source === 'GHOST'
}

/** A rule on a cluster or an environment has no service, so it cannot be edited or cloned from a service page. */
export function isServiceAlertRule(rule: Pick<AlertRuleResponse, 'target'>): boolean {
  const targetType = rule.target?.target_type
  return (
    targetType === AlertTargetType.APPLICATION ||
    targetType === AlertTargetType.CONTAINER ||
    targetType === AlertTargetType.JOB ||
    targetType === AlertTargetType.CRONJOB ||
    targetType === AlertTargetType.HELM ||
    targetType === AlertTargetType.TERRAFORM
  )
}

/** RDS queries are tied to one database instance and cluster rules to no service, so neither can be cloned. */
export function canCloneAlertRule(rule: Pick<AlertRuleResponse, 'tag' | 'target'>): boolean {
  return isServiceAlertRule(rule) && !isRdsMetricCategory(rule.tag)
}
