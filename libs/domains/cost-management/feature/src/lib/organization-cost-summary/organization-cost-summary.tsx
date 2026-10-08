import { type ProjectCost } from '@qovery/domains/cost-management/data-access'
import { Icon } from '@qovery/shared/ui'
import { PRODUCTION_EXEMPTION_NOTE } from '../utils/budget-enforcement'
import { formatCost } from '../utils/format-cost'

export interface OrganizationCostSummaryProps {
  costs: ProjectCost[]
}

/**
 * Headline figures a platform team reads before the table.
 *
 * Each tile spells out what it counts. A number on its own invites the question
 * "what does that mean?", which is exactly the friction this view exists to remove.
 */
export function OrganizationCostSummary({ costs }: OrganizationCostSummaryProps) {
  const currency = costs[0]?.policy.currency ?? 'USD'
  const allocated = costs.reduce((total, cost) => total + cost.policy.monthlyLimit, 0)
  const forecast = costs.reduce((total, cost) => total + cost.forecast, 0)
  const overBudget = costs.filter((cost) => cost.forecast > cost.policy.monthlyLimit)
  const headroom = allocated - forecast

  return (
    <dl className="mb-5 grid grid-cols-3 gap-4">
      <div className="rounded border border-neutral bg-surface-neutral-subtle p-4">
        <dt className="text-sm text-neutral">Authorized to spend</dt>
        <dd className="mt-1 font-mono text-2xl text-neutral">{formatCost(allocated, currency)}</dd>
        <p className="mt-2 text-xs text-neutral-subtle">
          Sum of the monthly budgets of {costs.length} {costs.length === 1 ? 'project' : 'projects'}. Spending beyond
          this needs an approval.
        </p>
      </div>

      <div className="rounded border border-neutral bg-surface-neutral-subtle p-4">
        <dt className="text-sm text-neutral">On track to spend</dt>
        <dd className="mt-1 font-mono text-2xl text-neutral">{formatCost(forecast, currency)}</dd>
        <p className="mt-2 text-xs text-neutral-subtle">
          {headroom >= 0
            ? `What these projects cost over a full month at today's run rate. ${formatCost(headroom, currency)} of headroom left.`
            : `What these projects cost over a full month at today's run rate, ${formatCost(Math.abs(headroom), currency)} above what is authorized.`}
        </p>
      </div>

      <div className="rounded border border-neutral bg-surface-neutral-subtle p-4">
        <dt className="text-sm text-neutral">Past their limit</dt>
        <dd className="mt-1 flex items-baseline gap-2 font-mono text-2xl text-neutral">
          {overBudget.length}
          {overBudget.length > 0 && (
            <Icon iconName="triangle-exclamation" iconStyle="regular" className="text-base text-negative" />
          )}
        </dd>
        <p className="mt-2 text-xs text-neutral-subtle">
          {overBudget.length === 0
            ? 'Every project is running within its budget.'
            : `New resources are blocked on ${overBudget.length === 1 ? 'this project' : 'these projects'}. ${PRODUCTION_EXEMPTION_NOTE}`}
        </p>
      </div>
    </dl>
  )
}

export default OrganizationCostSummary
