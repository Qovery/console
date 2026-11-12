import { type BudgetEnforcement, type ProjectCost } from '@qovery/domains/cost-management/data-access'

/** An amount as a percentage of a monthly limit. */
export function percentOfLimit(amount: number, monthlyLimit: number): number {
  return (amount / monthlyLimit) * 100
}

/** Forecast as a percentage of the monthly limit — the figure every threshold reads. */
export function budgetConsumption(cost: ProjectCost): number {
  return percentOfLimit(cost.forecast, cost.policy.monthlyLimit)
}

/** What the policy is doing to a project right now, given its forecast. */
export function budgetEnforcement(cost: ProjectCost): BudgetEnforcement {
  const percent = budgetConsumption(cost)

  if (percent >= 100) return 'new_resources_blocked'
  if (percent >= 90) return 'scale_up_blocked'
  if (percent >= 70) return 'owner_notified'
  return 'none'
}

export const BUDGET_ENFORCEMENT_LABELS: Record<BudgetEnforcement, string> = {
  none: '—',
  owner_notified: 'Owner notified',
  scale_up_blocked: 'Scale-up blocked',
  new_resources_blocked: 'New resources blocked',
}

/**
 * Why a project can sit over budget instead of being switched off.
 *
 * Suspension only ever reaches non-production environments, so a project whose
 * spend is concentrated in production stays over its limit by design.
 */
export const PRODUCTION_EXEMPTION_NOTE =
  'Production environments are never suspended, so a project can stay over budget while new resources are blocked.'
