import { match } from 'ts-pattern'
import {
  type CostOperation,
  type PolicyEvaluation,
  type ProjectCost,
  estimateMonthlyCost,
  flatMonthlyCost,
  monthlyCostPerInstance,
} from '@qovery/domains/cost-management/data-access'
import { budgetEnforcement } from './budget-enforcement'

/**
 * Decides whether an operation is allowed under the project's budget policy.
 *
 * Enforcement runs against the monthly forecast rather than the month-to-date
 * spend: a budget caps what a project costs to run, so an expensive change made
 * late in the month has to answer for its full monthly weight.
 *
 * Pure by design — the same verdict has to come back for the UI, the CLI and an
 * agent asking whether it may proceed.
 */
export function evaluateCostPolicy(cost: ProjectCost, operation: CostOperation): PolicyEvaluation {
  const budget = cost.policy.monthlyLimit
  const currentForecast = cost.forecast

  const base = {
    currentForecast,
    budget,
    currency: cost.policy.currency,
  }

  return match(operation)
    .with({ type: 'scale_service' }, ({ before, after }) => {
      const operationMonthlyCost = estimateMonthlyCost(after)
      const monthlyDelta = operationMonthlyCost - estimateMonthlyCost(before)
      const projectedForecast = currentForecast + monthlyDelta

      // Freeing resources is always allowed, even from an exhausted budget —
      // blocking it would trap the project above its own limit.
      if (monthlyDelta <= 0) {
        return { ...base, allowed: true, operationMonthlyCost, monthlyDelta, projectedForecast }
      }

      // Past the 90% threshold services are frozen at their current size, even
      // when the change would still fit under the limit.
      if (budgetEnforcement(cost) === 'scale_up_blocked') {
        return {
          ...base,
          allowed: false,
          reason: 'project_scale_up_frozen' as const,
          operationMonthlyCost,
          monthlyDelta,
          projectedForecast,
        }
      }

      if (projectedForecast <= budget) {
        return { ...base, allowed: true, operationMonthlyCost, monthlyDelta, projectedForecast }
      }

      return {
        ...base,
        allowed: false,
        reason: 'project_monthly_budget_exceeded' as const,
        operationMonthlyCost,
        monthlyDelta,
        projectedForecast,
        maxAllowedInstances:
          after.instances > before.instances ? maxInstancesWithinBudget({ cost, before, after }) : undefined,
      }
    })
    .with({ type: 'deploy_environment' }, ({ resources }) => {
      const operationMonthlyCost = resources.reduce(
        (total, serviceResources) => total + estimateMonthlyCost(serviceResources),
        0
      )

      // A deploy does not change the run rate of an environment that is already
      // running, so it is gated on the 100% threshold: no new resources once the
      // budget is spent.
      const allowed = currentForecast < budget

      return {
        ...base,
        allowed,
        reason: allowed ? undefined : ('project_monthly_budget_exhausted' as const),
        operationMonthlyCost,
        monthlyDelta: 0,
        projectedForecast: currentForecast,
      }
    })
    .exhaustive()
}

/** Largest instance count for `after` that keeps the forecast within budget. */
function maxInstancesWithinBudget({
  cost,
  before,
  after,
}: {
  cost: ProjectCost
  before: Parameters<typeof estimateMonthlyCost>[0]
  after: Parameters<typeof estimateMonthlyCost>[0]
}): number {
  const perInstance = monthlyCostPerInstance(after)

  if (perInstance <= 0) return after.instances

  const headroom = cost.policy.monthlyLimit - cost.forecast + estimateMonthlyCost(before) - flatMonthlyCost(after)

  return Math.max(0, Math.floor(headroom / perInstance))
}
