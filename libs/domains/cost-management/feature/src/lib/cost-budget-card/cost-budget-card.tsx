import { type ProjectCost } from '@qovery/domains/cost-management/data-access'
import { BlockContent, Icon, ProgressBar, Tooltip } from '@qovery/shared/ui'
import { dateFullFormat } from '@qovery/shared/util-dates'
import { budgetConsumption, percentOfLimit } from '../utils/budget-enforcement'
import { formatCost } from '../utils/format-cost'

export interface CostBudgetCardProps {
  cost: ProjectCost
}

/** Bar colour follows the threshold the project has crossed. */
function progressColor(percent: number): string {
  if (percent >= 100) return 'var(--negative-9)'
  if (percent >= 90) return 'var(--warning-9)'
  return 'var(--brand-9)'
}

export function CostBudgetCard({ cost }: CostBudgetCardProps) {
  const { policy, estimatedSpend, forecast, resetsOn } = cost
  const { monthlyLimit, currency } = policy

  const consumedPercent = percentOfLimit(estimatedSpend, monthlyLimit)
  const forecastPercent = budgetConsumption(cost)

  return (
    <BlockContent title="Monthly budget" classNameContent="p-4">
      <div className="flex items-baseline gap-2">
        <span className="font-mono text-2xl text-neutral">{formatCost(estimatedSpend, currency)}</span>
        <span className="text-sm text-neutral-subtle">of {formatCost(monthlyLimit, currency)}</span>
      </div>

      <ProgressBar.Root mode="absolute" className="mt-4">
        <ProgressBar.Cell value={Math.min(100, consumedPercent)} color={progressColor(consumedPercent)} />
      </ProgressBar.Root>

      <div className="mt-2 flex justify-between text-xs text-neutral-subtle">
        <span>{Math.round(consumedPercent)}% consumed month-to-date</span>
        <span>Resets on {dateFullFormat(resetsOn, undefined, 'MMM d, yyyy')}</span>
      </div>

      <dl className="mt-4 grid grid-cols-3 gap-4 border-t border-neutral pt-4 text-sm">
        <div>
          <dt className="flex items-center gap-1.5 text-neutral-subtle">
            Estimated spend
            <Tooltip content="Computed from running resources. Updates within minutes.">
              <span className="flex">
                <Icon iconName="circle-info" iconStyle="regular" className="text-xs" />
              </span>
            </Tooltip>
          </dt>
          <dd className="mt-1 font-mono text-neutral">{formatCost(estimatedSpend, currency)}</dd>
        </div>
        <div>
          <dt className="flex items-center gap-1.5 text-neutral-subtle">
            Billed spend
            <Tooltip content="Appears once a cloud billing account is connected in Cost data.">
              <span className="flex">
                <Icon iconName="circle-info" iconStyle="regular" className="text-xs" />
              </span>
            </Tooltip>
          </dt>
          <dd className="mt-1 text-neutral-subtle">Not connected</dd>
        </div>
        <div>
          <dt className="flex items-center gap-1.5 text-neutral-subtle">
            Forecast
            <Tooltip content="What the project costs over a full month at its current run rate. Budget policy is enforced against this figure.">
              <span className="flex">
                <Icon iconName="circle-info" iconStyle="regular" className="text-xs" />
              </span>
            </Tooltip>
          </dt>
          <dd className="mt-1 font-mono text-neutral">
            {formatCost(forecast, currency)}
            {forecastPercent >= 90 && (
              <span className="ml-2 text-xs text-warning">{Math.round(forecastPercent)}% of budget</span>
            )}
          </dd>
        </div>
      </dl>
    </BlockContent>
  )
}

export default CostBudgetCard
