import { type BudgetPolicy } from '@qovery/domains/cost-management/data-access'
import { BlockContent, Icon, Tooltip } from '@qovery/shared/ui'
import { formatCost } from '../utils/format-cost'

export interface CostPolicyThresholdsProps {
  policy: BudgetPolicy
  /**
   * Current forecast, when the policy is shown for a specific project. Marks the
   * thresholds that project has already crossed. Omitted on the organization
   * view, where the policy is shown as a template.
   */
  forecast?: number
}

/** Thresholds are set once at the organization level, so they are read-only here. */
export function CostPolicyThresholds({ policy, forecast }: CostPolicyThresholdsProps) {
  const forecastPercent = forecast !== undefined ? (forecast / policy.monthlyLimit) * 100 : undefined

  return (
    <BlockContent
      title="Budget policy"
      headRight={
        <Tooltip content="Inherited from an organization-level policy. Edited by the platform team.">
          <span className="flex items-center gap-1.5 text-xs text-neutral-subtle">
            <Icon iconName="lock" iconStyle="regular" />
            {policy.name} · {formatCost(policy.monthlyLimit, policy.currency)} / month
          </span>
        </Tooltip>
      }
      classNameContent="p-0"
    >
      <ul>
        {policy.thresholds.map((threshold) => {
          const reached = forecastPercent !== undefined && forecastPercent >= threshold.percent

          return (
            <li
              key={threshold.percent}
              className="flex items-start gap-3 border-b border-neutral px-4 py-3 last:border-b-0"
            >
              <span className="w-10 shrink-0 font-mono text-sm text-neutral">{threshold.percent}%</span>
              <span className="text-sm text-neutral-subtle">{threshold.action}</span>
              {reached && (
                <span className="ml-auto flex shrink-0 items-center gap-1.5 text-xs text-warning">
                  <Icon iconName="triangle-exclamation" iconStyle="regular" />
                  Reached
                </span>
              )}
            </li>
          )
        })}
      </ul>
    </BlockContent>
  )
}

export default CostPolicyThresholds
