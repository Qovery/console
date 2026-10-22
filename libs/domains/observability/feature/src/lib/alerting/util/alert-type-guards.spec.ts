import { type AlertRuleResponse } from 'qovery-typescript-axios'
import { canCloneAlertRule, isServiceAlertRule } from './alert-type-guards'

const rule = (tag: string, targetType: string) =>
  ({ tag, target: { target_id: 'target-1', target_type: targetType } }) as unknown as AlertRuleResponse

describe('alert rule guards', () => {
  it.each([
    ['APPLICATION', true],
    ['CONTAINER', true],
    ['JOB', true],
    ['CRONJOB', true],
    ['HELM', true],
    ['TERRAFORM', true],
    ['CLUSTER', false],
    [' CLUSTER', false],
    ['ENVIRONMENT', false],
    ['UNKNOWN', false],
  ])('treats a %s target as a service: %s', (targetType, expected) => {
    expect(isServiceAlertRule(rule('cpu', targetType))).toBe(expected)
  })

  it('rejects an alert without a target', () => {
    expect(isServiceAlertRule({ target: undefined })).toBe(false)
  })

  it('only clones service rules that are not tied to an RDS instance', () => {
    expect(canCloneAlertRule(rule('cpu', 'APPLICATION'))).toBe(true)
    expect(canCloneAlertRule(rule('rds_cpu', 'TERRAFORM'))).toBe(false)
    // Hand-written cluster rules can carry a generic tag while querying one RDS instance.
    expect(canCloneAlertRule(rule('cpu', 'CLUSTER'))).toBe(false)
  })
})
